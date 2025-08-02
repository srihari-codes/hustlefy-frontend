import React, { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import ApiService from "../services/api";
import { workCategories } from "../data/mockData";
import {
  User,
  Mail,
  Phone,
  MapPin,
  FileText,
  Save,
  XCircle,
  CheckCircle,
  Edit3,
} from "lucide-react";
import PhoneInput from "react-phone-number-input";
import "react-phone-number-input/style.css";
import { isValidPhoneNumber } from "react-phone-number-input";

const Profile: React.FC = () => {
  const { user, updateUser } = useAuth();
  const [formData, setFormData] = useState<{
    name: string;
    email: string;
    phone: string;
    workCategories: string[];
    bio: string;
  }>({
    name: "",
    email: "",
    phone: "",
    workCategories: [],
    bio: "",
  });
  const [originalData, setOriginalData] = useState<{
    name: string;
    email: string;
    phone: string;
    workCategories: string[];
    bio: string;
  }>({
    name: "",
    email: "",
    phone: "",
    workCategories: [],
    bio: "",
  });
  const [profilePicture, setProfilePicture] = useState<string>("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [showSuccessAnimation, setShowSuccessAnimation] = useState(false);
  const [touched, setTouched] = useState({
    name: false,
    phone: false,
    workCategories: false,
    bio: false,
  });

  // Check if form has changes
  const hasChanges = () => {
    return (
      formData.name !== originalData.name ||
      formData.phone !== originalData.phone ||
      JSON.stringify(formData.workCategories.sort()) !==
        JSON.stringify(originalData.workCategories.sort()) ||
      formData.bio !== originalData.bio
    );
  };

  // Validation functions (exact same as onboarding)
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
    if (!phone || phone.trim() === "") {
      return { valid: false, message: "Phone number is required" };
    }

    const phoneDigits = phone.replace(/\D/g, "");
    if (phoneDigits.length <= 3) {
      return { valid: false, message: "" };
    }

    try {
      if (!isValidPhoneNumber(phone)) {
        return { valid: false, message: "Please enter a valid phone number" };
      }
    } catch (error) {
      return { valid: false, message: "" };
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
    const stripped = trimmed.replace(/<[^>]*>/g, "");
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
    user?.role || "seeker"
  );
  const bioValidation = validateBio(formData.bio, user?.role || "seeker");

  // Check if form is valid
  const isFormValid = () => {
    const baseValid = nameValidation.valid && phoneValidation.valid;

    if (user?.role === "provider") {
      return baseValid;
    } else {
      return baseValid && workCategoriesValidation.valid && bioValidation.valid;
    }
  };

  // Fetch profile info from server on mount
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        setIsLoading(true);
        const response = await ApiService.getProfile();
        const profile = response.data || response;
        const profileData = {
          name: profile.name || "",
          email: profile.email || "",
          phone: profile.phone || "",
          workCategories: profile.workCategories || [],
          bio: profile.bio || "",
        };
        setFormData(profileData);
        setOriginalData(profileData);
        setProfilePicture(profile.profilePicture || "");
      } catch (err: any) {
        setError(err.message || "Failed to fetch profile info.");
      } finally {
        setIsLoading(false);
      }
    };
    fetchProfile();
  }, []);

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;

    if (name === "bio") {
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
    const phoneDigits = formData.phone.replace(/\D/g, "");
    if (phoneDigits.length > 3) {
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
    setError("");
    setSuccess("");
    setShowSuccessAnimation(false);
    setIsLoading(true);

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

    if (user?.role === "seeker") {
      if (!workCategoriesValidation.valid || !bioValidation.valid) {
        setIsLoading(false);
        return;
      }
    }

    try {
      const profileData = {
        ...formData,
        phone: formData.phone,
        bio: formData.bio.trim(),
        name: formData.name.trim(),
      };
      await ApiService.updateProfile(profileData);
      updateUser(profileData);

      // Trigger success animation
      setShowSuccessAnimation(true);
      setSuccess("Profile updated successfully!");

      // Update original data to reflect saved changes
      setOriginalData(profileData);

      // Auto-hide success message after animation
      setTimeout(() => {
        setSuccess("");
        setShowSuccessAnimation(false);
      }, 4000);
    } catch (error: any) {
      setError(error.message || "Failed to update profile. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

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

  // Check if button should be disabled
  const isButtonDisabled = isLoading || !hasChanges() || !isFormValid();

  return (
    <div className="min-h-screen bg-orange-50 relative">
      {/* Very subtle background elements */}
      <div className="absolute inset-0">
        <div className="absolute top-1/3 left-1/3 w-64 h-64 bg-orange-100/30 rounded-full blur-3xl"></div>
        <div className="absolute bottom-1/3 right-1/3 w-48 h-48 bg-orange-200/20 rounded-full blur-3xl"></div>
      </div>

      {/* Success Animation Overlay */}
      {showSuccessAnimation && (
        <div className="fixed inset-0 z-50 flex items-center justify-center pointer-events-none">
          <div className="success-ripple"></div>
        </div>
      )}

      <div className="relative min-h-screen flex flex-col justify-center py-12 sm:px-6 lg:px-8">
        <div className="sm:mx-auto sm:w-full sm:max-w-2xl">
          <div className="flex justify-center">
            <div className="rounded-xl bg-white/80 border border-orange-100 shadow-sm overflow-hidden">
              <img
                src={profilePicture || "/assets/images/hustlefy-logo.png"}
                alt={profilePicture ? "Profile Picture" : "Hustlefy"}
                className="h-16 w-16 object-cover"
              />
            </div>
          </div>
          <h2 className="mt-6 text-center text-3xl font-bold text-gray-800">
            Your Profile
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            Keep your profile up to date to get better job matches and
            opportunities.
          </p>
        </div>

        <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-2xl">
          {/* Minimalist glass container */}
          <div className="relative">
            <div
              className={`bg-white/60 backdrop-blur-sm border border-orange-100/60 shadow-lg rounded-2xl p-8 transition-all duration-500 ${
                showSuccessAnimation ? "success-glow" : ""
              }`}
            >
              {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6 animate-slide-down">
                  {error}
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Role Badge */}
                <div className="flex items-center justify-between">
                  <div>
                    <span className="text-sm font-medium text-gray-700">
                      Account Type:
                    </span>
                    <span
                      className={`ml-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        user?.role === "provider"
                          ? "bg-purple-100 text-purple-800"
                          : "bg-green-100 text-green-800"
                      }`}
                    >
                      {user?.role === "provider"
                        ? "Job Provider"
                        : "Job Seeker"}
                    </span>
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
                        type="text"
                        name="name"
                        id="name"
                        required
                        value={formData.name}
                        onChange={handleInputChange}
                        onBlur={() => handleBlur("name")}
                        maxLength={50}
                        className={`w-full pl-10 pr-10 py-2 bg-white/80 border rounded-lg placeholder-gray-400 text-gray-900 focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-all duration-200 ${
                          touched.name && !nameValidation.valid
                            ? "border-red-300"
                            : "border-gray-200"
                        }`}
                        placeholder="Your full name"
                      />
                      <Edit3 className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                    </div>
                    <ValidationIndicator
                      validation={nameValidation}
                      touched={touched.name}
                    />
                  </div>

                  <div className="group">
                    <label
                      htmlFor="email"
                      className="block text-sm font-medium text-gray-700 mb-1"
                    >
                      Email Address
                    </label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                      <input
                        type="email"
                        name="email"
                        id="email"
                        required
                        value={formData.email}
                        onChange={handleInputChange}
                        className="w-full pl-10 pr-3 py-2 bg-white/80 border border-gray-200 rounded-lg placeholder-gray-400 text-gray-900 focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-all duration-200 opacity-60 cursor-not-allowed"
                        disabled
                        placeholder="Your email address"
                      />
                    </div>
                  </div>

                  <div className="group">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Phone Number <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
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
                          }
                          onBlur={handlePhoneBlur}
                          placeholder="Enter phone number"
                          smartCaret={true}
                          limitMaxLength={true}
                          maxlength={15}
                        />
                      </div>
                      <Edit3 className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                    </div>
                    <ValidationIndicator
                      validation={phoneValidation}
                      touched={touched.phone}
                    />
                  </div>

                  {/* Hide these fields for providers */}
                  {user?.role !== "provider" && (
                    <>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-3">
                          Work Categories{" "}
                          <span className="text-red-500">*</span>
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
                            name="bio"
                            id="bio"
                            rows={4}
                            value={formData.bio}
                            onChange={handleInputChange}
                            onBlur={() => handleBlur("bio")}
                            maxLength={300}
                            className={`w-full pl-10 pr-10 py-2 bg-white/80 border rounded-lg placeholder-gray-400 text-gray-900 focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-all duration-200 resize-none ${
                              touched.bio && !bioValidation.valid
                                ? "border-red-300"
                                : "border-gray-200"
                            }`}
                            placeholder="Tell others about your experience, skills, and what you bring to the table... (minimum 20 characters)"
                          />
                          <Edit3 className="absolute right-3 top-3 text-gray-400 h-4 w-4" />
                        </div>
                        <ValidationIndicator
                          validation={bioValidation}
                          touched={touched.bio}
                        />
                      </div>
                    </>
                  )}
                </div>

                <div className="flex justify-end">
                  <div className="w-full">
                    <button
                      type="submit"
                      disabled={isButtonDisabled}
                      className={`w-full py-2 px-4 font-medium rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:ring-offset-2 transition-all duration-200 flex items-center justify-center space-x-2 ${
                        isButtonDisabled
                          ? "bg-gray-400 cursor-not-allowed text-white"
                          : "bg-orange-600 hover:bg-orange-700 text-white hover:shadow-lg transform hover:scale-[1.02]"
                      }`}
                    >
                      {isLoading ? (
                        <div className="flex items-center justify-center space-x-2">
                          <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                          <span>Saving...</span>
                        </div>
                      ) : (
                        <>
                          <Save className="h-4 w-4" />
                          <span>
                            {!hasChanges()
                              ? "No Changes to Save"
                              : "Save Changes"}
                          </span>
                        </>
                      )}
                    </button>

                    {/* Success message under button */}
                    {success && (
                      <div className="mt-3 bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg animate-success-slide flex items-center space-x-2">
                        <CheckCircle className="h-5 w-5 text-green-500 animate-bounce-gentle" />
                        <span className="font-medium">{success}</span>
                        <div className="success-particles"></div>
                      </div>
                    )}
                  </div>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>

      <style>{`
        /* Existing animations */
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

        /* New Success Animations - FASTER */
        .animate-slide-down {
          animation: slideDown 0.2s ease-out;
        }
        @keyframes slideDown {
          from {
            opacity: 0;
            transform: translateY(-20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .animate-success-slide {
          animation: successSlide 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
          position: relative;
          overflow: hidden;
        }
        @keyframes successSlide {
          0% {
            opacity: 0;
            transform: translateY(-30px) scale(0.95);
          }
          60% {
            opacity: 1;
            transform: translateY(5px) scale(1.02);
          }
          100% {
            opacity: 1;
            transform: translateY(0) scale(1);
          }
        }

        .animate-bounce-gentle {
          animation: bounceGentle 0.5s ease-in-out;
        }
        @keyframes bounceGentle {
          0%, 100% {
            transform: translateY(0);
          }
          50% {
            transform: translateY(-3px);
          }
        }

        /* Success ripple effect - FASTER */
        .success-ripple {
          position: absolute;
          width: 200px;
          height: 200px;
          border-radius: 50%;
          background: radial-gradient(circle, rgba(34, 197, 94, 0.2) 0%, rgba(34, 197, 94, 0) 70%);
          animation: rippleEffect 0.75s ease-out;
        }
        @keyframes rippleEffect {
          0% {
            transform: scale(0);
            opacity: 1;
          }
          100% {
            transform: scale(4);
            opacity: 0;
          }
        }

        .success-checkmark {
          position: absolute;
          animation: checkmarkPop 0.4s cubic-bezier(0.68, -0.55, 0.265, 1.55);
        }
        @keyframes checkmarkPop {
          0% {
            transform: scale(0) rotate(-45deg);
            opacity: 0;
          }
          50% {
            transform: scale(1.2) rotate(0deg);
            opacity: 1;
          }
          100% {
            transform: scale(1) rotate(0deg);
            opacity: 1;
          }
        }

        /* Container glow effect */
        .success-glow {
          box-shadow: 0 0 30px rgba(34, 197, 94, 0.3), 0 10px 40px rgba(0, 0, 0, 0.1);
          border-color: rgba(34, 197, 94, 0.3) !important;
        }

        /* Success particles effect - FASTER */
        .success-particles {
          position: absolute;
          top: 50%;
          right: 10px;
          width: 4px;
          height: 4px;
          background: #22c55e;
          border-radius: 50%;
          animation: particles 0.6s ease-out;
        }
        .success-particles::before,
        .success-particles::after {
          content: '';
          position: absolute;
          width: 3px;
          height: 3px;
          background: #16a34a;
          border-radius: 50%;
          animation: particles 0.6s ease-out;
        }
        .success-particles::before {
          top: -8px;
          left: -6px;
          animation-delay: 0.1s;
        }
        .success-particles::after {
          top: 6px;
          left: 8px;
          animation-delay: 0.2s;
        }
        @keyframes particles {
          0% {
            transform: translateY(0) scale(0);
            opacity: 1;
          }
          50% {
            transform: translateY(-15px) scale(1);
            opacity: 1;
          }
          100% {
            transform: translateY(-30px) scale(0);
            opacity: 0;
          }
        }

        /* Custom styling for phone input with edit icon */
        .phone-input-wrapper {
          position: relative;
        }
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
          padding: 0.5rem 2rem 0.5rem 0.75rem !important;
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

export default Profile;
