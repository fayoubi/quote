
# Quote - Life Insurance Application

A modern React application for life insurance quotes and enrollment with contribution management.

## ✅ Start all services (Frontend + Pricing API on port 3001)

The app now uses the real `pricing-service` only. Everything is pinned to port 3001.

1. Start the backend stack:
   ```bash
   cd pricing-service
   docker-compose up -d
   ```
2. Wait for health to be ready:
   ```bash
   curl http://localhost:3001/api/v1/health
   ```
3. Point the frontend to port 3001:
   ```bash
   cd ..
   echo "REACT_APP_PRICING_SERVICE_URL=http://localhost:3001" > .env.local
   echo "REACT_APP_ENV=development" >> .env.local
   ```
4. Start the React app:
   ```bash
   npm start
   ```

Notes:
- Frontend: http://localhost:3000
- Pricing service: http://localhost:3001

## 🚀 Quick Start

### Development Setup

To run the complete application locally, you need both the frontend and backend services:

#### Local Development

1. **Start the pricing service** (Docker Compose):
   ```bash
   cd pricing-service
   docker-compose up -d
   cd ..
   ```

2. **Start the React App**:
   ```bash
   npm start
   ```

### Testing the API

Run the comprehensive API test suite:
```bash
npm run test-api
```

This validates:
- Health check endpoint
- Quote calculation
- Contribution validation
- Error handling

## 📋 Features

### ✅ Quote Calculation
- Interactive form with real-time validation
- Age, height, weight, and location-based pricing
- Nicotine use consideration
- Instant quote generation

### ✅ Contribution Management
- Payment frequency selection (Monthly, Quarterly, Bi-annual, Annual)
- Minimum contribution validation:
  - Monthly: 250 MAD
  - Quarterly: 750 MAD
  - Bi-annual: 1,500 MAD
  - Annual: 3,000 MAD
- Automatic monthly equivalent and annual total calculation

### ✅ Enrollment Flow
- Step-by-step process: Quote → Personal Info → Contribution
- Form validation and error handling
- Prepopulation of enrollment forms from quote data

## 🏗️ Architecture

### Frontend (React + TypeScript)
- **Components**: Modular React components with TypeScript
- **Services**: API integration with fallback validation
- **Context**: Quote and application state management
- **UI Kit**: Reusable components (Button, Input, Card, etc.)

### Backend (Mock Service)
- **Quote Calculation**: Risk assessment and premium calculation
- **Contribution Validation**: Business rule enforcement
- **CORS Enabled**: Ready for frontend integration

## 🔧 Available Scripts

- `npm start` - Start React development server
- `npm run build` - Build for production
- `npm run test` - Run React tests
- `npm run test-api` - Test API endpoints

## 🛠️ Configuration

### Environment Variables

Create a `.env.local` file:
```
REACT_APP_PRICING_SERVICE_URL=http://localhost:3001
REACT_APP_ENV=development
```

### API Endpoints

The pricing service provides:
- `GET /api/v1/health` - Health check
- `POST /api/v1/quotes/calculate` - Quote calculation
- `POST /api/v1/contributions/validate` - Contribution validation

## 🚨 Troubleshooting

### "Failed to fetch" Error

If you encounter a "Failed to fetch" error:

1. **Check if the pricing service is running**:
   ```bash
   curl http://localhost:3001/api/v1/health
   ```

2. **Test the API**:
   ```bash
   npm run test-api
   ```

3. **Check the console** for any CORS or network errors

### Port Conflicts

- Frontend runs on port 3000
- Backend runs on port 3001
- Kill any existing processes: `lsof -ti:3000 | xargs kill -9`

## 🔄 Deployment

For production deployment:

1. Build the frontend:
   ```bash
   npm run build
   ```

2. Deploy the `build` folder to your hosting service

3. Replace the mock server with a real pricing service API

## 📁 Project Structure

```
├── src/
│   ├── components/          # React components
│   │   ├── ui/             # Reusable UI components
│   │   ├── QuoteForm.tsx   # Quote calculation form
│   │   ├── ContributionForm.tsx # Contribution management
│   │   └── InsuranceForm.tsx # Personal information form
│   ├── services/           # API integration
│   ├── types/             # TypeScript type definitions
│   └── context/           # React context providers
├── pricing-service/        # Real pricing backend (Docker Compose)
├── test-quote-api.js      # API test suite
└── README.md
```

## 🤝 Contributing

1. Create a feature branch
2. Make your changes
3. Test with `npm run test-api`
4. Build with `npm run build`
5. Submit a pull request

---

For questions or issues, please check the API test results first with `npm run test-api`.
