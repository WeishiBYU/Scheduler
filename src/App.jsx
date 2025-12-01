import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { BookingProvider } from './contexts/BookingContext';
import Layout from './components/common/Layout';
import QuoteForm from './components/stage1/QuoteForm';
import AdditionalInfoForm from './components/stage1.5/AdditionalInfoForm';
import InformationForm from './components/stage2/InformationForm';
import SchedulingForm from './components/stage3/SchedulingForm';
import ConfirmationForm from './components/stage4/ConfirmationForm';
import { Login, Profile } from './components/login/Login';
import Chat from './components/chat/chat.jsx';
import { ChatClient } from './components/chat/Notifer.js';
import './App.css';

function App() {
  return (
    <BookingProvider>
      <Router>
        <Layout>
          <Routes>
            <Route path="/" element={<Navigate to="/quote" replace />} />
            <Route path="/quote" element={<QuoteForm />} />
            <Route path="/additional-info" element={<AdditionalInfoForm />} />
            <Route path="/information" element={<InformationForm />} />
            <Route path="/schedule" element={<SchedulingForm />} />
            <Route path="/confirmation" element={<ConfirmationForm />} />
            <Route path="/login" element={<Login />} />
            <Route path="/profile" element={<Profile />} />
            <Route path="/chat" element={<Chat webSocket={new ChatClient()} />} />
          </Routes>
        </Layout>
      </Router>
    </BookingProvider>
  );
}

export default App;