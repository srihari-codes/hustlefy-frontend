import React, { useState, useMemo } from "react";
import { Job } from "../../types";
import JobCard from "./JobCard";
import { ChevronDown } from "lucide-react";

interface JobListProps {
  jobs: Job[];
  onApply?: (jobId: string) => void;
  showApplyButton?: boolean;
  emptyMessage?: string;
  showFilters?: boolean;
}

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

  // Extract unique values from jobs data
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
      categories,
      locations,
      durations: uniqueDurations,
      payRanges,
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

  const handleFilterChange = (filterType: string, value: string) => {
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
              <select
                value={filters.category}
                onChange={(e) => handleFilterChange("category", e.target.value)}
                className="w-full appearance-none bg-white border border-gray-200 rounded-lg px-3 py-2 sm:px-4 sm:py-3 pr-8 sm:pr-10 text-xs sm:text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent shadow-sm hover:shadow-md transition-shadow"
              >
                <option value="">All Categories</option>
                {filterOptions.categories.map((category) => (
                  <option key={category} value={category}>
                    {category}
                  </option>
                ))}
              </select>
              <ChevronDown className="absolute right-2 sm:right-3 top-1/2 transform -translate-y-1/2 h-3 w-3 sm:h-4 sm:w-4 text-gray-400 pointer-events-none" />
            </div>

            {/* Duration Dropdown */}
            <div className="relative">
              <select
                value={filters.duration}
                onChange={(e) => handleFilterChange("duration", e.target.value)}
                className="w-full appearance-none bg-white border border-gray-200 rounded-lg px-3 py-2 sm:px-4 sm:py-3 pr-8 sm:pr-10 text-xs sm:text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent shadow-sm hover:shadow-md transition-shadow"
              >
                <option value="">All Durations</option>
                {filterOptions.durations.map((duration) => (
                  <option key={duration} value={duration}>
                    {duration}
                  </option>
                ))}
              </select>
              <ChevronDown className="absolute right-2 sm:right-3 top-1/2 transform -translate-y-1/2 h-3 w-3 sm:h-4 sm:w-4 text-gray-400 pointer-events-none" />
            </div>

            {/* Location Dropdown */}
            <div className="relative">
              <select
                value={filters.location}
                onChange={(e) => handleFilterChange("location", e.target.value)}
                className="w-full appearance-none bg-white border border-gray-200 rounded-lg px-3 py-2 sm:px-4 sm:py-3 pr-8 sm:pr-10 text-xs sm:text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent shadow-sm hover:shadow-md transition-shadow"
              >
                <option value="">All Locations</option>
                {filterOptions.locations.map((location) => (
                  <option key={location} value={location}>
                    {location}
                  </option>
                ))}
              </select>
              <ChevronDown className="absolute right-2 sm:right-3 top-1/2 transform -translate-y-1/2 h-3 w-3 sm:h-4 sm:w-4 text-gray-400 pointer-events-none" />
            </div>

            {/* Pay Range Dropdown */}
            <div className="relative">
              <select
                value={filters.payRange}
                onChange={(e) => handleFilterChange("payRange", e.target.value)}
                className="w-full appearance-none bg-gradient-to-br from-white/90 to-orange-25/60 border border-orange-200/60 rounded-lg px-3 py-2 sm:px-4 sm:py-3 pr-8 sm:pr-10 text-xs sm:text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-orange-500/40 focus:border-orange-400 shadow-md shadow-orange-200/30 hover:shadow-lg hover:shadow-orange-200/40 hover:border-orange-300 transition-all duration-200 backdrop-blur-sm"
              >
                <option value="">All Pay Ranges</option>
                {filterOptions.payRanges.map((range) => (
                  <option key={range} value={range}>
                    {range}
                  </option>
                ))}
              </select>
              <ChevronDown className="absolute right-2 sm:right-3 top-1/2 transform -translate-y-1/2 h-3 w-3 sm:h-4 sm:w-4 text-orange-500 pointer-events-none" />
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
