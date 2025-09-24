
# Quote - Life Insurance Application

A modern React application for life insurance quotes and enrollment with contribution management.

## 🚀 Quick Start

### Development Setup

To run the complete application locally, you need both the frontend and backend services:

#### Option 1: Run services separately (Recommended)

1. **Start the Mock Pricing Server** (Terminal 1):
   ```bash
   npm run mock-server
   ```
   This starts the backend API server on http://localhost:3001

2. **Start the React App** (Terminal 2):
   ```bash
   npm start
   ```
   This starts the frontend on http://localhost:3000

#### Option 2: Run both services manually

1. **Backend**:
   ```bash
   node mock-pricing-server.js
   ```

2. **Frontend**:
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
- `npm run mock-server` - Start mock pricing server
- `npm run test-api` - Test API endpoints

## 🛠️ Configuration

### Environment Variables

Create a `.env.local` file:
```
REACT_APP_PRICING_SERVICE_URL=http://localhost:3001
REACT_APP_ENV=development
```

### API Endpoints

The mock server provides:
- `GET /api/v1/health` - Health check
- `POST /api/v1/quotes/calculate` - Quote calculation
- `POST /api/v1/contributions/validate` - Contribution validation

## 🚨 Troubleshooting

### "Failed to fetch" Error

If you encounter a "Failed to fetch" error:

1. **Check if the mock server is running**:
   ```bash
   curl http://localhost:3001/api/v1/health
   ```
   Should return: `{"status":"ok","service":"mock-pricing-service"}`

2. **Restart the mock server**:
   ```bash
   npm run mock-server
   ```

3. **Test the API**:
   ```bash
   npm run test-api
   ```

4. **Check the console** for any CORS or network errors

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
├── mock-pricing-server.js  # Development backend
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
