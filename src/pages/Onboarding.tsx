import React, { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { workCategories } from "../data/mockData";
import PhoneInput from "react-phone-number-input";
import "react-phone-number-input/style.css";
import { isValidPhoneNumber, parsePhoneNumber } from "react-phone-number-input";
import { Briefcase, User, FileText, XCircle } from "lucide-react";

const Onboarding: React.FC = () => {
  const [searchParams] = useSearchParams();
  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    location: "",
    role: searchParams.get("role") || "seeker",
    workCategories: [] as string[],
    bio: "",
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const { updateUserProfile, user } = useAuth();
  const navigate = useNavigate();
  const [submitted, setSubmitted] = useState(false);
  const [touched, setTouched] = useState({
    name: false,
    phone: false,
    workCategories: false,
    bio: false,
  });

  // Validation functions
  const validateName = (name: string) => {
    const trimmed = name.trim();
    if (trimmed.length === 0)
      return { valid: false, message: "Name is required" };
    if (trimmed.length > 50)
      return { valid: false, message: "Name must be 50 characters or less" };
    if (!/^[a-zA-Z\s'-]+$/.test(trimmed))
      return {
        valid: false,
        message:
          "Name can only contain letters, spaces, hyphens, and apostrophes",
      };
    return { valid: true, message: "" };
  };

  const validatePhone = (phone: string) => {
    // Don't validate if phone is empty or just country code
    if (!phone || phone.trim() === "") {
      return { valid: false, message: "Phone number is required" };
    }

    // Don't show validation error if it's just a country code (like +91, +1, etc.)
    const phoneDigits = phone.replace(/\D/g, "");
    if (phoneDigits.length <= 3) {
      return { valid: false, message: "" }; // Don't show error message yet
    }

    // Use the built-in validation from react-phone-number-input
    try {
      if (!isValidPhoneNumber(phone)) {
        return { valid: false, message: "Please enter a valid phone number" };
      }
    } catch (error) {
      return { valid: false, message: "" }; // Don't show error for incomplete numbers
    }

    return { valid: true, message: "" };
  };

  const validateWorkCategories = (categories: string[], role: string) => {
    if (role !== "seeker") return { valid: true, message: "" };
    if (categories.length === 0)
      return {
        valid: false,
        message: "At least one work category is required",
      };
    const invalidCategories = categories.filter(
      (cat) => !workCategories.includes(cat)
    );
    if (invalidCategories.length > 0)
      return { valid: false, message: "Invalid categories selected" };
    return { valid: true, message: "" };
  };

  const validateBio = (bio: string, role: string) => {
    if (role !== "seeker") return { valid: true, message: "" };
    const trimmed = bio.trim();
    const stripped = trimmed.replace(/<[^>]*>/g, ""); // Strip HTML
    if (stripped.length === 0)
      return { valid: false, message: "Bio is required" };
    if (stripped.length > 300)
      return { valid: false, message: "Bio must be 300 characters or less" };
    if (stripped.length < 20)
      return { valid: false, message: "Bio must be at least 20 characters" };
    return { valid: true, message: "" };
  };

  // Get validation states
  const nameValidation = validateName(formData.name);
  const phoneValidation = validatePhone(formData.phone);
  const workCategoriesValidation = validateWorkCategories(
    formData.workCategories,
    formData.role
  );
  const bioValidation = validateBio(formData.bio, formData.role);

  const handleInputChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >
  ) => {
    const { name, value } = e.target;

    if (name === "bio") {
      // Strip HTML and limit length
      const stripped = value.replace(/<[^>]*>/g, "");
      if (stripped.length <= 300) {
        setFormData((prev) => ({ ...prev, [name]: stripped }));
      }
    } else if (name === "name") {
      if (value.length <= 50) {
        setFormData((prev) => ({ ...prev, [name]: value }));
      }
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handlePhoneBlur = () => {
    // Only mark as touched after user stops typing and field has some content
    const phoneDigits = formData.phone.replace(/\D/g, "");
    if (phoneDigits.length > 3) {
      // More than just country code
      setTouched((prev) => ({ ...prev, phone: true }));
    }
  };

  const handleBlur = (field: keyof typeof touched) => {
    setTouched((prev) => ({ ...prev, [field]: true }));
  };

  const handleCategoryChange = (category: string) => {
    setFormData((prev) => ({
      ...prev,
      workCategories: prev.workCategories.includes(category)
        ? prev.workCategories.filter((c) => c !== category)
        : [...prev.workCategories, category],
    }));
    setTouched((prev) => ({ ...prev, workCategories: true }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    // Mark all fields as touched
    setTouched({
      name: true,
      phone: true,
      workCategories: true,
      bio: true,
    });

    // Final validation check
    if (!phoneValidation.valid || !nameValidation.valid) {
      setIsLoading(false);
      return;
    }

    if (
      formData.role === "seeker" &&
      (!workCategoriesValidation.valid || !bioValidation.valid)
    ) {
      setIsLoading(false);
      return;
    }

    try {
      const profileData = {
        ...formData,
        phone: formData.phone, // Already in E.164 format from react-phone-number-input
        bio: formData.bio.trim(),
        name: formData.name.trim(),
      };
      await updateUserProfile(profileData);
      setSubmitted(true);
    } catch (error: any) {
      setError(error.message || "Profile update failed");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (submitted && user && user.role && user.name && user.phone) {
      console.log("Navigating to dashboard for role:", user.role);
      navigate(
        user.role === "provider" ? "/provider/dashboard" : "/seeker/dashboard"
      );
    }
  }, [submitted, user, navigate]);

  const isFormValid = (() => {
    const baseValid = nameValidation.valid && phoneValidation.valid;

    if (formData.role === "provider") {
      return baseValid;
    } else {
      return baseValid && workCategoriesValidation.valid && bioValidation.valid;
    }
  })();

  const ValidationIndicator = ({
    validation,
    touched,
  }: {
    validation: { valid: boolean; message: string };
    touched: boolean;
  }) => {
    if (!touched || validation.valid || !validation.message) return null;

    return (
      <div className="flex items-center mt-1 text-xs text-red-600">
        <XCircle className="h-3 w-3 mr-1" />
        {validation.message}
      </div>
    );
  };

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
            Complete Your Profile
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            Let's set up your Hustlefy profile to get started
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

              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Role Selection */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-3">
                    Account Type
                  </label>
                  <div className="grid grid-cols-2 gap-3">
                    <button
                      type="button"
                      onClick={() =>
                        setFormData((prev) => ({ ...prev, role: "seeker" }))
                      }
                      className={`p-3 border rounded-lg text-center transition-colors ${
                        formData.role === "seeker"
                          ? "border-orange-500 bg-orange-50 text-orange-700"
                          : "border-gray-300 hover:border-gray-400"
                      }`}
                    >
                      <div className="font-medium">Job Seeker</div>
                      <div className="text-xs text-gray-500">Find work</div>
                    </button>
                    <button
                      type="button"
                      onClick={() =>
                        setFormData((prev) => ({ ...prev, role: "provider" }))
                      }
                      className={`p-3 border rounded-lg text-center transition-colors ${
                        formData.role === "provider"
                          ? "border-orange-500 bg-orange-50 text-orange-700"
                          : "border-gray-300 hover:border-gray-400"
                      }`}
                    >
                      <div className="font-medium">Job Provider</div>
                      <div className="text-xs text-gray-500">Post jobs</div>
                    </button>
                  </div>
                </div>

                {/* Basic Info */}
                <div className="space-y-6">
                  <div className="group">
                    <label
                      htmlFor="name"
                      className="block text-sm font-medium text-gray-700 mb-1"
                    >
                      Full Name <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                      <input
                        id="name"
                        name="name"
                        type="text"
                        required
                        value={formData.name}
                        onChange={handleInputChange}
                        onBlur={() => handleBlur("name")}
                        maxLength={50}
                        className={`w-full pl-10 pr-3 py-2 bg-white/80 border rounded-lg placeholder-gray-400 text-gray-900 focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-all duration-200 ${
                          touched.name && !nameValidation.valid
                            ? "border-red-300"
                            : "border-gray-200"
                        }`}
                        placeholder="Your full name"
                      />
                    </div>
                    <ValidationIndicator
                      validation={nameValidation}
                      touched={touched.name}
                    />
                  </div>

                  <div className="group">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Phone Number <span className="text-red-500">*</span>
                    </label>
                    <div
                      className={`phone-input-wrapper ${
                        touched.phone &&
                        !phoneValidation.valid &&
                        phoneValidation.message
                          ? "phone-input-error"
                          : ""
                      }`}
                    >
                      <PhoneInput
                        international
                        defaultCountry="IN"
                        value={formData.phone}
                        onChange={(value) =>
                          setFormData((prev) => ({
                            ...prev,
                            phone: value || "",
                          }))
                        } // Simple direct update
                        onBlur={handlePhoneBlur}
                        placeholder="Enter phone number"
                        smartCaret={true}
                        limitMaxLength={true}
                        maxlength={15}
                      />
                    </div>
                    <ValidationIndicator
                      validation={phoneValidation}
                      touched={touched.phone}
                    />
                  </div>
                </div>

                {/* Only show Work Categories and Bio if NOT provider */}
                {formData.role !== "provider" && (
                  <>
                    {/* Work Categories */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-3">
                        Work Categories <span className="text-red-500">*</span>
                        <span className="text-xs text-gray-500 ml-1">
                          (Select all that apply)
                        </span>
                      </label>
                      <div className="grid grid-cols-2 gap-2">
                        {workCategories.map((category) => (
                          <label
                            key={category}
                            className="flex items-center group cursor-pointer"
                          >
                            <input
                              type="checkbox"
                              checked={formData.workCategories.includes(
                                category
                              )}
                              onChange={() => handleCategoryChange(category)}
                              className="h-4 w-4 text-orange-600 focus:ring-orange-500 border-gray-300 rounded transition-colors duration-200 accent-orange-600"
                            />
                            <span className="ml-2 text-sm text-gray-700 group-hover:text-orange-600 transition-colors duration-200">
                              {category}
                            </span>
                          </label>
                        ))}
                      </div>
                      <ValidationIndicator
                        validation={workCategoriesValidation}
                        touched={touched.workCategories}
                      />
                    </div>

                    {/* Bio */}
                    <div className="group">
                      <label
                        htmlFor="bio"
                        className="block text-sm font-medium text-gray-700 mb-1"
                      >
                        Bio <span className="text-red-500">*</span>
                      </label>
                      <div className="relative">
                        <FileText className="absolute left-3 top-3 text-gray-400 h-5 w-5" />
                        <textarea
                          id="bio"
                          name="bio"
                          rows={4}
                          value={formData.bio}
                          onChange={handleInputChange}
                          onBlur={() => handleBlur("bio")}
                          maxLength={300}
                          className={`w-full pl-10 pr-3 py-2 bg-white/80 border rounded-lg placeholder-gray-400 text-gray-900 focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-all duration-200 resize-none ${
                            touched.bio && !bioValidation.valid
                              ? "border-red-300"
                              : "border-gray-200"
                          }`}
                          placeholder="Tell us about yourself and your experience... (minimum 20 characters)"
                        />
                      </div>
                      <ValidationIndicator
                        validation={bioValidation}
                        touched={touched.bio}
                      />
                    </div>
                  </>
                )}

                <div>
                  <button
                    type="submit"
                    disabled={isLoading || !isFormValid}
                    className="w-full py-2 px-4 bg-orange-600 hover:bg-orange-700 text-white font-medium rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
                  >
                    {isLoading ? (
                      <div className="flex items-center justify-center space-x-2">
                        <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                        <span>Setting up your profile...</span>
                      </div>
                    ) : (
                      "Complete Profile"
                    )}
                  </button>
                </div>
              </form>
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

        /* Custom styling for phone input */
        .phone-input-wrapper .PhoneInput {
          --PhoneInput-color--focus: #f97316;
          --PhoneInputInternationalIconPhone-opacity: 0.8;
          --PhoneInputInternationalIconGlobe-opacity: 0.65;
          --PhoneInputCountrySelect-marginRight: 0.5em;
          --PhoneInputCountrySelectArrow-width: 0.3em;
          --PhoneInputCountrySelectArrow-marginLeft: var(--PhoneInputCountrySelect-marginRight);
        }

        .phone-input-wrapper .PhoneInputInput {
          background: rgba(255, 255, 255, 0.8) !important;
          border: 1px solid #e5e7eb !important;
          border-radius: 0.5rem !important;
          padding: 0.5rem 0.75rem !important;
          font-size: 0.875rem !important;
          transition: all 0.2s !important;
          outline: none !important;
        }

        .phone-input-wrapper .PhoneInputInput:focus {
          ring: 2 !important;
          ring-color: rgba(249, 115, 22, 0.2) !important;
          border-color: #f97316 !important;
          box-shadow: 0 0 0 2px rgba(249, 115, 22, 0.2) !important;
        }

        .phone-input-wrapper.phone-input-error .PhoneInputInput {
          border-color: #fca5a5 !important;
        }

        .phone-input-wrapper .PhoneInputCountrySelect {
          background: rgba(255, 255, 255, 0.8) !important;
          border: 1px solid #e5e7eb !important;
          border-radius: 0.5rem !important;
          margin-right: 0.5rem !important;
          outline: none !important;
        }

        .phone-input-wrapper .PhoneInputCountrySelect:focus {
          ring: 2 !important;
          ring-color: rgba(249, 115, 22, 0.2) !important;
          border-color: #f97316 !important;
          box-shadow: 0 0 0 2px rgba(249, 115, 22, 0.2) !important;
        }

        /* Hide the built-in error display from PhoneInput */
        .phone-input-wrapper .PhoneInput__error {
          display: none !important;
        }

        /* Custom checkbox styling to match orange theme */
        input[type="checkbox"] {
          cursor: pointer !important;
        }
        
        input[type="checkbox"]:checked {
          background-color: #ea580c !important;
          border-color: #ea580c !important;
          cursor: pointer !important;
        }
        
        input[type="checkbox"]:focus {
          box-shadow: 0 0 0 2px rgba(249, 115, 22, 0.2) !important;
          border-color: #f97316 !important;
          cursor: pointer !important;
        }
        
        input[type="checkbox"]:hover {
          border-color: #f97316 !important;
          cursor: pointer !important;
        }
      `}</style>
    </div>
  );
};

export default Onboarding;
