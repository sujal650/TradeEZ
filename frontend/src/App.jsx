import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { MarketProvider } from './context/MarketContext';

import Navbar from './components/Navbar';
import TickerTape from './components/TickerTape';
import Footer from './components/Footer';
import ProtectedRoute from './components/ProtectedRoute';

import Home from './pages/Home';
import Market from './pages/Market';
import StockDetail from './pages/StockDetail';
import Portfolio from './pages/Portfolio';
import Transactions from './pages/Transactions';
import AdminDashboard from './pages/AdminDashboard';
import Login from './pages/Login';
import Register from './pages/Register';

import './App.css';

function App() {
  return (
    <Router>
      <AuthProvider>
        <MarketProvider>
          <div className="app-container">
            <Navbar />
            <TickerTape />
            <main className="main-content">
              <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/market" element={<Market />} />
                <Route path="/stock/:symbol" element={<StockDetail />} />
                
                {/* Protected User Routes */}
                <Route
                  path="/portfolio"
                  element={
                    <ProtectedRoute>
                      <Portfolio />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/transactions"
                  element={
                    <ProtectedRoute>
                      <Transactions />
                    </ProtectedRoute>
                  }
                />

                {/* Protected Admin Routes */}
                <Route
                  path="/admin"
                  element={
                    <ProtectedRoute requireAdmin={true}>
                      <AdminDashboard />
                    </ProtectedRoute>
                  }
                />

                {/* Auth Routes */}
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />

                {/* Catch-all */}
                <Route path="*" element={<Navigate to="/" replace />} />
              </Routes>
            </main>
            <Footer />
          </div>
        </MarketProvider>
      </AuthProvider>
    </Router>
  );
}

export default App;
