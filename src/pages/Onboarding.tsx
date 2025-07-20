import React, { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { workCategories } from "../data/mockData";
import { Briefcase, User, Phone, FileText } from "lucide-react";

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

  const handleInputChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleCategoryChange = (category: string) => {
    setFormData((prev) => ({
      ...prev,
      workCategories: prev.workCategories.includes(category)
        ? prev.workCategories.filter((c) => c !== category)
        : [...prev.workCategories, category],
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");
    try {
      await updateUserProfile(formData);
      setSubmitted(true); // trigger navigation in effect
    } catch (error: any) {
      setError(error.message || "Profile update failed");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (
      submitted &&
      user &&
      user.role &&
      user.name &&
      user.phone // check phone instead of location
    ) {
      console.log("Navigating to dashboard for role:", user.role);
      navigate(
        user.role === "provider" ? "/provider/dashboard" : "/seeker/dashboard"
      );
    }
  }, [submitted, user, navigate]);

  const isFormValid = (() => {
    const nameValid =
      typeof formData.name === "string" &&
      formData.name.trim().length > 0 &&
      formData.name.trim().length <= 100;
    const phoneValid =
      typeof formData.phone === "string" &&
      /^\d{10}$/.test(formData.phone.trim()); // must be exactly 10 digits
    const roleValid =
      formData.role === "provider" || formData.role === "seeker";

    if (formData.role === "provider") {
      return nameValid && phoneValid && roleValid;
    } else {
      const bioValid =
        typeof formData.bio === "string" &&
        formData.bio.trim().length > 0 &&
        formData.bio.trim().length <= 500;
      const workCategoriesValid =
        Array.isArray(formData.workCategories) &&
        formData.workCategories.length > 0 &&
        formData.workCategories.every((cat) => workCategories.includes(cat));
      return (
        nameValid && phoneValid && roleValid && bioValid && workCategoriesValid
      );
    }
  })();

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md mx-auto">
        <div className="text-center">
          <Briefcase className="mx-auto h-12 w-12 text-blue-600" />
          <h2 className="mt-6 text-3xl font-bold text-gray-900">
            Complete Your Profile
          </h2>
          <p className="mt-2 text-sm text-gray-600">
            Let's set up your Hustlefy profile to get started
          </p>
        </div>

        <div className="mt-8 bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
          <form className="space-y-6" onSubmit={handleSubmit}>
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
                {error}
              </div>
            )}

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
                      ? "border-blue-500 bg-blue-50 text-blue-700"
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
                      ? "border-blue-500 bg-blue-50 text-blue-700"
                      : "border-gray-300 hover:border-gray-400"
                  }`}
                >
                  <div className="font-medium">Job Provider</div>
                  <div className="text-xs text-gray-500">Post jobs</div>
                </button>
              </div>
            </div>

            {/* Basic Info */}
            <div className="grid grid-cols-1 gap-6">
              <div>
                <label
                  htmlFor="name"
                  className="block text-sm font-medium text-gray-700"
                >
                  Full Name
                </label>
                <div className="mt-1 relative">
                  <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                  <input
                    id="name"
                    name="name"
                    type="text"
                    required
                    value={formData.name}
                    onChange={handleInputChange}
                    className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Your full name"
                  />
                </div>
              </div>

              <div>
                <label
                  htmlFor="phone"
                  className="block text-sm font-medium text-gray-700"
                >
                  Phone Number
                </label>
                <div className="mt-1 relative">
                  <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                  <input
                    id="phone"
                    name="phone"
                    type="tel"
                    value={formData.phone}
                    onChange={handleInputChange}
                    maxLength={10} // <-- Prevents typing more than 10 digits
                    className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    placeholder="(555) 123-4567"
                  />
                </div>
              </div>
            </div>

            {/* Only show Work Categories and Bio if NOT provider */}
            {formData.role !== "provider" && (
              <>
                {/* Work Categories */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-3">
                    Work Categories (Select all that apply)
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    {workCategories.map((category) => (
                      <label key={category} className="flex items-center">
                        <input
                          type="checkbox"
                          checked={formData.workCategories.includes(category)}
                          onChange={() => handleCategoryChange(category)}
                          className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                        />
                        <span className="ml-2 text-sm text-gray-700">
                          {category}
                        </span>
                      </label>
                    ))}
                  </div>
                </div>

                {/* Bio */}
                <div>
                  <label
                    htmlFor="bio"
                    className="block text-sm font-medium text-gray-700"
                  >
                    Bio
                  </label>
                  <div className="mt-1 relative">
                    <FileText className="absolute left-3 top-3 text-gray-400 h-5 w-5" />
                    <textarea
                      id="bio"
                      name="bio"
                      rows={3}
                      value={formData.bio}
                      onChange={handleInputChange}
                      maxLength={500} // <-- Prevents typing more than 500 chars
                      className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                      placeholder="Tell us about yourself and your experience..."
                    />
                  </div>
                </div>
              </>
            )}

            <div>
              <button
                type="submit"
                disabled={isLoading || !isFormValid}
                className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
              >
                {isLoading ? "Setting up your profile..." : "Complete Profile"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Onboarding;
