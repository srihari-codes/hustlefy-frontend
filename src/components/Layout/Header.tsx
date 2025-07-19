import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { LogOut, User, Briefcase, Search } from "lucide-react";

const Header: React.FC = () => {
  const { isAuthenticated, user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  return (
    <header className="bg-white shadow-sm border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <Link to="/" className="flex items-center space-x-2">
            <Briefcase className="h-8 w-8 text-blue-600" />
            <span className="text-xl font-bold text-gray-900">Hustlefy</span>
          </Link>

          <nav className="flex items-center space-x-4">
            {!isAuthenticated ? (
              <>
                <Link
                  to="/"
                  className="text-gray-700 hover:text-blue-600 transition-colors"
                >
                  Browse Jobs
                </Link>
                <Link
                  to="/login"
                  className="text-gray-700 hover:text-blue-600 transition-colors"
                >
                  Login
                </Link>
                <Link
                  to="/signup"
                  className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Sign Up
                </Link>
              </>
            ) : (
              <>
                <Link
                  to={
                    user?.role === "provider"
                      ? "/provider/dashboard"
                      : "/seeker/dashboard"
                  }
                  className="text-gray-700 hover:text-blue-600 transition-colors flex items-center space-x-1"
                >
                  <Search className="h-4 w-4" />
                  <span>Dashboard</span>
                </Link>
                <Link
                  to="/profile"
                  className="text-gray-700 hover:text-blue-600 transition-colors flex items-center space-x-1"
                >
                  <User className="h-4 w-4" />
                  <span>Profile</span>
                </Link>
                <button
                  onClick={handleLogout}
                  className="text-gray-700 hover:text-red-600 transition-colors flex items-center space-x-1"
                >
                  <LogOut className="h-4 w-4" />
                  <span>Logout</span>
                </button>
              </>
            )}
          </nav>
        </div>
      </div>
    </header>
  );
};

export default Header;
