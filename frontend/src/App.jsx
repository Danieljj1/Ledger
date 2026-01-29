import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { isAuthenticated } from "./authService";

// Auth Components
import Login from "./components/Login";
import Register from "./components/Register";

// Layout
import Layout from "./components/Layout";

// Pages
import Dashboard from "./pages/Dashboard";
import AccountDetail from "./pages/AccountDetail";
import AccountsManage from "./pages/AccountsManage";
import Categories from "./pages/Categories";

// Protected Route Component
function ProtectedRoute({ children }) {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setIsLoggedIn(isAuthenticated());
    setLoading(false);
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-xl text-gray-600">Loading...</div>
      </div>
    );
  }

  return isLoggedIn ? children : <Navigate to="/login" />;
}

// Auth Route Component (redirects to dashboard if already logged in)
function AuthRoute({ children }) {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setIsLoggedIn(isAuthenticated());
    setLoading(false);
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-xl text-gray-600">Loading...</div>
      </div>
    );
  }

  return isLoggedIn ? <Navigate to="/dashboard" /> : children;
}

function App() {
  const [showLogin, setShowLogin] = useState(true);

  const switchToLogin = () => setShowLogin(true);
  const switchToRegister = () => setShowLogin(false);

  return (
    <BrowserRouter>
      <Routes>
        {/* Auth Routes */}
        <Route
          path="/login"
          element={
            <AuthRoute>
              <Login switchToRegister={switchToRegister} />
            </AuthRoute>
          }
        />
        <Route
          path="/register"
          element={
            <AuthRoute>
              <Register switchToLogin={switchToLogin} />
            </AuthRoute>
          }
        />

        {/* Protected Routes */}
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <Layout>
                <Dashboard />
              </Layout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/account/:id"
          element={
            <ProtectedRoute>
              <Layout>
                <AccountDetail />
              </Layout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/accounts"
          element={
            <ProtectedRoute>
              <Layout>
                <AccountsManage />
              </Layout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/categories"
          element={
            <ProtectedRoute>
              <Layout>
                <Categories />
              </Layout>
            </ProtectedRoute>
          }
        />

        {/* Default Route - Redirect to login */}
        <Route path="/" element={<Navigate to="/login" />} />

        {/* Catch all - redirect to dashboard if logged in, login if not */}
        <Route path="*" element={<Navigate to="/dashboard" />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
