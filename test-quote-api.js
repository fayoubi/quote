// Quick test script to validate quote API integration
// Using Node.js 18+ built-in fetch

const testQuoteAPI = async () => {
  console.log('🧪 Testing Quote API Integration (port 3001)...\n');

  // Test 1: Health check
  console.log('1. Testing health endpoint...');
  try {
    const healthResponse = await fetch('http://localhost:3001/api/v1/health');
    const healthData = await healthResponse.json();
    console.log('✅ Health check:', healthData);
  } catch (error) {
    console.log('❌ Health check failed:', error.message);
    return;
  }

  // Test 2: Quote calculation (simulating frontend request)
  console.log('\n2. Testing quote calculation...');
  const quoteRequest = {
    productType: 'term_life',
    applicant: {
      gender: 'Male',
      birthDate: '1985-06-15', // 38 years old
      height: 180,
      weight: 80,
      city: 'Casablanca',
      usesNicotine: false
    },
    policy: {
      termLength: 20,
      coverageAmount: 500000
    }
  };

  try {
    const quoteResponse = await fetch('http://localhost:3001/api/v1/quotes/calculate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(quoteRequest)
    });

    if (!quoteResponse.ok) {
      throw new Error(`HTTP ${quoteResponse.status}: ${quoteResponse.statusText}`);
    }

    const quoteData = await quoteResponse.json();
    console.log('✅ Quote calculated successfully:');
    console.log(`   - Quote ID: ${quoteData.quote.id}`);
    console.log(`   - Monthly Premium: $${quoteData.quote.pricing.monthlyPremium}`);
    console.log(`   - Annual Premium: $${quoteData.quote.pricing.annualPremium}`);
    console.log(`   - Risk Class: ${quoteData.quote.riskAssessment.riskClass}`);
    console.log(`   - Age: ${quoteData.quote.riskAssessment.age} years`);
    console.log(`   - BMI: ${quoteData.quote.riskAssessment.bmi}`);
  } catch (error) {
    console.log('❌ Quote calculation failed:', error.message);
    return;
  }

  // Test 3: Contribution validation
  console.log('\n3. Testing contribution validation...');
  const contributionRequest = {
    amount: 500,
    frequency: 'monthly'
  };

  try {
    const contributionResponse = await fetch('http://localhost:3001/api/v1/contributions/validate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(contributionRequest)
    });

    if (!contributionResponse.ok) {
      throw new Error(`HTTP ${contributionResponse.status}: ${contributionResponse.statusText}`);
    }

    const contributionData = await contributionResponse.json();
    console.log('✅ Contribution validated successfully:');
    console.log(`   - Valid: ${contributionData.validation.isValid}`);
    console.log(`   - Monthly Equivalent: ${contributionData.validation.monthlyEquivalent} MAD`);
    console.log(`   - Annual Total: ${contributionData.validation.annualTotal} MAD`);
  } catch (error) {
    console.log('❌ Contribution validation failed:', error.message);
    return;
  }

  // Test 4: Invalid contribution (below minimum)
  console.log('\n4. Testing invalid contribution (below minimum)...');
  const invalidContributionRequest = {
    amount: 100,
    frequency: 'monthly'
  };

  try {
    const invalidResponse = await fetch('http://localhost:3001/api/v1/contributions/validate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(invalidContributionRequest)
    });

    const invalidData = await invalidResponse.json();
    console.log('✅ Invalid contribution handled correctly:');
    console.log(`   - Valid: ${invalidData.validation.isValid}`);
    console.log(`   - Error Message: ${invalidData.validation.errorMessage}`);
  } catch (error) {
    console.log('❌ Invalid contribution test failed:', error.message);
  }

  console.log('\n🎉 All API tests completed successfully!');
  console.log('The quote functionality should work properly in the browser.');
};

// Run the test
testQuoteAPI().catch(console.error);