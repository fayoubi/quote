import { Pool } from 'pg';
import { Product, Quote, RateTable } from '../models/types.js';

export class DatabaseService {
  private pool: Pool;

  constructor() {
    this.pool = new Pool({
      connectionString: process.env.DATABASE_URL,
      host: process.env.DB_HOST,
      port: parseInt(process.env.DB_PORT || '5432'),
      database: process.env.DB_NAME,
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      max: 20,
      idleTimeoutMillis: 30000,
      connectionTimeoutMillis: 2000,
    });
  }

  async healthCheck(): Promise<void> {
    const client = await this.pool.connect();
    try {
      await client.query('SELECT 1');
    } finally {
      client.release();
    }
  }

  async getProducts(): Promise<Product[]> {
    const client = await this.pool.connect();
    try {
      const result = await client.query(
        'SELECT * FROM products WHERE is_active = true ORDER BY product_type'
      );
      return result.rows;
    } finally {
      client.release();
    }
  }

  async getProduct(productType: string): Promise<Product | null> {
    const client = await this.pool.connect();
    try {
      const result = await client.query(
        'SELECT * FROM products WHERE product_type = $1',
        [productType]
      );
      return result.rows[0] || null;
    } finally {
      client.release();
    }
  }

  async saveQuote(quote: Quote): Promise<void> {
    const client = await this.pool.connect();
    try {
      await client.query(
        `INSERT INTO quotes (quote_id, product_type, applicant_data, pricing_result, eligibility_flags, created_at, expires_at)
         VALUES ($1, $2, $3, $4, $5, $6, $7)`,
        [
          quote.quote_id,
          quote.product_type,
          JSON.stringify(quote.applicant_data),
          JSON.stringify(quote.pricing_result),
          JSON.stringify(quote.eligibility_flags),
          quote.created_at,
          quote.expires_at
        ]
      );
    } finally {
      client.release();
    }
  }

  async getQuote(quoteId: string): Promise<Quote | null> {
    const client = await this.pool.connect();
    try {
      const result = await client.query(
        'SELECT * FROM quotes WHERE quote_id = $1',
        [quoteId]
      );

      if (result.rows.length === 0) {
        return null;
      }

      const row = result.rows[0];
      return {
        quote_id: row.quote_id,
        product_type: row.product_type,
        applicant_data: row.applicant_data,
        pricing_result: row.pricing_result,
        eligibility_flags: row.eligibility_flags,
        created_at: row.created_at,
        expires_at: row.expires_at
      };
    } finally {
      client.release();
    }
  }

  async deleteExpiredQuotes(): Promise<number> {
    const client = await this.pool.connect();
    try {
      const result = await client.query(
        'DELETE FROM quotes WHERE expires_at < NOW()'
      );
      return result.rowCount || 0;
    } finally {
      client.release();
    }
  }

  async getRateTable(
    productType: string,
    riskClass: string,
    gender: string,
    age: number,
    termLength?: number
  ): Promise<RateTable | null> {
    const client = await this.pool.connect();
    try {
      let query = `
        SELECT * FROM rate_tables
        WHERE product_type = $1
          AND risk_class = $2
          AND gender = $3
          AND age_min <= $4
          AND age_max >= $4
          AND (expiry_date IS NULL OR expiry_date > CURRENT_DATE)
      `;
      const params = [productType, riskClass, gender, age];

      if (termLength !== undefined) {
        query += ' AND term_length = $5';
        params.push(termLength.toString());
      }

      query += ' ORDER BY effective_date DESC LIMIT 1';

      const result = await client.query(query, params);
      return result.rows[0] || null;
    } finally {
      client.release();
    }
  }

  async close(): Promise<void> {
    await this.pool.end();
  }
}