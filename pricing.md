# Multi-Product Insurance Pricing Service - Implementation Prompt

## **Project Overview**
Build a comprehensive **Multi-Product Insurance Pricing Microservice** that launches with **Term Life Insurance as MVP** but is architected to support additional product types (Whole Life, Universal Life, Annuities, etc.) through configuration rather than code changes.

## **Core Requirements**

### **1. Product Architecture**
- **MVP Product**: Term Life Insurance (10 and 20-year terms)
- **Future Products**: Whole Life, Universal Life, Annuities, Disability Insurance
- **Product Management**: Configuration-driven product enabling via feature flags
- **Extensibility**: Add new products through configuration, not code rewrites <!-- ⚠️ NOTE: Extensibility claim conflicts with `PricingEngineFactory` which requires new code classes. Clarify if all new products truly config-only. -->

### **2. API Design**
```typescript
// Universal quote endpoint
POST /api/v1/quotes/calculate
{
  "productType": "term_life",  // Required: determines pricing engine
  "applicant": {
    "gender": "Male",
    "birthDate": "1985-03-15",  // DD/MM/YYYY European format <!-- ⚠️ NOTE: This example is ISO YYYY-MM-DD, not DD/MM/YYYY. Potential parsing issue. -->
    "height": 180,              // centimeters
    "weight": 75,               // kilograms
    "city": "Casablanca",
    "usesNicotine": false
  },
  "policy": {
    "termLength": 20,           // Required for term products
    "coverageAmount": 500000    // $250K - $1.5M range <!-- ⚠️ NOTE: What happens for >$1.5M policies? Business rule unclear. -->
  }
}

// Product discovery
GET /api/v1/products              // List available products
GET /api/v1/products/{productType} // Get product configuration <!-- ⚠️ NOTE: No versioning for configs. How are changes communicated to clients? -->
```

### **3. Term Life Insurance Implementation (MVP)**

#### **Risk Classification System**
Implement 8 risk classes: Super Preferred Plus, Super Preferred, Preferred Plus, Preferred, Standard Plus, Standard, Substandard, Uninsurable <!-- ⚠️ NOTE: At quote stage, all applicants get quotes, even if effectively "Uninsurable." May need soft decline logic. -->

#### **Pricing Logic**
- **BMI-based risk assessment**: Height/weight to BMI calculation with risk adjustments
- **Age-based pricing**: Exponential increase with age bands (18-75 supported) <!-- ⚠️ NOTE: Eligibility rules decline >70, but age bands allow up to 75. Inconsistency. -->
- **Gender adjustments**: Female rates typically 10-15% lower than male
- **Nicotine penalties**: 50-100% rate increase, capped at Standard risk class <!-- ⚠️ NOTE: Conflict if applicant otherwise qualifies for Substandard or Uninsurable. -->
- **Term length pricing**: 20-year terms 15-25% higher than 10-year
- **Volume discounts**: 5% at $500K+, 10% at $1M+ coverage

#### **Eligibility Rules**
- **Quote Stage**: Always generate quotes (never decline at quote level)
- **Post-Underwriting Flags**: Internal assessment of decline risk
  - Age > 70: Automatic decline flag
  - BMI > 40 or < 16: Decline flag  
  - High-risk combinations: Age + BMI + nicotine

### **4. Technical Architecture**

#### **Technology Stack**
- **Runtime**: Node.js 18+ with TypeScript
- **Framework**: Express.js with modular routing
- **Database**: PostgreSQL 14+ with Redis caching
- **Containerization**: Docker with multi-stage builds
- **API Documentation**: OpenAPI/Swagger integration

#### **Database Schema**
```sql
-- Product configuration
CREATE TABLE products (
    product_type VARCHAR(50) PRIMARY KEY,
    display_name VARCHAR(100) NOT NULL,
    configuration JSONB NOT NULL,
    is_active BOOLEAN DEFAULT true
);

-- Multi-product rate tables  
CREATE TABLE rate_tables (
    product_type VARCHAR(50) REFERENCES products(product_type),
    risk_class VARCHAR(50),
    gender VARCHAR(10),
    age_min INTEGER,
    age_max INTEGER,
    term_length INTEGER,
    rate_per_thousand DECIMAL(10,4)
    -- ⚠️ NOTE: No uniqueness constraint. Duplicate rows possible for same combination.
);

-- Universal quote storage
CREATE TABLE quotes (
    quote_id VARCHAR(50) PRIMARY KEY,
    product_type VARCHAR(50),
    applicant_data JSONB,
    pricing_result JSONB,
    eligibility_flags JSONB
    -- ⚠️ NOTE: Applicant data stored as JSONB. May complicate compliance/auditing queries.
);
```

#### **Core Service Structure**
```typescript
// Product configuration system
enum ProductType {
  TERM_LIFE = 'term_life',
  WHOLE_LIFE = 'whole_life',    // Future
  ANNUITY = 'annuity'           // Future
}

// Universal pricing engine interface
interface PricingEngine {
  calculateQuote(request: UniversalQuoteRequest): Promise<UniversalQuoteResponse>;
  validateInputs(request: UniversalQuoteRequest): ValidationResult;
}

// Product-specific implementations
class TermLifePricingEngine implements PricingEngine { ... }
class PricingEngineFactory {
  static createEngine(productType: ProductType): PricingEngine { ... }
  // ⚠️ NOTE: Adding new products requires code changes here, despite "configuration-only" claim.
}
```

### **5. Configuration & Feature Management**

#### **Environment Variables**
```bash
# Product feature flags
ENABLE_TERM_LIFE=true          # MVP - always enabled
ENABLE_WHOLE_LIFE=false        # Phase 2
ENABLE_ANNUITIES=false         # Phase 3

# Default settings
DEFAULT_PRODUCT_TYPE=term_life
QUOTE_EXPIRY_HOURS=720         # ⚠️ NOTE: 30 days, but Redis TTL strategy for quotes not defined.

# Rate table versions
RATE_TABLE_VERSION_TERM_LIFE=v1.0.0
```

#### **Docker Configuration**
```dockerfile
FROM node:18-alpine
COPY package*.json ./
RUN npm ci --only=production
COPY config/products/ ./config/products/
COPY config/rate-tables/ ./config/rate-tables/
EXPOSE 3000
HEALTHCHECK CMD curl -f http://localhost:3000/api/v1/health # ⚠️ NOTE: Health check does not validate Redis or feature flag configs.
```

### **6. Performance & Scalability Requirements**
- **Response Time**: <500ms for quote calculations <!-- ⚠️ NOTE: No latency monitoring histograms defined. -->
- **Concurrency**: Handle 1000+ simultaneous requests <!-- ⚠️ NOTE: No baseline hardware/container size stated, "1000+" is vague. -->
- **Uptime**: 99.9% availability target
- **Horizontal Scaling**: Auto-scaling based on load
- **Caching**: Redis-based rate table and quote caching <!-- ⚠️ NOTE: No eviction/TTL strategy described for compliance alignment. -->

### **7. Monitoring & Observability**
```typescript
// Product-aware metrics
const quotesGeneratedByProduct = new prometheus.Counter({
  name: 'quotes_generated_total',
  labelNames: ['product_type', 'risk_class']
});

// Health checks with product validation
GET /api/v1/health      // Basic health check
GET /api/v1/health/deep // Database + rate table validation
GET /api/v1/metrics     // Prometheus metrics endpoint
// ⚠️ NOTE: Missing error rate and latency metrics.
```

### **8. Testing Requirements**
- **Unit Tests**: Product-agnostic core functions + Term Life specific logic
- **Integration Tests**: End-to-end quote generation and retrieval
- **Load Tests**: 1000+ concurrent requests across product types
- **Sample Test Cases**: Include healthy applicants, high-risk scenarios, edge cases <!-- ⚠️ NOTE: No mention of gender non-binary or invalid input cases (e.g., height=0). -->

### **9. API Response Format**
```json
{
  "quote": {
    "quoteId": "quote_term_12345abc",
    "productType": "term_life",
    "pricing": {
      "monthlyPremium": 46.41,
      "annualPremium": 556.92
    },
    "riskAssessment": {
      "riskClass": "SuperPreferredPlus"
    },
    "eligibilityFlags": {
      "wouldDeclinePostUnderwriting": false,
      "requiresAdditionalUnderwriting": false
    }
  }
}
```

### **10. Security & Compliance**
- **Input Validation**: Joi schemas for all request validation
- **Rate Limiting**: Product-specific rate limits
- **Audit Logging**: Complete audit trail for compliance
- **Data Encryption**: TLS 1.3 in transit, encryption at rest

## **Implementation Focus Areas**

### **Priority 1: Term Life MVP**
1. Complete Term Life pricing engine with all risk factors
2. Universal API structure supporting future products
3. Product configuration system with feature flags
4. Comprehensive rate table management
5. Quote generation, storage, and retrieval

### **Priority 2: Service Infrastructure** 
1. Docker containerization with multi-environment support
2. Health checks and monitoring integration
3. Database schema with migration scripts
4. API documentation with OpenAPI/Swagger
5. Comprehensive error handling and logging

### **Priority 3: Production Readiness**
1. Performance optimization and caching strategies
2. Load testing and scalability validation  
3. Security implementation and validation
4. Deployment automation and CI/CD readiness <!-- ⚠️ NOTE: No CI/CD toolchain (GitHub Actions, Jenkins, etc.) specified. -->
5. Monitoring dashboards and alerting

## **Success Criteria**
- ✅ Generate accurate Term Life quotes in <500ms
- ✅ Support 1000+ concurrent requests
- ✅ Complete API documentation with examples
- ✅ Docker deployment with health checks
- ✅ Comprehensive test coverage (>90%)
- ✅ Product configuration system ready for future products
- ✅ Production-ready monitoring and logging

## **Future Extensibility**
The service architecture should allow adding new insurance products (Whole Life, Annuities, etc.) through:
- Configuration files (not code changes)
- Feature flag toggles
- New rate table uploads
- Additional pricing engine implementations <!-- ⚠️ NOTE: Adding a new engine *is* a code change. Wording contradicts earlier claims. -->

Build this as a **production-ready microservice** that starts with Term Life Insurance but can evolve into a comprehensive multi-product insurance pricing platform.

