import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  Mail,
  Lock,
  Shield,
  RefreshCw,
  Eye,
  EyeOff,
  AlertCircle,
  CheckCircle,
} from "lucide-react";
import { useAuth } from "../context/AuthContext";

declare global {
  interface Window {
    google: any;
  }
}

const API_BASE_URL = import.meta.env.VITE_API_URL;

const Signup: React.FC = () => {
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    confirmPassword: "",
    otp: "",
  });
  const [isLoading, setIsLoading] = useState(false);
  const [isSendingOTP, setIsSendingOTP] = useState(false);
  const [error, setError] = useState("");
  const [showOtp, setShowOtp] = useState(false);
  const [otpSent, setOtpSent] = useState(false);
  const [otpTimer, setOtpTimer] = useState(0);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [emailSuggestions, setEmailSuggestions] = useState<string[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [passwordsMatch, setPasswordsMatch] = useState<boolean | null>(null);
  const [passwordRequirements, setPasswordRequirements] = useState({
    length: false,
    // You can add more requirements later like uppercase, numbers, etc.
  });

  const navigate = useNavigate();
  const { login, loginWithGoogle } = useAuth();

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
  const isFormValid = !showOtp
    ? formData.email &&
      formData.password &&
      formData.confirmPassword &&
      formData.password.length >= 6 &&
      passwordsMatch === true
    : formData.otp.length === 6;

  // Timer for OTP resend
  useEffect(() => {
    let interval: ReturnType<typeof setInterval>;
    if (otpTimer > 0) {
      interval = setInterval(() => {
        setOtpTimer((prev) => prev - 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [otpTimer]);

  // Password match validation
  useEffect(() => {
    if (formData.password && formData.confirmPassword) {
      setPasswordsMatch(formData.password === formData.confirmPassword);
    } else {
      setPasswordsMatch(null);
    }
  }, [formData.password, formData.confirmPassword]);

  // Email suggestion logic
  useEffect(() => {
    const email = formData.email;
    if (email && email.includes("@")) {
      const [localPart, domainPart] = email.split("@");
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
  }, [formData.email]);

  // Google Sign-In Button
  const handleGoogleSignIn = async (credentialResponse: any) => {
    setError("");
    setIsLoading(true);

    try {
      const response = await loginWithGoogle(credentialResponse.credential);
      if (response?.isNewUser) {
        navigate("/onboarding");
      } else {
        console.log("User already exists, redirecting to dashboard");

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

  useEffect(() => {
    if (window.google) {
      window.google.accounts.id.initialize({
        client_id: import.meta.env.VITE_GOOGLE_CLIENT_ID,
        callback: handleGoogleSignIn,
        auto_select: false,
        cancel_on_tap_outside: true,
      });

      window.google.accounts.id.renderButton(
        document.getElementById("google-signin-button"),
        {
          theme: "outline",
          size: "large",
          width: 355, // Changed from 384 to 355 to match Login.tsx
          height: 44, // Fixed height in pixels
          text: "signin_with",
          shape: "rectangular",
          logo_alignment: "left",
        }
      );
    }
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setError(""); // Clear error when user types
  };

  const handleOtpChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { value } = e.target;
    // Only allow numbers and limit to 6 characters
    const numericValue = value.replace(/[^0-9]/g, "").slice(0, 6);
    setFormData((prev) => ({ ...prev, otp: numericValue }));
    setError(""); // Clear error when user types
  };

  const handleEmailSuggestionClick = (suggestion: string) => {
    setFormData((prev) => ({ ...prev, email: suggestion }));
    setShowSuggestions(false);
  };

  const sendOTP = async () => {
    if (!formData.email) {
      setError("Please enter your email address");
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    if (formData.password.length < 6) {
      setError("Password must be at least 6 characters long");
      return;
    }

    setIsSendingOTP(true);
    setError("");

    try {
      const response = await fetch(`${API_BASE_URL}/auth/send-otp`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: formData.email,
          password: formData.password,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        setShowOtp(true);
        setOtpSent(true);
        setOtpTimer(60); // 60 seconds countdown
      } else {
        setError(data.message || "Failed to send OTP. Please try again.");
      }
    } catch (error) {
      setError("Network error. Please check your connection and try again.");
    } finally {
      setIsSendingOTP(false);
    }
  };

  const verifyOTP = async () => {
    if (!formData.otp || formData.otp.length !== 6) {
      setError("Please enter a valid 6-digit OTP");
      return;
    }

    setIsLoading(true);
    setError("");

    try {
      const response = await fetch(`${API_BASE_URL}/auth/verify-otp`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: formData.email,
          otp: formData.otp,
          password: formData.password,
        }),
      });

      const data = await response.json();

      if (response.ok && data.user && data.token) {
        localStorage.setItem("token", data.token);
        localStorage.setItem("user", JSON.stringify(data.user));
        if (login) {
          login(data.user);
        }
        navigate("/onboarding");
      } else {
        setError(data.message || "Invalid OTP. Please try again.");
      }
    } catch (error) {
      setError("Network error. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLButtonElement>) => {
    e.preventDefault();

    if (!showOtp) {
      await sendOTP();
    } else {
      await verifyOTP();
    }
  };

  const resendOTP = async () => {
    if (otpTimer > 0) return;

    setFormData((prev) => ({ ...prev, otp: "" }));
    await sendOTP();
  };

  // Add this useEffect after your existing useEffects
  useEffect(() => {
    if (formData.password) {
      setPasswordRequirements({
        length: formData.password.length >= 6,
        // Add more checks here as needed
      });
    } else {
      setPasswordRequirements({
        length: false,
      });
    }
  }, [formData.password]);

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
            Join Hustlefy
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            Or{" "}
            <Link
              to="/login"
              className="font-medium text-orange-600 hover:text-orange-500 transition-colors duration-200"
            >
              sign in to your existing account
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
              <div id="google-signin-button" className="mb-8"></div>

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

              <div className="space-y-6">
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
                      required
                      value={formData.email}
                      onChange={handleInputChange}
                      onFocus={() => {
                        if (emailSuggestions.length > 0)
                          setShowSuggestions(true);
                      }}
                      onBlur={() => {
                        // Delay hiding suggestions to allow clicks
                        setTimeout(() => setShowSuggestions(false), 200);
                      }}
                      disabled={otpSent}
                      className="w-full pl-10 pr-3 py-2 bg-white/80 border border-gray-200 rounded-lg placeholder-gray-400 text-gray-900 focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-all duration-200 disabled:bg-gray-100"
                      placeholder="Enter your email"
                    />

                    {/* Email Suggestions Dropdown */}
                    {showSuggestions &&
                      emailSuggestions.length > 0 &&
                      !otpSent && (
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
                      required
                      value={formData.password}
                      onChange={handleInputChange}
                      disabled={otpSent}
                      className="w-full pl-10 pr-12 py-2 bg-white/80 border border-gray-200 rounded-lg placeholder-gray-400 text-gray-900 focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-all duration-200 disabled:bg-gray-100"
                      placeholder="Create a password"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      disabled={otpSent}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
                    >
                      {showPassword ? (
                        <EyeOff className="h-4 w-4" />
                      ) : (
                        <Eye className="h-4 w-4" />
                      )}
                    </button>
                  </div>

                  {/* Password Requirements Indicator */}
                  {formData.password && (
                    <div className="mt-2 space-y-1">
                      <div
                        className={`flex items-center space-x-2 text-sm transition-all duration-200 ${
                          passwordRequirements.length
                            ? "text-green-600"
                            : "text-gray-500"
                        }`}
                      >
                        {passwordRequirements.length ? (
                          <CheckCircle className="h-4 w-4" />
                        ) : (
                          <AlertCircle className="h-4 w-4" />
                        )}
                        <span>At least 6 characters</span>
                      </div>
                    </div>
                  )}
                </div>

                {/* Confirm Password Input */}
                <div className="group">
                  <label
                    htmlFor="confirmPassword"
                    className="block text-sm font-medium text-gray-700 mb-1"
                  >
                    Confirm Password
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                    <input
                      id="confirmPassword"
                      name="confirmPassword"
                      type={showConfirmPassword ? "text" : "password"}
                      required
                      value={formData.confirmPassword}
                      onChange={handleInputChange}
                      disabled={otpSent}
                      className={`w-full pl-10 pr-12 py-2 bg-white/80 border rounded-lg placeholder-gray-400 text-gray-900 focus:outline-none focus:ring-2 transition-all duration-200 disabled:bg-gray-100 ${
                        passwordsMatch === false
                          ? "border-red-300 focus:border-red-500 focus:ring-red-500/20"
                          : passwordsMatch === true
                          ? "border-green-300 focus:border-green-500 focus:ring-green-500/20"
                          : "border-gray-200 focus:border-orange-500 focus:ring-orange-500/20"
                      }`}
                      placeholder="Confirm your password"
                    />
                    <button
                      type="button"
                      onClick={() =>
                        setShowConfirmPassword(!showConfirmPassword)
                      }
                      disabled={otpSent}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
                    >
                      {showConfirmPassword ? (
                        <EyeOff className="h-4 w-4" />
                      ) : (
                        <Eye className="h-4 w-4" />
                      )}
                    </button>
                  </div>

                  {/* Password Match Indicator */}
                  {formData.confirmPassword && passwordsMatch !== null && (
                    <div
                      className={`mt-2 flex items-center space-x-2 text-sm transition-all duration-200 ${
                        passwordsMatch ? "text-green-600" : "text-red-600"
                      }`}
                    >
                      {passwordsMatch ? (
                        <>
                          <CheckCircle className="h-4 w-4" />
                          <span>Passwords match</span>
                        </>
                      ) : (
                        <>
                          <AlertCircle className="h-4 w-4" />
                          <span>Passwords don't match</span>
                        </>
                      )}
                    </div>
                  )}
                </div>

                {/* OTP Field - Only shows after OTP is sent */}
                {showOtp && (
                  <div className="group animate-fade-in">
                    <label
                      htmlFor="otp"
                      className="block text-sm font-medium text-gray-700 mb-1"
                    >
                      Email Verification Code
                    </label>
                    <div className="relative">
                      <Shield className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                      <input
                        id="otp"
                        name="otp"
                        type="text"
                        inputMode="numeric"
                        pattern="[0-9]*"
                        required
                        value={formData.otp}
                        onChange={handleOtpChange}
                        className="w-full pl-10 pr-3 py-2 bg-white/80 border border-gray-200 rounded-lg placeholder-gray-400 text-gray-900 focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-all duration-200 text-center text-lg tracking-widest font-mono"
                        placeholder="000000"
                        maxLength={6}
                      />
                    </div>
                    <div className="mt-2 flex justify-between items-center">
                      <p className="text-sm text-gray-600">
                        Code sent to {formData.email}
                      </p>
                      <button
                        type="button"
                        onClick={resendOTP}
                        disabled={otpTimer > 0}
                        className="text-sm text-orange-600 hover:text-orange-500 disabled:text-gray-400 disabled:cursor-not-allowed transition-colors duration-200"
                      >
                        {otpTimer > 0 ? (
                          <span className="text-orange-600 font-medium">
                            Resend in {otpTimer}s
                          </span>
                        ) : (
                          "Resend Code"
                        )}
                      </button>
                    </div>
                  </div>
                )}

                {/* Submit Button */}
                <div>
                  <button
                    type="button"
                    onClick={handleSubmit}
                    disabled={isLoading || isSendingOTP || !isFormValid}
                    className="w-full py-2 px-4 bg-orange-600 hover:bg-orange-700 text-white font-medium rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
                  >
                    {isSendingOTP ? (
                      <div className="flex items-center justify-center space-x-2">
                        <RefreshCw className="animate-spin h-4 w-4" />
                        <span>Sending Code...</span>
                      </div>
                    ) : isLoading ? (
                      <div className="flex items-center justify-center space-x-2">
                        <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                        <span>Creating Account...</span>
                      </div>
                    ) : !showOtp ? (
                      "Send Verification Code"
                    ) : (
                      "Verify & Create Account"
                    )}
                  </button>
                </div>
              </div>

              {/* Simple bottom section */}
              <div className="mt-6">
                <div className="relative">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-gray-200"></div>
                  </div>
                  <div className="relative flex justify-center text-sm">
                    <span className="px-3 bg-white text-gray-500">
                      Already have an account?
                    </span>
                  </div>
                </div>

                <div className="mt-4 text-center">
                  <Link
                    to="/login"
                    className="text-orange-600 hover:text-orange-500 font-medium transition-colors duration-200"
                  >
                    Sign in to your account
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
        
        /* Center Google Sign-In Button to the form */
        #google-signin-button {
          display: flex !important;
          justify-content: center !important;
          align-items: center !important;
          width: 100% !important;
        }
        
        #google-signin-button > div,
        #google-signin-button iframe {
          width: 355px !important;
          height: 44px !important;
          margin: 0 auto !important;
        }
      `}</style>
    </div>
  );
};

export default Signup;
