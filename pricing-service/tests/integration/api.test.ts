import request from 'supertest';
import app from '../../src/index.js';
import { ProductType, Gender } from '../../src/models/types.js';

describe('API Integration Tests', () => {
  describe('GET /', () => {
    it('should return service information', async () => {
      const response = await request(app)
        .get('/')
        .expect(200);

      expect(response.body).toMatchObject({
        service: 'Pricing Service',
        version: '1.0.0',
        environment: 'test'
      });
    });
  });

  describe('GET /api/v1/health', () => {
    it('should return basic health check', async () => {
      const response = await request(app)
        .get('/api/v1/health')
        .expect(200);

      expect(response.body.status).toBe('healthy');
      expect(response.body.timestamp).toBeDefined();
      expect(response.body.uptime).toBeGreaterThan(0);
    });
  });

  describe('GET /api/v1/health/deep', () => {
    it('should return deep health check', async () => {
      const response = await request(app)
        .get('/api/v1/health/deep')
        .expect(200);

      expect(response.body.status).toBe('healthy');
      expect(response.body.checks).toBeDefined();
      expect(response.body.checks.database).toBeDefined();
      expect(response.body.checks.redis).toBeDefined();
      expect(response.body.checks.featureFlags).toBeDefined();
    });
  });

  describe('GET /api/v1/products', () => {
    it('should return available products', async () => {
      const response = await request(app)
        .get('/api/v1/products')
        .expect(200);

      expect(response.body.products).toBeDefined();
      expect(Array.isArray(response.body.products)).toBe(true);
    });
  });

  describe('POST /api/v1/quotes/calculate', () => {
    const validQuoteRequest = {
      productType: 'term_life',
      applicant: {
        gender: 'Male',
        birthDate: '1985-03-15',
        height: 180,
        weight: 75,
        city: 'Casablanca',
        usesNicotine: false
      },
      policy: {
        termLength: 20,
        coverageAmount: 500000
      }
    };

    it('should calculate quote for valid request', async () => {
      const response = await request(app)
        .post('/api/v1/quotes/calculate')
        .send(validQuoteRequest)
        .expect(200);

      expect(response.body.quote).toBeDefined();
      expect(response.body.quote.quoteId).toMatch(/^quote_term_/);
      expect(response.body.quote.productType).toBe('term_life');
      expect(response.body.quote.pricing.monthlyPremium).toBeGreaterThan(0);
      expect(response.body.quote.pricing.annualPremium).toBeGreaterThan(0);
      expect(response.body.quote.riskAssessment).toBeDefined();
      expect(response.body.quote.eligibilityFlags).toBeDefined();
    });

    it('should reject invalid product type', async () => {
      const invalidRequest = {
        ...validQuoteRequest,
        productType: 'invalid_product'
      };

      const response = await request(app)
        .post('/api/v1/quotes/calculate')
        .send(invalidRequest)
        .expect(400);

      expect(response.body.error).toBe('Validation failed');
      expect(response.body.details).toBeDefined();
    });

    it('should reject missing required fields', async () => {
      const incompleteRequest = {
        productType: 'term_life',
        applicant: {
          gender: 'Male'
          // Missing other required fields
        }
      };

      const response = await request(app)
        .post('/api/v1/quotes/calculate')
        .send(incompleteRequest)
        .expect(400);

      expect(response.body.error).toBe('Validation failed');
    });

    it('should reject invalid age (too young)', async () => {
      const youngApplicantRequest = {
        ...validQuoteRequest,
        applicant: {
          ...validQuoteRequest.applicant,
          birthDate: '2010-01-01' // 14 years old
        }
      };

      const response = await request(app)
        .post('/api/v1/quotes/calculate')
        .send(youngApplicantRequest)
        .expect(400);

      expect(response.body.error).toBe('Validation failed');
    });

    it('should reject invalid age (too old)', async () => {
      const oldApplicantRequest = {
        ...validQuoteRequest,
        applicant: {
          ...validQuoteRequest.applicant,
          birthDate: '1940-01-01' // 84 years old
        }
      };

      const response = await request(app)
        .post('/api/v1/quotes/calculate')
        .send(oldApplicantRequest)
        .expect(400);

      expect(response.body.error).toBe('Validation failed');
    });

    it('should reject invalid coverage amount', async () => {
      const invalidCoverageRequest = {
        ...validQuoteRequest,
        policy: {
          ...validQuoteRequest.policy,
          coverageAmount: 100000 // Below minimum
        }
      };

      const response = await request(app)
        .post('/api/v1/quotes/calculate')
        .send(invalidCoverageRequest)
        .expect(400);

      expect(response.body.error).toBe('Validation failed');
    });

    it('should reject invalid term length', async () => {
      const invalidTermRequest = {
        ...validQuoteRequest,
        policy: {
          ...validQuoteRequest.policy,
          termLength: 15 // Not 10 or 20
        }
      };

      const response = await request(app)
        .post('/api/v1/quotes/calculate')
        .send(invalidTermRequest)
        .expect(400);

      expect(response.body.error).toBe('Validation failed');
    });

    it('should handle disabled product types', async () => {
      const wholeLifeRequest = {
        ...validQuoteRequest,
        productType: 'whole_life'
      };

      const response = await request(app)
        .post('/api/v1/quotes/calculate')
        .send(wholeLifeRequest)
        .expect(400);

      expect(response.body.error).toContain('not available');
    });
  });

  describe('Rate Limiting', () => {
    it('should apply rate limiting', async () => {
      const validQuoteRequest = {
        productType: 'term_life',
        applicant: {
          gender: 'Male',
          birthDate: '1985-03-15',
          height: 180,
          weight: 75,
          city: 'Casablanca',
          usesNicotine: false
        },
        policy: {
          termLength: 20,
          coverageAmount: 500000
        }
      };

      // Make multiple requests to test rate limiting
      const promises = Array(10).fill(null).map(() =>
        request(app)
          .post('/api/v1/quotes/calculate')
          .send(validQuoteRequest)
      );

      const responses = await Promise.all(promises);

      // Check that rate limit headers are present
      responses.forEach(response => {
        expect(response.headers['x-ratelimit-limit']).toBeDefined();
        expect(response.headers['x-ratelimit-remaining']).toBeDefined();
      });
    });
  });

  describe('Error Handling', () => {
    it('should return 404 for non-existent routes', async () => {
      const response = await request(app)
        .get('/api/v1/nonexistent')
        .expect(404);

      expect(response.body.error).toBe('Not found');
    });

    it('should handle malformed JSON', async () => {
      const response = await request(app)
        .post('/api/v1/quotes/calculate')
        .send('invalid json')
        .set('Content-Type', 'application/json')
        .expect(400);
    });
  });

  describe('Security Headers', () => {
    it('should include security headers', async () => {
      const response = await request(app)
        .get('/')
        .expect(200);

      // Helmet security headers
      expect(response.headers['x-content-type-options']).toBe('nosniff');
      expect(response.headers['x-frame-options']).toBeDefined();
      expect(response.headers['x-xss-protection']).toBeDefined();
    });
  });
});