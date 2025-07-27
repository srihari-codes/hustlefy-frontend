import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { Mail, Lock, Eye, EyeOff } from "lucide-react";

// Declare Google Sign-In types
declare global {
  interface Window {
    google: any;
  }
}

const Login: React.FC = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [emailSuggestions, setEmailSuggestions] = useState<string[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const { loginWithCredentials, loginWithGoogle } = useAuth();
  const navigate = useNavigate();

  // Common email domains
  const commonDomains = [
    "gmail.com",
    "yahoo.com",
    "hotmail.com",
    "outlook.com",
    "icloud.com",
    "protonmail.com",
    "aol.com",
    "live.com",
    "msn.com",
    "ymail.com",
  ];

  // Form validation
  const isFormValid = email && password && password.length >= 6;

  // Email suggestion logic
  useEffect(() => {
    const emailValue = email;
    if (emailValue && emailValue.includes("@")) {
      const [localPart, domainPart] = emailValue.split("@");
      if (domainPart && domainPart.length > 0) {
        const suggestions = commonDomains
          .filter((domain) =>
            domain.toLowerCase().startsWith(domainPart.toLowerCase())
          )
          .map((domain) => `${localPart}@${domain}`)
          .slice(0, 5);

        setEmailSuggestions(suggestions);
        setShowSuggestions(
          suggestions.length > 0 && domainPart !== suggestions[0]?.split("@")[1]
        );
      } else {
        setShowSuggestions(false);
      }
    } else {
      setShowSuggestions(false);
    }
  }, [email]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!isFormValid) return;

    setError("");
    setIsLoading(true);

    try {
      await loginWithCredentials(email, password);
      const user = JSON.parse(localStorage.getItem("user") || "{}");
      navigate(
        user.role === "provider" ? "/provider/dashboard" : "/seeker/dashboard"
      );
    } catch (error: any) {
      setError(error.message || "Login failed. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleSignIn = async (credentialResponse: any) => {
    setError("");
    setIsLoading(true);

    try {
      const response = await loginWithGoogle(credentialResponse.credential);
      // Use response.user and response.isNewUser directly
      if (response?.isNewUser) {
        navigate("/onboarding"); // Redirect new users to onboarding
      } else {
        navigate(
          response.user.role === "provider"
            ? "/provider/dashboard"
            : "/seeker/dashboard"
        );
      }
    } catch (error: any) {
      setError(error.message || "Google sign-in failed. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleEmailSuggestionClick = (suggestion: string) => {
    setEmail(suggestion);
    setShowSuggestions(false);
  };

  useEffect(() => {
    if (window.google) {
      window.google.accounts.id.initialize({
        client_id: import.meta.env.VITE_GOOGLE_CLIENT_ID,
        callback: handleGoogleSignIn,
      });

      window.google.accounts.id.renderButton(
        document.getElementById("google-signin-button"),
        {
          theme: "outline",
          size: "large",
          width: "100%",
          text: "signin_with",
        }
      );
    }
  }, []);

  return (
    <div className="min-h-screen bg-orange-50 relative">
      {/* Very subtle background elements */}
      <div className="absolute inset-0">
        <div className="absolute top-1/3 left-1/3 w-64 h-64 bg-orange-100/30 rounded-full blur-3xl"></div>
        <div className="absolute bottom-1/3 right-1/3 w-48 h-48 bg-orange-200/20 rounded-full blur-3xl"></div>
      </div>

      <div className="relative min-h-screen flex flex-col justify-center py-12 sm:px-6 lg:px-8">
        <div className="sm:mx-auto sm:w-full sm:max-w-md">
          <div className="flex justify-center">
            <div className="rounded-xl bg-white/80 border border-orange-100 shadow-sm overflow-hidden">
              <img
                src="/assets/images/hustlefy-logo.png"
                alt="Hustlefy"
                className="h-16 w-16 object-cover"
              />
            </div>
          </div>
          <h2 className="mt-6 text-center text-3xl font-bold text-gray-800">
            Sign in to Hustlefy
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            Or{" "}
            <Link
              to="/signup"
              className="font-medium text-orange-600 hover:text-orange-500 transition-colors duration-200"
            >
              create a new account
            </Link>
          </p>
        </div>

        <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
          {/* Minimalist glass container */}
          <div className="relative">
            <div className="bg-white/60 backdrop-blur-sm border border-orange-100/60 shadow-lg rounded-2xl p-8">
              {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6">
                  {error}
                </div>
              )}

              {/* Google Sign-In Button */}
              <div className="mb-8">
                <div id="google-signin-button" className="w-full"></div>
                {/* Custom styled overlay for better integration */}
                <style>{`
                  #google-signin-button > div {
                    background: rgba(255, 255, 255, 0.9) !important;
                    border: 1px solid rgba(249, 115, 22, 0.2) !important;
                    border-radius: 12px !important;
                    transition: all 0.2s ease !important;
                  }
                  #google-signin-button > div:hover {
                    background: rgba(255, 255, 255, 1) !important;
                    box-shadow: 0 4px 12px rgba(249, 115, 22, 0.1) !important;
                  }
                `}</style>
              </div>

              {/* Clean divider */}
              <div className="relative mb-6">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-gray-200"></div>
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-3 bg-white text-gray-500">
                    Or continue with email
                  </span>
                </div>
              </div>

              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Email Input with Suggestions */}
                <div className="group relative">
                  <label
                    htmlFor="email"
                    className="block text-sm font-medium text-gray-700 mb-1"
                  >
                    Email address
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5 z-10" />
                    <input
                      id="email"
                      name="email"
                      type="email"
                      autoComplete="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      onFocus={() => {
                        if (emailSuggestions.length > 0)
                          setShowSuggestions(true);
                      }}
                      onBlur={() => {
                        // Delay hiding suggestions to allow clicks
                        setTimeout(() => setShowSuggestions(false), 200);
                      }}
                      className="w-full pl-10 pr-3 py-2 bg-white/80 border border-gray-200 rounded-lg placeholder-gray-400 text-gray-900 focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-all duration-200"
                      placeholder="Enter your email"
                    />

                    {/* Email Suggestions Dropdown */}
                    {showSuggestions && emailSuggestions.length > 0 && (
                      <div className="absolute top-full left-0 right-0 bg-white border border-gray-200 rounded-lg shadow-lg z-20 mt-1 max-h-40 overflow-y-auto">
                        {emailSuggestions.map((suggestion, index) => (
                          <button
                            key={index}
                            type="button"
                            onClick={() =>
                              handleEmailSuggestionClick(suggestion)
                            }
                            className="w-full text-left px-4 py-2 hover:bg-orange-50 focus:bg-orange-50 focus:outline-none transition-colors duration-150 text-gray-700 first:rounded-t-lg last:rounded-b-lg"
                          >
                            <span className="text-gray-900">
                              {suggestion.split("@")[0]}
                            </span>
                            <span className="text-orange-600">
                              @{suggestion.split("@")[1]}
                            </span>
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                {/* Password Input */}
                <div className="group">
                  <label
                    htmlFor="password"
                    className="block text-sm font-medium text-gray-700 mb-1"
                  >
                    Password
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                    <input
                      id="password"
                      name="password"
                      type={showPassword ? "text" : "password"}
                      autoComplete="current-password"
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="w-full pl-10 pr-12 py-2 bg-white/80 border border-gray-200 rounded-lg placeholder-gray-400 text-gray-900 focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-all duration-200"
                      placeholder="Enter your password"
                      minLength={6}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors duration-200"
                    >
                      {showPassword ? (
                        <EyeOff className="h-4 w-4" />
                      ) : (
                        <Eye className="h-4 w-4" />
                      )}
                    </button>
                  </div>
                  {password && password.length < 6 && (
                    <p className="mt-1 text-sm text-red-600">
                      Password must be at least 6 characters
                    </p>
                  )}
                </div>

                {/* Sign In Button */}
                <div>
                  <button
                    type="submit"
                    disabled={isLoading || !isFormValid}
                    className="w-full py-2 px-4 bg-orange-600 hover:bg-orange-700 text-white font-medium rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
                  >
                    {isLoading ? (
                      <div className="flex items-center justify-center space-x-2">
                        <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                        <span>Signing in...</span>
                      </div>
                    ) : (
                      "Sign in"
                    )}
                  </button>
                </div>
              </form>

              {/* Simple bottom section */}
              <div className="mt-6">
                <div className="relative">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-gray-200"></div>
                  </div>
                  <div className="relative flex justify-center text-sm">
                    <span className="px-3 bg-white text-gray-500">
                      Need an account?
                    </span>
                  </div>
                </div>

                <div className="mt-4 text-center">
                  <Link
                    to="/signup"
                    className="text-orange-600 hover:text-orange-500 font-medium transition-colors duration-200"
                  >
                    Create a new account
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <style>{`
        .animate-fade-in {
          animation: fadeIn 0.3s ease-out;
        }
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
    </div>
  );
};

export default Login;
