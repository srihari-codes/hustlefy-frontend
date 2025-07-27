// JobList.tsx
import React from "react";
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
              <select className="w-full appearance-none bg-white border border-gray-200 rounded-lg px-3 py-2 sm:px-4 sm:py-3 pr-8 sm:pr-10 text-xs sm:text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent shadow-sm hover:shadow-md transition-shadow">
                <option>Category</option>
              </select>
              <ChevronDown className="absolute right-2 sm:right-3 top-1/2 transform -translate-y-1/2 h-3 w-3 sm:h-4 sm:w-4 text-gray-400 pointer-events-none" />
            </div>

            {/* Time Dropdown */}
            <div className="relative">
              <select className="w-full appearance-none bg-white border border-gray-200 rounded-lg px-3 py-2 sm:px-4 sm:py-3 pr-8 sm:pr-10 text-xs sm:text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent shadow-sm hover:shadow-md transition-shadow">
                <option>Time</option>
              </select>
              <ChevronDown className="absolute right-2 sm:right-3 top-1/2 transform -translate-y-1/2 h-3 w-3 sm:h-4 sm:w-4 text-gray-400 pointer-events-none" />
            </div>

            {/* Location Dropdown */}
            <div className="relative">
              <select className="w-full appearance-none bg-white border border-gray-200 rounded-lg px-3 py-2 sm:px-4 sm:py-3 pr-8 sm:pr-10 text-xs sm:text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent shadow-sm hover:shadow-md transition-shadow">
                <option>Location</option>
              </select>
              <ChevronDown className="absolute right-2 sm:right-3 top-1/2 transform -translate-y-1/2 h-3 w-3 sm:h-4 sm:w-4 text-gray-400 pointer-events-none" />
            </div>

            {/* Pay Range Dropdown */}
            <div className="relative">
              <select className="w-full appearance-none bg-white border border-gray-200 rounded-lg px-3 py-2 sm:px-4 sm:py-3 pr-8 sm:pr-10 text-xs sm:text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent shadow-sm hover:shadow-md transition-shadow">
                <option>Pay Range</option>
              </select>
              <ChevronDown className="absolute right-2 sm:right-3 top-1/2 transform -translate-y-1/2 h-3 w-3 sm:h-4 sm:w-4 text-gray-400 pointer-events-none" />
            </div>
          </div>

          {/* Search Button - Full width on mobile */}
          <button className="w-full sm:w-auto bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white px-6 py-3 rounded-lg text-sm font-semibold transition-all duration-200 shadow-sm hover:shadow-lg active:scale-[0.98]">
            Apply Filters
          </button>
        </div>
      )}

      {/* Empty State - Mobile Optimized */}
      {jobs.length === 0 ? (
        <div className="text-center py-12 sm:py-16">
          <div className="text-4xl sm:text-6xl mb-4">🔍</div>
          <h3 className="text-lg sm:text-xl font-semibold text-gray-900 mb-2">
            No tasks found
          </h3>
          <p className="text-gray-500 text-sm sm:text-lg px-4">
            {emptyMessage}
          </p>
        </div>
      ) : (
        /* Job Cards - Mobile Optimized Spacing */
        <div className="space-y-3 sm:space-y-4">
          {jobs.map((job) => (
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
