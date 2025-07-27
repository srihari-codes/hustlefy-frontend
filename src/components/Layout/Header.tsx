import React from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { LogOut, User, Search, Menu, X, Zap, Home } from "lucide-react";

interface HeaderProps {
  bgColor?: string;
}

const Header: React.FC<HeaderProps> = ({ bgColor = "bg-white" }) => {
  const { isAuthenticated, user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = React.useState(false);
  const isHomePage = location.pathname === "/";
  const isAuthPage =
    location.pathname === "/login" || location.pathname === "/signup";
  const isOnboardingPage = location.pathname === "/onboarding";

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  return (
    <header
      className={`${bgColor} backdrop-blur-md border-b border-orange-200/30 sticky top-0 z-50`}
      style={bgColor.startsWith("#") ? { backgroundColor: bgColor } : {}}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-3 group">
            <div className="bg-gradient-to-r from-orange-500 to-red-500 p-2 rounded-xl group-hover:scale-110 transition-transform duration-200">
              <Zap className="h-6 w-6 text-white" />
            </div>
            <span className="text-2xl font-bold bg-gradient-to-r from-gray-800 to-gray-600 bg-clip-text text-transparent">
              Hustlefy
            </span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-1">
            {!isAuthenticated ? (
              <>
                {isAuthPage ? (
                  <Link
                    to="/"
                    className="px-4 py-2 text-gray-700 hover:text-orange-600 hover:bg-orange-50 rounded-lg transition-all duration-200 flex items-center space-x-2 font-medium"
                  >
                    <Home className="h-4 w-4" />
                    <span>Home</span>
                  </Link>
                ) : (
                  <>
                    {!isHomePage && (
                      <Link
                        to="/"
                        className="px-4 py-2 text-gray-700 hover:text-orange-600 hover:bg-orange-50 rounded-lg transition-all duration-200 flex items-center space-x-2 font-medium"
                      >
                        <Home className="h-4 w-4" />
                        <span>Home</span>
                      </Link>
                    )}
                    <Link
                      to="/login"
                      className="px-4 py-2 text-gray-700 hover:text-orange-600 hover:bg-orange-50 rounded-lg transition-all duration-200 font-medium"
                    >
                      Login
                    </Link>
                    <Link
                      to="/signup"
                      className="ml-2 bg-gradient-to-r from-orange-500 to-red-500 text-white px-6 py-2.5 rounded-xl hover:from-orange-600 hover:to-red-600 transition-all duration-200 font-semibold shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
                    >
                      Get Started
                    </Link>
                  </>
                )}
              </>
            ) : (
              <>
                {!isOnboardingPage && (
                  <>
                    {/* Show Home if on dashboard, otherwise show Dashboard */}
                    {location.pathname === "/provider/dashboard" ||
                    location.pathname === "/seeker/dashboard" ? (
                      <Link
                        to="/"
                        className="px-4 py-2 text-gray-700 hover:text-orange-600 hover:bg-orange-50 rounded-lg transition-all duration-200 flex items-center space-x-2 font-medium"
                      >
                        <Home className="h-4 w-4" />
                        <span>Home</span>
                      </Link>
                    ) : (
                      <Link
                        to={
                          user?.role === "provider"
                            ? "/provider/dashboard"
                            : "/seeker/dashboard"
                        }
                        className="px-4 py-2 text-gray-700 hover:text-orange-600 hover:bg-orange-50 rounded-lg transition-all duration-200 flex items-center space-x-2 font-medium"
                      >
                        <Search className="h-4 w-4" />
                        <span>Dashboard</span>
                      </Link>
                    )}
                    <Link
                      to="/profile"
                      className="px-4 py-2 text-gray-700 hover:text-orange-600 hover:bg-orange-50 rounded-lg transition-all duration-200 flex items-center space-x-2 font-medium"
                    >
                      <User className="h-4 w-4" />
                      <span>Profile</span>
                    </Link>
                  </>
                )}
                <button
                  onClick={handleLogout}
                  className="ml-2 px-3 py-2 text-gray-700 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all duration-200 flex items-center space-x-2 font-medium group"
                >
                  <LogOut className="h-5 w-5 group-hover:scale-110 transition-transform duration-200" />
                  <span>Logout</span>
                </button>
              </>
            )}
          </nav>

          {/* Mobile Menu Button */}
          {!(isAuthenticated && isOnboardingPage) && !isAuthPage && (
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 text-gray-700 hover:text-orange-600 hover:bg-orange-50 rounded-lg transition-all duration-200"
            >
              {mobileMenuOpen ? (
                <X className="h-6 w-6" />
              ) : (
                <Menu className="h-6 w-6" />
              )}
            </button>
          )}

          {/* For onboarding page, show logout button directly */}
          {isAuthenticated && isOnboardingPage && (
            <button
              onClick={handleLogout}
              className="md:hidden px-3 py-2 text-gray-700 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all duration-200 flex items-center space-x-2 font-medium"
            >
              <LogOut className="h-4 w-4" />
              <span>Logout</span>
            </button>
          )}

          {/* For auth pages, show home button directly */}
          {!isAuthenticated && isAuthPage && (
            <Link
              to="/"
              className="md:hidden px-3 py-2 text-gray-700 hover:text-orange-600 hover:bg-orange-50 rounded-lg transition-all duration-200 flex items-center space-x-2 font-medium"
            >
              <Home className="h-4 w-4" />
              <span>Home</span>
            </Link>
          )}
        </div>

        {/* Mobile Navigation */}
        {mobileMenuOpen && (
          <div className="md:hidden py-4 border-t border-orange-200/30">
            <div className="flex flex-col space-y-2">
              {!isAuthenticated ? (
                <>
                  {isAuthPage ? (
                    <Link
                      to="/"
                      className="px-4 py-3 text-gray-700 hover:text-orange-600 hover:bg-orange-50 rounded-lg transition-all duration-200 font-medium"
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      Home
                    </Link>
                  ) : (
                    <>
                      {!isHomePage && (
                        <Link
                          to="/"
                          className="px-4 py-3 text-gray-700 hover:text-orange-600 hover:bg-orange-50 rounded-lg transition-all duration-200 font-medium"
                          onClick={() => setMobileMenuOpen(false)}
                        >
                          Home
                        </Link>
                      )}
                      <Link
                        to="/login"
                        className="px-4 py-3 text-gray-700 hover:text-orange-600 hover:bg-orange-50 rounded-lg transition-all duration-200 font-medium"
                        onClick={() => setMobileMenuOpen(false)}
                      >
                        Login
                      </Link>
                      <Link
                        to="/signup"
                        className="mx-4 mt-2 bg-gradient-to-r from-orange-500 to-red-500 text-white px-6 py-3 rounded-xl text-center font-semibold"
                        onClick={() => setMobileMenuOpen(false)}
                      >
                        Get Started
                      </Link>
                    </>
                  )}
                </>
              ) : (
                <>
                  {!isOnboardingPage && (
                    <>
                      {/* Show Home if on dashboard, otherwise show Dashboard */}
                      {location.pathname === "/provider/dashboard" ||
                      location.pathname === "/seeker/dashboard" ? (
                        <Link
                          to="/"
                          className="px-4 py-3 text-gray-700 hover:text-orange-600 hover:bg-orange-50 rounded-lg transition-all duration-200 flex items-center space-x-2 font-medium"
                          onClick={() => setMobileMenuOpen(false)}
                        >
                          <Home className="h-4 w-4" />
                          <span>Home</span>
                        </Link>
                      ) : (
                        <Link
                          to={
                            user?.role === "provider"
                              ? "/provider/dashboard"
                              : "/seeker/dashboard"
                          }
                          className="px-4 py-3 text-gray-700 hover:text-orange-600 hover:bg-orange-50 rounded-lg transition-all duration-200 flex items-center space-x-2 font-medium"
                          onClick={() => setMobileMenuOpen(false)}
                        >
                          <Search className="h-4 w-4" />
                          <span>Dashboard</span>
                        </Link>
                      )}
                      <Link
                        to="/profile"
                        className="px-4 py-3 text-gray-700 hover:text-orange-600 hover:bg-orange-50 rounded-lg transition-all duration-200 flex items-center space-x-2 font-medium"
                        onClick={() => setMobileMenuOpen(false)}
                      >
                        <User className="h-4 w-4" />
                        <span>Profile</span>
                      </Link>
                    </>
                  )}
                  <button
                    onClick={() => {
                      handleLogout();
                      setMobileMenuOpen(false);
                    }}
                    className="px-4 py-3 text-gray-700 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all duration-200 flex items-center space-x-2 font-medium text-left"
                  >
                    <LogOut className="h-4 w-4" />
                    <span>Logout</span>
                  </button>
                </>
              )}
            </div>
          </div>
        )}
      </div>
    </header>
  );
};

export default Header;
