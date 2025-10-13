import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { BookingProvider } from './contexts/BookingContext';
import Layout from './components/common/Layout';
import QuoteForm from './components/stage1/QuoteForm';
import SchedulingForm from './components/stage3/SchedulingForm';
import InformationForm from './components/stage2/InformationForm';
import ConfirmationForm from './components/stage4/ConfirmationForm';
import './App.css';

function App() {
  return (
    <BookingProvider>
      <Router>
        <Layout>
          <Routes>
            <Route path="/" element={<Navigate to="/quote" replace />} />
            <Route path="/quote" element={<QuoteForm />} />
            <Route path="/information" element={<InformationForm />} />
            <Route path="/schedule" element={<SchedulingForm />} />
            <Route path="/confirmation" element={<ConfirmationForm />} />
          </Routes>
        </Layout>
      </Router>
    </BookingProvider>
  );
}

export default App;