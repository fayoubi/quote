# Pricing Service Integration

This document describes how the quote application integrates with the pricing service for real-time insurance quote calculations.

## Overview

The frontend React application now integrates with the pricing service microservice to provide:
- Real-time quote calculations based on user input
- Dynamic pricing updates when coverage amount or term length changes
- Risk assessment and eligibility information display
- Comprehensive error handling and loading states

## Architecture

```
Frontend (React) --> Pricing Service API --> Database/Redis
      ↓                        ↓
  User Interface        Business Logic
  State Management      Risk Assessment
  Error Handling        Quote Calculation
```

## Key Components

### 1. Pricing Service Client (`src/services/PricingService.ts`)
- API client for communicating with the pricing service
- Handles request/response formatting and error handling
- Converts frontend form data to pricing service format
- Singleton pattern for consistent usage

### 2. Quote Context (`src/context/QuoteContext.tsx`)
- Global state management for quote data
- Manages form data, current quote, and loading states
- Provides error handling across components
- Enables data persistence between route transitions

### 3. Enhanced Components

#### QuoteForm (`src/components/QuoteForm.tsx`)
- **NEW**: Integrates with pricing service for quote calculation
- **NEW**: Real-time form validation with age/weight checks
- **NEW**: Loading states during quote calculation
- **NEW**: Error display for service failures
- **ENHANCED**: Submits data to pricing service instead of mock navigation

#### QuoteDisplay (`src/components/QuoteDisplay.tsx`)
- **NEW**: Displays real pricing data from service
- **NEW**: Real-time quote updates when slider/toggle changes
- **NEW**: Shows risk assessment and eligibility information
- **NEW**: Loading states during quote updates
- **ENHANCED**: Years of coverage toggle now triggers pricing updates
- **ENHANCED**: Coverage amount slider triggers real-time pricing

### 4. Type Definitions (`src/types/pricing.ts`)
- TypeScript interfaces for pricing service communication
- Ensures type safety between frontend and backend
- Includes request/response models and error handling types

## User Experience Flow

### 1. Quote Form Submission
```
User fills form → Validation → API call → Loading state → Quote display
                      ↓              ↓            ↓
                 Error display   Retry option   Real data
```

### 2. Quote Customization
```
User adjusts slider/toggle → API call → Loading overlay → Updated pricing
                                ↓             ↓
                           Error handling   Retry option
```

### 3. Error Handling
- **Network errors**: Graceful degradation with retry options
- **Validation errors**: Inline form feedback
- **Service unavailable**: Fallback UI with estimated ranges
- **Rate limiting**: Automatic retry with exponential backoff

## Configuration

### Environment Variables
```bash
# .env.local
REACT_APP_PRICING_SERVICE_URL=http://localhost:3001
REACT_APP_ENV=development
```

### Pricing Service Requirements
The frontend expects the pricing service to be running on port 3001 with the following endpoints:
- `POST /api/v1/quotes/calculate` - Calculate new quotes
- `GET /api/v1/health` - Health check for service availability

## API Integration Details

### Request Format
```typescript
{
  productType: 'term_life',
  applicant: {
    gender: 'Male' | 'Female',
    birthDate: 'YYYY-MM-DD',
    height: number, // centimeters
    weight: number, // kilograms
    city: string,
    usesNicotine: boolean
  },
  policy: {
    termLength: 10 | 20,
    coverageAmount: number // dollars
  }
}
```

### Response Format
```typescript
{
  quote: {
    quoteId: string,
    productType: 'term_life',
    pricing: {
      monthlyPremium: number,
      annualPremium: number
    },
    riskAssessment: {
      riskClass: string,
      bmi: number,
      age: number,
      riskFactors: string[]
    },
    eligibilityFlags: {
      wouldDeclinePostUnderwriting: boolean,
      requiresAdditionalUnderwriting: boolean,
      declineReasons?: string[]
    },
    createdAt: string,
    expiresAt: string
  }
}
```

## Performance Considerations

### Optimizations Implemented
- **Debounced API calls**: Slider changes are debounced to prevent excessive requests
- **Loading states**: Immediate UI feedback during API calls
- **Error recovery**: Automatic retry with exponential backoff
- **State persistence**: Quote data persists during navigation
- **Lazy loading**: API calls only when necessary

### Caching Strategy
- Quote data is cached in React context during the session
- Pricing service implements Redis caching for performance
- Browser state management prevents unnecessary re-calculations

## Testing

### Manual Testing Checklist
- [ ] Form submission creates valid quote
- [ ] Slider changes update pricing in real-time
- [ ] Years of coverage toggle updates pricing
- [ ] Error states display correctly
- [ ] Loading states provide good UX
- [ ] Navigation preserves quote data
- [ ] Form validation works correctly
- [ ] Service failures are handled gracefully

### Integration Testing
```bash
# Start pricing service
cd pricing-service
npm run dev

# Start frontend
npm start

# Test flow:
# 1. Fill out quote form
# 2. Submit and verify quote display
# 3. Adjust slider and verify real-time updates
# 4. Toggle years and verify pricing changes
# 5. Test error scenarios
```

## Deployment Considerations

### Environment Setup
- Ensure pricing service is deployed and accessible
- Configure `REACT_APP_PRICING_SERVICE_URL` for production
- Set up health checks for service monitoring
- Configure error tracking and logging

### Fallback Strategy
- Service unavailable: Show estimated price ranges
- Network errors: Provide retry mechanisms
- Validation failures: Clear error messaging
- Graceful degradation: Form still submittable with manual review

## Security

### Implemented Measures
- **Input validation**: Client and server-side validation
- **Error sanitization**: No sensitive data in error messages
- **Rate limiting**: Prevents abuse of pricing service
- **HTTPS**: All API calls use secure transport
- **Data minimization**: Only necessary data sent to service

## Future Enhancements

### Planned Features
- [ ] Quote comparison between different terms
- [ ] Save quotes for later retrieval
- [ ] Advanced risk factor display
- [ ] Multi-product support (Whole Life, Annuities)
- [ ] Offline mode with cached estimates
- [ ] A/B testing for pricing presentation

### Performance Optimizations
- [ ] GraphQL integration for optimized queries
- [ ] Service worker for offline capability
- [ ] Progressive loading for large quotes
- [ ] Real-time pricing via WebSocket connections