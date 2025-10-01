import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import QuoteForm from './components/QuoteForm';
import QuoteDisplay from './components/QuoteDisplay';
import Header from './components/Header';
import ContactPage from './components/ContactPage';
import InsuranceForm from './components/InsuranceForm';
import EnhancedContributionForm from './components/EnhancedContributionForm';
import BeneficiariesPage from './components/BeneficiariesPage';
import EnrollmentConfirmation from './components/EnrollmentConfirmation';
import EnrollmentSuccess from './components/EnrollmentSuccess';
import EnrollmentError from './components/EnrollmentError';
import AboutPage from './components/AboutPage';
import { QuoteProvider } from './context/QuoteContext';

function App() {
  return (
    <QuoteProvider>
      <Router>
        <div className="min-h-screen bg-gray-50">
          <Header />
          <Routes>
            <Route path="/about" element={<AboutPage />} />
            <Route path="*" element={
              <main className="container mx-auto px-4 py-8">
                <Routes>
                  <Route path="/" element={<QuoteForm />} />
                  <Route path="/quote" element={<QuoteDisplay />} />
                  <Route path="/contact" element={<ContactPage />} />
                  <Route path="/enroll/start" element={<InsuranceForm />} />
                  <Route path="/enroll/contribution" element={<EnhancedContributionForm />} />
                  <Route path="/enroll/beneficiaries" element={<BeneficiariesPage />} />
                  <Route path="/enroll/confirmation" element={<EnrollmentConfirmation />} />
                  <Route path="/enroll/success" element={<EnrollmentSuccess />} />
                  <Route path="/enroll/error" element={<EnrollmentError />} />
                </Routes>
              </main>
            } />
          </Routes>
        </div>
      </Router>
    </QuoteProvider>
  );
}

export default App;
