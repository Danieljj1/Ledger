import { Link, useNavigate, useLocation } from "react-router-dom";
import { useState } from "react";
import { logout } from "../authService";

function Sidebar() {
  const navigate = useNavigate();
  const location = useLocation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  const isActive = (path) => {
    return location.pathname === path;
  };

  const closeMobileMenu = () => {
    setIsMobileMenuOpen(false);
  };

  return (
    <>
      {/* Mobile Hamburger Button */}
      <button
        onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
        className="lg:hidden fixed top-4 left-4 z-50 p-2 bg-navy-800 text-gold-500 rounded-lg"
      >
        <svg
          className="w-6 h-6"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          {isMobileMenuOpen ? (
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M6 18L18 6M6 6l12 12"
            />
          ) : (
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M4 6h16M4 12h16M4 18h16"
            />
          )}
        </svg>
      </button>

      {/* Overlay for mobile */}
      {isMobileMenuOpen && (
        <div
          className="lg:hidden fixed inset-0 bg-black bg-opacity-50 z-40"
          onClick={closeMobileMenu}
        ></div>
      )}

      {/* Sidebar */}
      <div
        className={`
          fixed lg:static inset-y-0 left-0 z-40
          w-64 bg-gradient-to-b from-navy-800 to-navy-900 text-white p-5 
          flex flex-col min-h-screen
          transform transition-transform duration-300 ease-in-out
          ${
            isMobileMenuOpen
              ? "translate-x-0"
              : "-translate-x-full lg:translate-x-0"
          }
        `}
      >
        {/* Logo */}
        <div className="text-2xl font-bold text-gold-500 mb-10 py-2">
          Finance Manager
        </div>

        {/* Navigation */}
        <nav className="flex-1">
          <Link
            to="/dashboard"
            onClick={closeMobileMenu}
            className={`flex items-center gap-3 px-5 py-4 mb-2 rounded-lg transition-all ${
              isActive("/dashboard")
                ? "bg-gold-500 text-navy-800 font-semibold"
                : "hover:bg-gold-500 hover:bg-opacity-10"
            }`}
          >
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"
              />
            </svg>
            <span>Dashboard</span>
          </Link>

          <Link
            to="/accounts"
            onClick={closeMobileMenu}
            className={`flex items-center gap-3 px-5 py-4 mb-2 rounded-lg transition-all ${
              isActive("/accounts")
                ? "bg-gold-500 text-navy-800 font-semibold"
                : "hover:bg-gold-500 hover:bg-opacity-10"
            }`}
          >
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
              />
            </svg>
            <span>Accounts</span>
          </Link>

          <Link
            to="/categories"
            onClick={closeMobileMenu}
            className={`flex items-center gap-3 px-5 py-4 mb-2 rounded-lg transition-all ${
              isActive("/categories")
                ? "bg-gold-500 text-navy-800 font-semibold"
                : "hover:bg-gold-500 hover:bg-opacity-10"
            }`}
          >
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z"
              />
            </svg>
            <span>Categories</span>
          </Link>

          <Link
            to="/charts"
            onClick={closeMobileMenu}
            className={`flex items-center gap-3 px-5 py-4 mb-2 rounded-lg transition-all ${
              isActive("/charts")
                ? "bg-gold-500 text-navy-800 font-semibold"
                : "hover:bg-gold-500 hover:bg-opacity-10"
            }`}
          >
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
              />
            </svg>
            <span>Charts</span>
          </Link>

          <Link
            to="/budgets"
            onClick={closeMobileMenu}
            className={`flex items-center gap-3 px-5 py-4 mb-2 rounded-lg transition-all ${
              isActive("/budgets")
                ? "bg-gold-500 text-navy-800 font-semibold"
                : "hover:bg-gold-500 hover:bg-opacity-10"
            }`}
          >
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z"
              />
            </svg>
            <span>Budgets</span>
          </Link>

          <Link
            to="/ai-advisor"
            onClick={closeMobileMenu}
            className={`flex items-center gap-3 px-5 py-4 mb-2 rounded-lg transition-all ${
              isActive("/ai-advisor")
                ? "bg-gold-500 text-navy-800 font-semibold"
                : "hover:bg-gold-500 hover:bg-opacity-10"
            }`}
          >
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"
              />
            </svg>
            <span>AI Advisor</span>
          </Link>
        </nav>

        {/* Logout Button */}
        <button
          onClick={handleLogout}
          className="px-5 py-4 border border-gold-500 text-gold-500 rounded-lg hover:bg-gold-500 hover:text-navy-800 transition-all"
        >
          <div className="flex items-center gap-3">
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
              />
            </svg>
            <span>Logout</span>
          </div>
        </button>
      </div>
    </>
  );
}

export default Sidebar;
