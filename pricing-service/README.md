# Multi-Product Insurance Pricing Service

A comprehensive microservice for insurance product pricing calculations, launching with Term Life Insurance as MVP and architected to support additional product types through configuration.

## 🚀 Features

- **Term Life Insurance Pricing** (MVP) - 10 and 20-year terms
- **Universal API Architecture** - Ready for Whole Life, Annuities
- **Risk Assessment Engine** - 8-tier risk classification system
- **Redis Caching** - High-performance quote and rate table caching
- **Feature Flag Management** - Configuration-driven product enabling
- **Prometheus Metrics** - Comprehensive monitoring and observability
- **OpenAPI Documentation** - Complete API documentation with examples
- **Docker Ready** - Multi-stage builds with health checks

## 📋 Requirements

- Node.js 18+
- PostgreSQL 14+
- Redis 7+
- Docker & Docker Compose (optional)

## 🏗️ Architecture

```
pricing-service/
├── src/
│   ├── controllers/     # Request handlers
│   ├── services/        # Business logic
│   ├── models/          # TypeScript interfaces
│   ├── routes/          # API route definitions
│   ├── middleware/      # Custom middleware
│   ├── database/        # Database schema and migrations
│   ├── config/          # Configuration management
│   ├── utils/           # Utility functions
│   └── docs/            # API documentation
├── tests/               # Test suites
├── config/              # Environment configurations
└── docs/                # Additional documentation
```

## 🚦 Quick Start

### Using Docker Compose (Recommended)

1. **Clone and setup**
   ```bash
   git clone <repository>
   cd pricing-service
   cp .env.example .env
   ```

2. **Start all services**
   ```bash
   docker-compose up -d
   ```

3. **Access the service**
   - API: http://localhost:3000
   - Documentation: http://localhost:3000/api/docs
   - Health Check: http://localhost:3000/api/v1/health

### Manual Setup

1. **Install dependencies**
   ```bash
   npm install
   ```

2. **Setup environment**
   ```bash
   cp .env.example .env
   # Edit .env with your database and Redis configurations
   ```

3. **Setup database**
   ```bash
   # Create PostgreSQL database
   createdb pricing_service

   # Run schema migration
   psql -d pricing_service -f src/database/schema.sql
   ```

4. **Start the service**
   ```bash
   # Development
   npm run dev

   # Production
   npm run build && npm start
   ```

## 📖 API Usage

### Calculate Quote

```bash
curl -X POST http://localhost:3000/api/v1/quotes/calculate \\
  -H "Content-Type: application/json" \\
  -d '{
    "productType": "term_life",
    "applicant": {
      "gender": "Male",
      "birthDate": "1985-03-15",
      "height": 180,
      "weight": 75,
      "city": "Casablanca",
      "usesNicotine": false
    },
    "policy": {
      "termLength": 20,
      "coverageAmount": 500000
    }
  }'
```

### List Available Products

```bash
curl http://localhost:3000/api/v1/products
```

### Health Check

```bash
curl http://localhost:3000/api/v1/health
```

## 🔧 Configuration

### Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `PORT` | Server port | 3000 |
| `NODE_ENV` | Environment (development/production/test) | development |
| `DATABASE_URL` | PostgreSQL connection string | - |
| `REDIS_URL` | Redis connection string | - |
| `ENABLE_TERM_LIFE` | Enable Term Life product | true |
| `ENABLE_WHOLE_LIFE` | Enable Whole Life product | false |
| `ENABLE_ANNUITIES` | Enable Annuity products | false |
| `API_RATE_LIMIT` | Requests per 15min window | 1000 |
| `QUOTE_EXPIRY_HOURS` | Quote validity period | 720 |

### Feature Flags

Products can be enabled/disabled via environment variables:
- `ENABLE_TERM_LIFE=true` - Term Life Insurance
- `ENABLE_WHOLE_LIFE=false` - Whole Life Insurance (future)
- `ENABLE_ANNUITIES=false` - Annuity Products (future)

## 🧪 Testing

```bash
# Run all tests
npm test

# Run with coverage
npm run test:coverage

# Run specific test
npm test -- PricingEngine.test.ts

# Watch mode
npm run test:watch
```

## 📊 Monitoring

### Health Checks

- **Basic**: `GET /api/v1/health` - Quick health check
- **Deep**: `GET /api/v1/health/deep` - Database + Redis connectivity

### Metrics

- **Endpoint**: `GET /api/v1/metrics`
- **Format**: Prometheus format
- **Includes**: Request duration, error rates, business metrics

### Key Metrics

- `pricing_service_quotes_generated_total` - Total quotes by product/risk class
- `pricing_service_request_duration_seconds` - Request latency histogram
- `pricing_service_errors_total` - Error count by type
- `pricing_service_cache_operations_total` - Cache hit/miss rates

## 🏥 Business Logic

### Risk Classification

8-tier system: SuperPreferredPlus, SuperPreferred, PreferredPlus, Preferred, StandardPlus, Standard, Substandard, Uninsurable

### Rating Factors

- **Age**: Exponential increase with age bands (18-75)
- **Gender**: Female rates typically 10-15% lower
- **BMI**: Height/weight risk assessment
- **Nicotine**: 50-100% rate increase
- **Term Length**: 20-year terms 15-25% higher than 10-year
- **Volume Discounts**: 5% at $500K+, 10% at $1M+

### Eligibility Rules

- **Decline Triggers**: Age > 70, BMI > 40 or < 16
- **Additional Underwriting**: High-risk combinations

## 🔐 Security

- **Helmet.js** - Security headers
- **Rate Limiting** - Per-IP request limits
- **Input Validation** - Joi schema validation
- **CORS** - Configurable cross-origin policies
- **Non-root Docker** - Security-first containerization

## 🚀 Performance

- **Target Response Time**: < 500ms for quote calculations
- **Concurrency**: 1000+ simultaneous requests
- **Caching**: Redis-based quote and rate table caching
- **Database**: Connection pooling and optimized queries

## 📈 Scaling

### Horizontal Scaling
- Stateless design enables load balancing
- Redis for shared session/cache state
- Database connection pooling

### Monitoring Integration
- Prometheus metrics
- Health check endpoints
- Structured JSON logging
- Error tracking and alerting

## 🔄 CI/CD

### Build Process
```bash
npm run lint          # ESLint code quality
npm run typecheck     # TypeScript validation
npm test             # Test suite
npm run build        # Production build
```

### Docker Deployment
```bash
docker build -t pricing-service .
docker run -p 3000:3000 pricing-service
```

## 📚 API Documentation

Complete interactive API documentation available at:
- **Development**: http://localhost:3000/api/docs
- **Production**: https://api.company.com/api/docs

## 🤝 Contributing

1. Fork the repository
2. Create feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open Pull Request

### Development Standards

- **TypeScript** - Strict mode enabled
- **ESLint** - Airbnb configuration
- **Jest** - Unit and integration tests
- **Coverage** - Minimum 80% test coverage
- **Documentation** - OpenAPI/Swagger specs

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 📞 Support

- **Documentation**: `/api/docs`
- **Health Check**: `/api/v1/health`
- **Metrics**: `/api/v1/metrics`

## 🎯 Roadmap

### Phase 1 - MVP (Current)
- ✅ Term Life Insurance pricing
- ✅ Risk assessment engine
- ✅ API documentation
- ✅ Docker deployment

### Phase 2 - Expansion
- [ ] Whole Life Insurance support
- [ ] Advanced underwriting rules
- [ ] Rate table versioning
- [ ] A/B testing framework

### Phase 3 - Enterprise
- [ ] Annuity products
- [ ] Multi-currency support
- [ ] Advanced analytics
- [ ] Partner API integrations

---

**Built with ❤️ for the insurance industry**