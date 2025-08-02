import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import ApiService from "../../services/api";
import { workCategories } from "../../data/mockData";
import {
  ArrowLeft,
  IndianRupee,
  Clock,
  Users,
  MapPin,
  FileText,
} from "lucide-react";

const PostJob: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    location: "",
    category: "",
    peopleNeeded: 1 as number | string,
    durationNumber: "" as number | string, // New field
    durationUnit: "", // New field
    payment: "",
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [validationErrors, setValidationErrors] = useState<
    Record<string, string>
  >({});

  const durationUnits = [
    { value: "hours", label: "Hour", plural: "Hours" },
    { value: "days", label: "Day", plural: "Days" },
    { value: "weeks", label: "Week", plural: "Weeks" },
    { value: "months", label: "Month", plural: "Months" },
  ];

  const validateField = (name: string, value: any): string => {
    switch (name) {
      case "title":
        const trimmedTitle = value.trim();
        if (!trimmedTitle) return "Title is required";
        if (trimmedTitle.length < 5)
          return "Title must be at least 5 characters";
        if (trimmedTitle.length > 50)
          return "Title must not exceed 50 characters";
        return "";

      case "description":
        const trimmedDesc = value.trim();
        if (!trimmedDesc) return "Description is required";
        if (trimmedDesc.length < 20)
          return "Description must be at least 20 characters";
        if (trimmedDesc.length > 500)
          return "Description must not exceed 500 characters";
        return "";

      case "location":
        const trimmedLocation = value.trim();
        if (!trimmedLocation) return "Location is required";
        return "";

      case "category":
        if (!value) return "Category is required";
        if (!workCategories.includes(value))
          return "Please select a valid category";
        return "";

      case "peopleNeeded":
        if (value === "" || value === null || value === undefined)
          return "People needed is required";
        const peopleNum = parseInt(value);
        if (isNaN(peopleNum)) return "People needed must be a number";
        if (peopleNum < 1) return "At least 1 person is required";
        if (peopleNum > 50) return "Cannot exceed 50 people";
        return "";

      case "durationNumber":
        if (value === "" || value === null || value === undefined)
          return "Duration is required";
        const durationNum = parseInt(value);
        if (isNaN(durationNum)) return "Duration must be a number";
        if (durationNum <= 0) return "Duration must be greater than 0";
        if (durationNum > 999) return "Duration cannot exceed 999";
        return "";

      case "durationUnit":
        if (!value) return "Duration unit is required";
        if (!durationUnits.some((unit) => unit.value === value))
          return "Please select a valid duration unit";
        return "";

      case "payment":
        const paymentNum = parseFloat(value);
        if (isNaN(paymentNum)) return "Payment must be a valid number";
        if (paymentNum < 0) return "Payment cannot be negative";
        return "";

      default:
        return "";
    }
  };

  const handleInputChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >
  ) => {
    const { name, value } = e.target;

    // Update form data
    setFormData((prev) => ({
      ...prev,
      [name]:
        name === "peopleNeeded"
          ? value === ""
            ? ""
            : parseInt(value) || ""
          : name === "durationNumber"
          ? value === ""
            ? ""
            : parseInt(value) || ""
          : value,
    }));

    // Clear previous validation error for this field
    if (validationErrors[name]) {
      setValidationErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }

    // Also clear the other duration field error if one is fixed
    if (name === "durationNumber" && validationErrors.durationUnit) {
      setValidationErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors.durationUnit;
        return newErrors;
      });
    }
    if (name === "durationUnit" && validationErrors.durationNumber) {
      setValidationErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors.durationNumber;
        return newErrors;
      });
    }

    // Validate field on change
    const error = validateField(name, value);
    if (error) {
      setValidationErrors((prev) => ({
        ...prev,
        [name]: error,
      }));
    }
  };

  const validateForm = (): boolean => {
    const errors: Record<string, string> = {};

    Object.keys(formData).forEach((key) => {
      const error = validateField(key, formData[key as keyof typeof formData]);
      if (error) {
        errors[key] = error;
      }
    });

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!validateForm()) {
      setError("Please fix the validation errors below.");
      return;
    }

    setIsLoading(true);

    try {
      const jobData = {
        ...formData,
        title: formData.title.trim(),
        description: formData.description.trim(),
        location: formData.location.trim(),
        duration: getFormattedDuration(),
        payment: parseFloat(formData.payment),
      };

      await ApiService.createJob(jobData);
      navigate("/provider/dashboard");
    } catch (error: any) {
      setError(error.message || "Failed to create job. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  // Add helper function to get formatted duration
  const getFormattedDuration = () => {
    if (!formData.durationNumber || !formData.durationUnit) return "";

    const num = parseInt(formData.durationNumber.toString());
    const unit = durationUnits.find((u) => u.value === formData.durationUnit);

    if (!unit) return "";

    return `${num} ${num === 1 ? unit.label : unit.plural}`;
  };

  return (
    <div className="min-h-screen bg-orange-50 relative">
      {/* Very subtle background elements */}
      <div className="absolute inset-0">
        <div className="absolute top-1/3 left-1/3 w-64 h-64 bg-orange-100/30 rounded-full blur-3xl"></div>
        <div className="absolute bottom-1/3 right-1/3 w-48 h-48 bg-orange-200/20 rounded-full blur-3xl"></div>
      </div>

      <div className="relative min-h-screen flex flex-col justify-center py-12 sm:px-6 lg:px-8">
        <div className="sm:mx-auto sm:w-full sm:max-w-2xl">
          <h2 className="mt-6 text-3xl font-bold text-gray-800">
            Post a New Job
          </h2>
          <p className="mt-2 text-sm text-gray-600">
            Fill out the details below to find the right people for your job.
          </p>
        </div>

        <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-2xl">
          {/* Back Button */}
          <div className="mb-6">
            <button
              onClick={() => navigate("/provider/dashboard")}
              className="flex items-center text-orange-600 hover:text-orange-700 hover:underline transition-all duration-200 font-medium"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Dashboard
            </button>
          </div>

          {/* Minimalist glass container */}
          <div className="relative">
            <div className="bg-white/60 backdrop-blur-sm border border-orange-100/60 shadow-lg rounded-2xl p-8">
              {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6 animate-slide-down">
                  {error}
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Job Title */}
                <div className="group">
                  <label
                    htmlFor="title"
                    className="block text-sm font-medium text-gray-700 mb-1"
                  >
                    Job Title <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <FileText className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                    <input
                      type="text"
                      name="title"
                      id="title"
                      required
                      minLength={5}
                      maxLength={50}
                      value={formData.title}
                      onChange={handleInputChange}
                      className={`w-full pl-10 pr-3 py-2 bg-white/80 border rounded-lg placeholder-gray-400 text-gray-900 focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-all duration-200 ${
                        validationErrors.title
                          ? "border-red-300"
                          : "border-gray-200"
                      }`}
                      placeholder="e.g., Event Setup Crew, Office Cleaning, etc."
                    />
                  </div>
                  {validationErrors.title && (
                    <p className="mt-1 text-sm text-red-600">
                      {validationErrors.title}
                    </p>
                  )}
                </div>

                {/* Description */}
                <div className="group">
                  <label
                    htmlFor="description"
                    className="block text-sm font-medium text-gray-700 mb-1"
                  >
                    Job Description <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <textarea
                      name="description"
                      id="description"
                      rows={4}
                      required
                      minLength={20}
                      maxLength={500}
                      value={formData.description}
                      onChange={handleInputChange}
                      className={`w-full px-3 py-2 bg-white/80 border rounded-lg placeholder-gray-400 text-gray-900 focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-all duration-200 resize-none ${
                        validationErrors.description
                          ? "border-red-300"
                          : "border-gray-200"
                      }`}
                      placeholder="Describe what the job involves, any requirements, and what you're looking for..."
                    />
                  </div>
                  {validationErrors.description && (
                    <p className="mt-1 text-sm text-red-600">
                      {validationErrors.description}
                    </p>
                  )}
                </div>

                {/* Location and Category */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="group">
                    <label
                      htmlFor="location"
                      className="block text-sm font-medium text-gray-700 mb-1"
                    >
                      Location <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                      <input
                        type="text"
                        name="location"
                        id="location"
                        required
                        value={formData.location}
                        onChange={handleInputChange}
                        className={`w-full pl-10 pr-3 py-2 bg-white/80 border rounded-lg placeholder-gray-400 text-gray-900 focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-all duration-200 ${
                          validationErrors.location
                            ? "border-red-300"
                            : "border-gray-200"
                        }`}
                        placeholder="e.g., Downtown Seattle, WA or Remote"
                      />
                    </div>
                    {validationErrors.location && (
                      <p className="mt-1 text-sm text-red-600">
                        {validationErrors.location}
                      </p>
                    )}
                  </div>

                  <div className="group">
                    <label
                      htmlFor="category"
                      className="block text-sm font-medium text-gray-700 mb-1"
                    >
                      Work Category <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <select
                        name="category"
                        id="category"
                        required
                        value={formData.category}
                        onChange={handleInputChange}
                        className={`w-full px-3 py-2 bg-white/80 border rounded-lg text-gray-900 focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-all duration-200 ${
                          validationErrors.category
                            ? "border-red-300"
                            : "border-gray-200"
                        }`}
                      >
                        <option value="">Select a category</option>
                        {workCategories.map((category) => (
                          <option key={category} value={category}>
                            {category}
                          </option>
                        ))}
                      </select>
                    </div>
                    {validationErrors.category && (
                      <p className="mt-1 text-sm text-red-600">
                        {validationErrors.category}
                      </p>
                    )}
                  </div>
                </div>

                {/* People Needed and Duration */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="group">
                    <label
                      htmlFor="peopleNeeded"
                      className="block text-sm font-medium text-gray-700 mb-1"
                    >
                      People Needed <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <Users className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                      <input
                        type="number"
                        name="peopleNeeded"
                        id="peopleNeeded"
                        min="1"
                        max="50"
                        required
                        value={formData.peopleNeeded}
                        onChange={handleInputChange}
                        className={`w-full pl-10 pr-3 py-2 bg-white/80 border rounded-lg placeholder-gray-400 text-gray-900 focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-all duration-200 ${
                          validationErrors.peopleNeeded
                            ? "border-red-300"
                            : "border-gray-200"
                        }`}
                      />
                    </div>
                    {validationErrors.peopleNeeded && (
                      <p className="mt-1 text-sm text-red-600">
                        {validationErrors.peopleNeeded}
                      </p>
                    )}
                  </div>

                  <div className="group">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Duration <span className="text-red-500">*</span>
                    </label>
                    <div className="grid grid-cols-2 gap-3">
                      {/* Duration Number */}
                      <div className="relative">
                        <Clock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                        <input
                          type="number"
                          name="durationNumber"
                          min="1"
                          max="999"
                          required
                          value={formData.durationNumber}
                          onChange={handleInputChange}
                          className={`w-full pl-10 pr-3 py-2 bg-white/80 border rounded-lg placeholder-gray-400 text-gray-900 focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-all duration-200 ${
                            validationErrors.durationNumber
                              ? "border-red-300"
                              : "border-gray-200"
                          }`}
                          placeholder="e.g., 2, 8, 15"
                        />
                      </div>

                      {/* Duration Unit */}
                      <div className="relative">
                        <select
                          name="durationUnit"
                          required
                          value={formData.durationUnit}
                          onChange={handleInputChange}
                          className={`w-full px-3 py-2 bg-white/80 border rounded-lg text-gray-900 focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-all duration-200 ${
                            validationErrors.durationUnit
                              ? "border-red-300"
                              : "border-gray-200"
                          }`}
                        >
                          <option value="">Select a unit</option>
                          {durationUnits.map((unit) => (
                            <option key={unit.value} value={unit.value}>
                              {unit.label}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>
                    {validationErrors.durationNumber && (
                      <p className="mt-1 text-sm text-red-600">
                        {validationErrors.durationNumber}
                      </p>
                    )}
                    {validationErrors.durationUnit && (
                      <p className="mt-1 text-sm text-red-600">
                        {validationErrors.durationUnit}
                      </p>
                    )}
                  </div>
                </div>

                {/* Payment */}
                <div className="group">
                  <label
                    htmlFor="payment"
                    className="block text-sm font-medium text-gray-700 mb-1"
                  >
                    Total Payment (₹) <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <IndianRupee className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                    <input
                      type="number"
                      name="payment"
                      id="payment"
                      min="0"
                      step="0.01"
                      required
                      value={formData.payment}
                      onChange={handleInputChange}
                      className={`w-full pl-10 pr-3 py-2 bg-white/80 border rounded-lg placeholder-gray-400 text-gray-900 focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-all duration-200 ${
                        validationErrors.payment
                          ? "border-red-300"
                          : "border-gray-200"
                      }`}
                      placeholder="Total payment for the job"
                    />
                  </div>
                  {validationErrors.payment && (
                    <p className="mt-1 text-sm text-red-600">
                      {validationErrors.payment}
                    </p>
                  )}
                </div>

                {/* Submit Button */}
                <div>
                  <button
                    type="submit"
                    disabled={
                      isLoading || Object.keys(validationErrors).length > 0
                    }
                    className="w-full py-2 px-4 bg-orange-600 hover:bg-orange-700 text-white font-medium rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
                  >
                    {isLoading ? (
                      <div className="flex items-center justify-center space-x-2">
                        <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                        <span>Posting Job...</span>
                      </div>
                    ) : (
                      "Post Job"
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>

      <style>{`
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
      `}</style>
    </div>
  );
};

export default PostJob;
