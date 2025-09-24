const express = require('express');
const cors = require('cors');

const app = express();
const PORT = 3001;

// Middleware
app.use(cors());
app.use(express.json());

// Logging middleware
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
  next();
});

// Health check endpoint
app.get('/api/v1/health', (req, res) => {
  res.json({ status: 'ok', service: 'mock-pricing-service' });
});

// Calculate quote endpoint
app.post('/api/v1/quotes/calculate', (req, res) => {
  try {
    const { applicant, policy } = req.body;

    // Validate required fields
    if (!applicant || !policy) {
      return res.status(400).json({
        error: 'INVALID_REQUEST',
        message: 'Missing required fields: applicant and policy'
      });
    }

    // Mock quote calculation based on simple factors
    const baseRate = 50; // Base monthly rate
    const ageMultiplier = Math.max(1, (new Date().getFullYear() - new Date(applicant.birthDate).getFullYear()) / 30);
    const nicotineMultiplier = applicant.usesNicotine ? 1.5 : 1.0;
    const genderMultiplier = applicant.gender === 'Male' ? 1.1 : 1.0;
    const termMultiplier = policy.termLength === 20 ? 1.2 : 1.0;
    const coverageMultiplier = policy.coverageAmount / 500000; // Base coverage 500k

    const monthlyPremium = baseRate * ageMultiplier * nicotineMultiplier * genderMultiplier * termMultiplier * coverageMultiplier;
    const annualPremium = monthlyPremium * 12;

    // Mock risk assessment
    const age = new Date().getFullYear() - new Date(applicant.birthDate).getFullYear();
    const bmi = applicant.weight / ((applicant.height / 100) ** 2);

    let riskClass = 'Standard';
    if (bmi > 30 || applicant.usesNicotine || age > 60) {
      riskClass = 'StandardPlus';
    }
    if (bmi > 35 || age > 70) {
      riskClass = 'SubStandard';
    }

    const mockQuote = {
      quote: {
        id: `quote_${Date.now()}`,
        status: 'active',
        pricing: {
          monthlyPremium: Math.round(monthlyPremium * 100) / 100,
          annualPremium: Math.round(annualPremium * 100) / 100,
          currency: 'USD'
        },
        policy: {
          termLength: policy.termLength,
          coverageAmount: policy.coverageAmount,
          productType: 'term_life'
        },
        riskAssessment: {
          riskClass,
          age,
          bmi: Math.round(bmi * 10) / 10,
          factors: {
            nicotineUse: applicant.usesNicotine,
            ageCategory: age < 40 ? 'young' : age < 60 ? 'middle' : 'senior'
          }
        },
        eligibilityFlags: {
          requiresAdditionalUnderwriting: bmi > 35 || age > 70,
          eligible: true
        },
        expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(), // 30 days
        createdAt: new Date().toISOString()
      }
    };

    console.log(`[${new Date().toISOString()}] Quote calculated for ${applicant.gender}, age ${age}, coverage $${policy.coverageAmount} -> $${monthlyPremium.toFixed(2)}/month`);

    res.json(mockQuote);
  } catch (error) {
    console.error('Error calculating quote:', error);
    res.status(500).json({
      error: 'CALCULATION_ERROR',
      message: 'Failed to calculate quote'
    });
  }
});

// Get quote by ID endpoint
app.get('/api/v1/quotes/:quoteId', (req, res) => {
  console.log(`[${new Date().toISOString()}] Quote lookup requested for ID: ${req.params.quoteId}`);
  // For this mock, we'll just return a not found error since we don't store quotes
  res.status(404).json({
    error: 'QUOTE_NOT_FOUND',
    message: 'Quote not found'
  });
});

// Contribution validation endpoint
app.post('/api/v1/contributions/validate', (req, res) => {
  try {
    const { amount, frequency } = req.body;

    console.log(`[${new Date().toISOString()}] Contribution validation requested: ${amount} MAD ${frequency}`);

    // Validate input
    if (!amount || !frequency) {
      return res.status(400).json({
        error: 'INVALID_REQUEST',
        message: 'Missing required fields: amount and frequency'
      });
    }

    if (!['monthly', 'quarterly', 'bi-annual', 'annual'].includes(frequency)) {
      return res.status(400).json({
        error: 'INVALID_FREQUENCY',
        message: 'Frequency must be one of: monthly, quarterly, bi-annual, annual'
      });
    }

    // Minimum contribution amounts
    const minimums = {
      monthly: 250,
      quarterly: 750,
      'bi-annual': 1500,
      annual: 3000
    };

    const minimum = minimums[frequency];

    if (amount < minimum) {
      const frequencyLabel = {
        monthly: 'mensuelle',
        quarterly: 'trimestrielle',
        'bi-annual': 'semestrielle',
        annual: 'annuelle'
      }[frequency];

      return res.json({
        validation: {
          isValid: false,
          errorMessage: `Le montant minimum pour la fréquence ${frequencyLabel} est de ${minimum.toLocaleString('fr-MA')} MAD.`,
          monthlyEquivalent: 0,
          annualTotal: 0
        },
        timestamp: new Date().toISOString()
      });
    }

    // Calculate equivalents
    let monthlyEquivalent, annualTotal;
    switch (frequency) {
      case 'monthly':
        monthlyEquivalent = amount;
        annualTotal = amount * 12;
        break;
      case 'quarterly':
        monthlyEquivalent = Math.round(amount / 3);
        annualTotal = amount * 4;
        break;
      case 'bi-annual':
        monthlyEquivalent = Math.round(amount / 6);
        annualTotal = amount * 2;
        break;
      case 'annual':
        monthlyEquivalent = Math.round(amount / 12);
        annualTotal = amount;
        break;
    }

    console.log(`[${new Date().toISOString()}] Contribution validated: ${amount} MAD ${frequency} -> Monthly: ${monthlyEquivalent} MAD, Annual: ${annualTotal} MAD`);

    res.json({
      validation: {
        isValid: true,
        monthlyEquivalent,
        annualTotal
      },
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Error validating contribution:', error);
    res.status(500).json({
      error: 'VALIDATION_ERROR',
      message: 'Failed to validate contribution'
    });
  }
});

// Catch-all handler for unknown routes
app.use((req, res) => {
  console.log(`[${new Date().toISOString()}] 404 - Unknown route: ${req.method} ${req.url}`);
  res.status(404).json({
    error: 'NOT_FOUND',
    message: `Route ${req.method} ${req.url} not found`
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`Mock Pricing Service running on http://localhost:${PORT}`);
  console.log(`Health check: http://localhost:${PORT}/api/v1/health`);
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('Shutting down mock pricing service...');
  process.exit(0);
});

process.on('SIGINT', () => {
  console.log('Shutting down mock pricing service...');
  process.exit(0);
});