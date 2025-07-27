import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Briefcase, Mail, Lock, Shield, RefreshCw } from "lucide-react";
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

  const navigate = useNavigate();
  const { login, loginWithGoogle } = useAuth();

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

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setError(""); // Clear error when user types
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

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md mx-auto">
        <div className="text-center">
          <Briefcase className="mx-auto h-12 w-12 text-blue-600" />
          <h2 className="mt-6 text-3xl font-bold text-gray-900">
            Join Hustlefy
          </h2>
          <p className="mt-2 text-sm text-gray-600">
            Or{" "}
            <Link
              to="/login"
              className="font-medium text-blue-600 hover:text-blue-500"
            >
              sign in to your existing account
            </Link>
          </p>
        </div>

        <div className="mt-8 bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
          <div className="space-y-6">
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
                {error}
              </div>
            )}

            {/* Google Sign-In Button */}
            <div className="mb-6">
              <div id="google-signin-button"></div>
            </div>

            {/* OR Divider */}
            <div className="flex items-center my-4">
              <div className="flex-grow border-t border-gray-200"></div>
              <span className="mx-4 text-gray-500 font-medium">or</span>
              <div className="flex-grow border-t border-gray-200"></div>
            </div>

            {/* Email Sign-Up Fields */}
            {/* Email */}
            <div>
              <label
                htmlFor="email"
                className="block text-sm font-medium text-gray-700"
              >
                Email Address
              </label>
              <div className="mt-1 relative">
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                <input
                  id="email"
                  name="email"
                  type="email"
                  required
                  value={formData.email}
                  onChange={handleInputChange}
                  disabled={otpSent}
                  className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100"
                  placeholder="your@email.com"
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <label
                htmlFor="password"
                className="block text-sm font-medium text-gray-700"
              >
                Password
              </label>
              <div className="mt-1 relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                <input
                  id="password"
                  name="password"
                  type="password"
                  required
                  value={formData.password}
                  onChange={handleInputChange}
                  disabled={otpSent}
                  className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100"
                  placeholder="Create a password"
                />
              </div>
            </div>

            {/* Confirm Password */}
            <div>
              <label
                htmlFor="confirmPassword"
                className="block text-sm font-medium text-gray-700"
              >
                Confirm Password
              </label>
              <div className="mt-1 relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                <input
                  id="confirmPassword"
                  name="confirmPassword"
                  type="password"
                  required
                  value={formData.confirmPassword}
                  onChange={handleInputChange}
                  disabled={otpSent}
                  className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100"
                  placeholder="Confirm your password"
                />
              </div>
            </div>

            {/* OTP Field - Only shows after OTP is sent */}
            {showOtp && (
              <div className="animate-pulse">
                <label
                  htmlFor="otp"
                  className="block text-sm font-medium text-gray-700"
                >
                  Email Verification Code
                </label>
                <div className="mt-1 relative">
                  <Shield className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                  <input
                    id="otp"
                    name="otp"
                    type="text"
                    required
                    value={formData.otp}
                    onChange={handleInputChange}
                    className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Enter 6-digit code"
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
                    className="text-sm text-blue-600 hover:text-blue-500 disabled:text-gray-400 disabled:cursor-not-allowed"
                  >
                    {otpTimer > 0 ? `Resend in ${otpTimer}s` : "Resend Code"}
                  </button>
                </div>
              </div>
            )}

            <div>
              <button
                type="button"
                onClick={handleSubmit}
                disabled={isLoading || isSendingOTP}
                className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
              >
                {isSendingOTP ? (
                  <>
                    <RefreshCw className="animate-spin h-4 w-4 mr-2" />
                    Sending Code...
                  </>
                ) : isLoading ? (
                  "Creating Account..."
                ) : !showOtp ? (
                  "Send Verification Code"
                ) : (
                  "Verify & Create Account"
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Signup;
