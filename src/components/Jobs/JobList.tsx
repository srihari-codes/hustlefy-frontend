import React, { useState, useMemo } from "react";
import { Job } from "../../types";
import JobCard from "./JobCard";
import Select from "react-select";

interface JobListProps {
  jobs: Job[];
  onApply?: (jobId: string) => void;
  showApplyButton?: boolean;
  emptyMessage?: string;
  showFilters?: boolean;
}

// Custom styles for react-select to match your design
const selectStyles = {
  control: (provided: any, state: any) => ({
    ...provided,
    backgroundColor: "white",
    border: state.isFocused ? "2px solid #ea580c" : "1px solid #e5e7eb",
    borderRadius: "0.5rem",
    padding: "0.125rem 0.25rem",
    boxShadow: state.isFocused
      ? "0 0 0 2px rgba(234, 88, 12, 0.2)"
      : "0 1px 2px 0 rgba(0, 0, 0, 0.05)",
    "&:hover": {
      borderColor: state.isFocused ? "#ea580c" : "#e5e7eb",
      boxShadow: state.isFocused
        ? "0 0 0 2px rgba(234, 88, 12, 0.2)"
        : "0 4px 6px -1px rgba(0, 0, 0, 0.1)",
    },
    minHeight: "38px",
    fontSize: "0.875rem",
    transition: "all 0.2s ease",
    "@media (max-width: 640px)": {
      fontSize: "0.75rem",
      minHeight: "34px",
      padding: "0.125rem",
    },
  }),
  placeholder: (provided: any) => ({
    ...provided,
    color: "#6b7280",
    fontSize: "inherit",
  }),
  singleValue: (provided: any) => ({
    ...provided,
    color: "#374151",
    fontSize: "inherit",
  }),
  menu: (provided: any) => ({
    ...provided,
    backgroundColor: "white",
    border: "1px solid #e5e7eb",
    borderRadius: "0.5rem",
    boxShadow:
      "0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)",
    zIndex: 50,
  }),
  option: (provided: any, state: any) => ({
    ...provided,
    backgroundColor: state.isFocused
      ? "#fed7aa"
      : state.isSelected
      ? "#ea580c"
      : "white",
    color: state.isSelected ? "white" : "#374151",
    fontSize: "0.875rem",
    "&:hover": {
      backgroundColor: "#fed7aa",
      color: "#374151",
    },
    "@media (max-width: 640px)": {
      fontSize: "0.75rem",
    },
  }),
  dropdownIndicator: (provided: any) => ({
    ...provided,
    color: "#ea580c",
    "&:hover": {
      color: "#ea580c",
    },
  }),
  clearIndicator: (provided: any) => ({
    ...provided,
    color: "#6b7280",
    "&:hover": {
      color: "#374151",
    },
  }),
};

// Special styles for pay range dropdown
const payRangeSelectStyles = {
  ...selectStyles,
  control: (provided: any, state: any) => ({
    ...selectStyles.control(provided, state),
    background:
      "linear-gradient(135deg, rgba(255, 255, 255, 0.9) 0%, rgba(255, 237, 213, 0.6) 100%)",
    border: state.isFocused
      ? "1px solid #ea580c"
      : "1px solid rgba(234, 88, 12, 0.6)",
    boxShadow: state.isFocused
      ? "0 0 0 2px rgba(234, 88, 12, 0.4)"
      : "0 4px 6px -1px rgba(234, 88, 12, 0.3)",
    backdropFilter: "blur(4px)",
    "&:hover": {
      borderColor: "#f97316",
      boxShadow: "0 8px 25px -5px rgba(234, 88, 12, 0.4)",
    },
  }),
  dropdownIndicator: (provided: any) => ({
    ...provided,
    color: "#ea580c",
  }),
};

const JobList: React.FC<JobListProps> = ({
  jobs,
  onApply,
  showApplyButton = true,
  emptyMessage = "No jobs available at the moment.",
  showFilters = true,
}) => {
  const [filters, setFilters] = useState({
    category: "",
    location: "",
    payRange: "",
    duration: "",
  });

  // Extract unique values from jobs data and convert to react-select options
  const filterOptions = useMemo(() => {
    const categories = [...new Set(jobs.map((job) => job.category))].sort();
    const locations = [...new Set(jobs.map((job) => job.location))].sort();

    // Create duration ranges based on job durations
    const durations = jobs.map((job) => {
      const duration = job.duration.toLowerCase();
      if (duration.includes("hour")) {
        const hours = parseInt(duration);
        if (hours <= 8) return "1-8 Hours";
        if (hours <= 24) return "9-24 Hours";
        return "24+ Hours";
      } else if (duration.includes("day")) {
        const days = parseInt(duration);
        if (days <= 3) return "1-3 Days";
        if (days <= 7) return "4-7 Days";
        return "1+ Week";
      }
      return "Other";
    });
    const uniqueDurations = [...new Set(durations)].sort();

    // Create pay ranges
    const payRanges = ["₹0 - ₹500", "₹500 - ₹1000", "₹1000 - ₹1500", "₹1500+"];

    return {
      categories: categories.map((cat) => ({ value: cat, label: cat })),
      locations: locations.map((loc) => ({ value: loc, label: loc })),
      durations: uniqueDurations.map((dur) => ({ value: dur, label: dur })),
      payRanges: payRanges.map((range) => ({ value: range, label: range })),
    };
  }, [jobs]);

  // Filter jobs based on selected filters
  const filteredJobs = useMemo(() => {
    return jobs.filter((job) => {
      if (filters.category && job.category !== filters.category) return false;
      if (filters.location && job.location !== filters.location) return false;

      if (filters.duration) {
        const duration = job.duration.toLowerCase();
        let jobDurationCategory = "";

        if (duration.includes("hour")) {
          const hours = parseInt(duration);
          if (hours <= 8) jobDurationCategory = "1-8 Hours";
          else if (hours <= 24) jobDurationCategory = "9-24 Hours";
          else jobDurationCategory = "24+ Hours";
        } else if (duration.includes("day")) {
          const days = parseInt(duration);
          if (days <= 3) jobDurationCategory = "1-3 Days";
          else if (days <= 7) jobDurationCategory = "4-7 Days";
          else jobDurationCategory = "1+ Week";
        } else {
          jobDurationCategory = "Other";
        }

        if (jobDurationCategory !== filters.duration) return false;
      }

      if (filters.payRange) {
        const payment = job.payment;
        let inRange = false;

        switch (filters.payRange) {
          case "₹0 - ₹500":
            inRange = payment <= 500;
            break;
          case "₹500 - ₹1000":
            inRange = payment > 500 && payment <= 1000;
            break;
          case "₹1000 - ₹1500":
            inRange = payment > 1000 && payment <= 1500;
            break;
          case "₹1500+":
            inRange = payment > 1500;
            break;
        }

        if (!inRange) return false;
      }

      return true;
    });
  }, [jobs, filters]);

  const handleFilterChange = (filterType: string, selectedOption: any) => {
    const value = selectedOption ? selectedOption.value : "";
    setFilters((prev) => ({
      ...prev,
      [filterType]:
        value === prev[filterType as keyof typeof prev] ? "" : value,
    }));
  };

  const clearAllFilters = () => {
    setFilters({
      category: "",
      location: "",
      payRange: "",
      duration: "",
    });
  };

  const activeFiltersCount = Object.values(filters).filter(Boolean).length;

  // Convert current filter values to selected options for react-select
  const getSelectedOption = (filterType: string, options: any[]) => {
    const value = filters[filterType as keyof typeof filters];
    return value ? options.find((opt) => opt.value === value) || null : null;
  };

  return (
    <div className="w-full">
      {/* Section Title - Mobile Optimized */}
      <div className="mb-6 sm:mb-8">
        <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">
          Available Tasks
        </h2>
        <p className="text-gray-600 text-sm sm:text-base">
          Discover opportunities that match your skills
        </p>
      </div>

      {/* Filter Row - Mobile Responsive */}
      {showFilters && (
        <div className="mb-6 sm:mb-8 pb-4 sm:pb-6 border-b border-gray-100">
          {/* Mobile: Stack filters vertically, Desktop: Horizontal */}
          <div className="grid grid-cols-2 sm:flex sm:flex-wrap gap-2 sm:gap-3 mb-4">
            {/* Category Dropdown */}
            <div className="relative">
              <Select
                options={filterOptions.categories}
                value={getSelectedOption("category", filterOptions.categories)}
                onChange={(selectedOption) =>
                  handleFilterChange("category", selectedOption)
                }
                placeholder="All Categories"
                isSearchable={false}
                isClearable
                styles={selectStyles}
                className="react-select-container"
                classNamePrefix="react-select"
              />
            </div>

            {/* Duration Dropdown */}
            <div className="relative">
              <Select
                options={filterOptions.durations}
                value={getSelectedOption("duration", filterOptions.durations)}
                onChange={(selectedOption) =>
                  handleFilterChange("duration", selectedOption)
                }
                placeholder="All Durations"
                isSearchable={false}
                isClearable
                styles={selectStyles}
                className="react-select-container"
                classNamePrefix="react-select"
              />
            </div>

            {/* Location Dropdown */}
            <div className="relative">
              <Select
                options={filterOptions.locations}
                value={getSelectedOption("location", filterOptions.locations)}
                onChange={(selectedOption) =>
                  handleFilterChange("location", selectedOption)
                }
                placeholder="All Locations"
                isSearchable
                isClearable
                styles={selectStyles}
                className="react-select-container"
                classNamePrefix="react-select"
              />
            </div>

            {/* Pay Range Dropdown */}
            <div className="relative">
              <Select
                options={filterOptions.payRanges}
                value={getSelectedOption("payRange", filterOptions.payRanges)}
                onChange={(selectedOption) =>
                  handleFilterChange("payRange", selectedOption)
                }
                placeholder="All Pay Ranges"
                isSearchable={false}
                isClearable
                styles={payRangeSelectStyles}
                className="react-select-container"
                classNamePrefix="react-select"
              />
            </div>
          </div>

          {/* Filter Actions */}
          <div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
            {activeFiltersCount > 0 && (
              <button
                onClick={clearAllFilters}
                className="w-full sm:w-auto bg-gray-100 hover:bg-gray-200 text-gray-700 px-4 py-2 rounded-lg text-sm font-medium transition-colors"
              >
                Clear All ({activeFiltersCount})
              </button>
            )}
            <div className="text-sm text-gray-600 flex items-center">
              Showing {filteredJobs.length} of {jobs.length} tasks
            </div>
          </div>
        </div>
      )}

      {/* Empty State - Mobile Optimized */}
      {filteredJobs.length === 0 ? (
        <div className="text-center py-12 sm:py-16">
          <div className="text-4xl sm:text-6xl mb-4">🔍</div>
          <h3 className="text-lg sm:text-xl font-semibold text-gray-900 mb-2">
            {jobs.length === 0
              ? "No tasks found"
              : "No tasks match your filters"}
          </h3>
          <p className="text-gray-500 text-sm sm:text-lg px-4">
            {jobs.length === 0
              ? emptyMessage
              : "Try adjusting your filter criteria"}
          </p>
          {jobs.length > 0 && activeFiltersCount > 0 && (
            <button
              onClick={clearAllFilters}
              className="mt-4 text-orange-600 hover:text-orange-700 font-medium text-sm"
            >
              Clear all filters
            </button>
          )}
        </div>
      ) : (
        /* Job Cards - Mobile Optimized Spacing */
        <div className="space-y-3 sm:space-y-4">
          {filteredJobs.map((job) => (
            <JobCard
              key={job._id}
              job={job}
              onApply={onApply}
              showApplyButton={showApplyButton}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default JobList;
