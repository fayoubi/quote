import pool from '../config/database.js';

class CustomerService {
  async findOrCreate(customerData) {
    const { cin, first_name, last_name, middle_name, date_of_birth, email, phone, address } = customerData;

    // Try to find existing customer by CIN
    const existingQuery = 'SELECT * FROM customers WHERE cin = $1';
    const existingResult = await pool.query(existingQuery, [cin]);

    if (existingResult.rows.length > 0) {
      return existingResult.rows[0];
    }

    // Create new customer
    const insertQuery = `
      INSERT INTO customers (cin, first_name, last_name, middle_name, date_of_birth, email, phone, address)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
      RETURNING *
    `;

    const result = await pool.query(insertQuery, [
      cin,
      first_name,
      last_name,
      middle_name || null,
      date_of_birth,
      email,
      phone || null,
      JSON.stringify(address),
    ]);

    return result.rows[0];
  }

  async getById(customerId) {
    const query = 'SELECT * FROM customers WHERE id = $1';
    const result = await pool.query(query, [customerId]);
    return result.rows[0] || null;
  }

  async update(customerId, customerData) {
    const { first_name, last_name, middle_name, email, phone, address } = customerData;

    const query = `
      UPDATE customers
      SET first_name = $1, last_name = $2, middle_name = $3, email = $4, phone = $5, address = $6, updated_at = CURRENT_TIMESTAMP
      WHERE id = $7
      RETURNING *
    `;

    const result = await pool.query(query, [
      first_name,
      last_name,
      middle_name || null,
      email,
      phone || null,
      JSON.stringify(address),
      customerId,
    ]);

    return result.rows[0] || null;
  }
}

export default new CustomerService();