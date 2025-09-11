import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import QuoteForm from './components/QuoteForm';
import QuoteDisplay from './components/QuoteDisplay';
import Header from './components/Header';
import ContactPage from './components/ContactPage';
import InsuranceForm from './components/InsuranceForm';

function App() {
  return (
    <Router>
      <div className="min-h-screen bg-gray-50">
        <Header />
        <main className="container mx-auto px-4 py-8">
          <Routes>
            <Route path="/" element={<QuoteForm />} />
            <Route path="/quote" element={<QuoteDisplay />} />
            <Route path="/contact" element={<ContactPage />} />
            <Route path="/enroll/start" element={<InsuranceForm />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
}

export default App;
