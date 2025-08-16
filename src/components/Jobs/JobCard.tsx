// JobCard.tsx
import React from "react";
import { Job } from "../../types";
import { MapPin, Clock, Users } from "lucide-react";
import { categoryEmojiMap } from "../../data/mockData";

interface JobCardProps {
  job: Job;
  onApply?: (jobId: string) => void;
  showApplyButton?: boolean;
}

const JobCard: React.FC<JobCardProps> = ({
  job,
  onApply,
  showApplyButton = true,
}) => {
  const handleCardClick = () => {
    if (showApplyButton && onApply) {
      onApply(job._id);
    }
  };

  const spotsLeft = Math.max(0, job.peopleNeeded - job.peopleAccepted);
  const progressPercentage = job.peopleNeeded
    ? Math.min(100, (job.peopleAccepted / job.peopleNeeded) * 100)
    : 0;

  return (
    <div
      className="group relative bg-orange-50 border border-orange-100 rounded-2xl p-3 sm:p-6 mb-3 sm:mb-4 shadow-lg shadow-orange-500/25 hover:bg-orange-25 hover:shadow-2xl hover:shadow-orange-500/35 hover:border-orange-50 hover:-translate-y-1 transition-all duration-300 sm:cursor-pointer active:scale-[0.98]"
      onClick={handleCardClick}
    >
      {/* Mobile-First Layout */}
      <div className="space-y-2 sm:space-y-4">
        {/* Top Section - Title & Payment */}
        <div className="flex items-start gap-3 sm:gap-4">
          {/* Title and Payment */}
          <div className="flex-1 min-w-0">
            <h3 className="text-base sm:text-xl font-bold text-gray-800 mb-1 sm:mb-2 leading-tight group-hover:text-orange-700 transition-colors duration-300">
              {job.title}
            </h3>

            {/* Payment and Category Row */}
            <div className="flex items-center justify-between">
              {/* Payment - Enhanced gradient matching theme */}
              <div className="flex items-baseline gap-1">
                <span className="text-xl sm:text-3xl font-bold bg-gradient-to-r from-orange-700 to-rose-600 bg-clip-text text-transparent">
                  ₹{job.payment}
                </span>
              </div>

              {/* Category Badge */}
              {job.category && (
                <div className="flex items-center gap-1 bg-gradient-to-r from-orange-100 to-rose-100 border border-orange-200/50 rounded-full px-2 py-1 shadow-sm">
                  <span className="text-xs">
                    {categoryEmojiMap[job.category] || "💼"}
                  </span>
                  <span className="text-xs font-medium text-gray-700 truncate max-w-20 sm:max-w-none">
                    {job.category}
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Job Meta Information - Enhanced shadows */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 sm:gap-3 text-sm">
          {/* Duration */}
          <div className="flex items-center gap-2 text-gray-700 bg-gradient-to-br from-orange-50/80 to-rose-50/60 border border-orange-200/30 backdrop-blur-sm rounded-lg px-2 py-1.5 sm:px-3 sm:py-2 shadow-md shadow-orange-200/40">
            <Clock className="h-3 w-3 sm:h-4 sm:w-4 text-orange-600 flex-shrink-0" />
            <span className="font-medium text-xs sm:text-sm">
              {job.duration}
            </span>
          </div>

          {/* Location */}
          <div className="flex items-center gap-2 text-gray-700 bg-gradient-to-br from-orange-50/80 to-rose-50/60 border border-orange-200/30 backdrop-blur-sm rounded-lg px-2 py-1.5 sm:px-3 sm:py-2 shadow-md shadow-rose-200/40">
            <MapPin className="h-3 w-3 sm:h-4 sm:w-4 text-rose-500 flex-shrink-0" />
            <span className="font-medium text-xs sm:text-sm truncate">
              {job.location}
            </span>
          </div>

          {/* People Needed */}
          {job.peopleNeeded && (
            <div className="flex items-center gap-2 text-gray-700 bg-gradient-to-br from-orange-50/80 to-rose-50/60 border border-orange-200/30 backdrop-blur-sm rounded-lg px-2 py-1.5 sm:px-3 sm:py-2 shadow-md shadow-orange-200/40">
              <Users className="h-3 w-3 sm:h-4 sm:w-4 text-orange-500 flex-shrink-0" />
              <span className="font-medium text-xs sm:text-sm">
                {job.peopleNeeded}{" "}
                {job.peopleNeeded === 1 ? "person" : "people"}
              </span>
            </div>
          )}
        </div>

        {/* Job Description - Enhanced shadow */}
        {job.description && (
          <div className="bg-gradient-to-br from-white/70 to-orange-25/50 border border-orange-200/25 backdrop-blur-sm rounded-lg p-2 sm:p-3 shadow-lg shadow-orange-200/30">
            <p className="text-gray-700 text-xs sm:text-sm leading-relaxed line-clamp-2 sm:line-clamp-2">
              {job.description}
            </p>
          </div>
        )}

        {/* Progress Section - Enhanced shadow */}
        <div className="bg-gradient-to-br from-white/70 to-rose-25/40 border border-rose-200/25 backdrop-blur-sm rounded-lg p-2 sm:p-3 shadow-lg shadow-rose-200/30">
          <div className="flex items-center justify-between text-xs text-gray-600 mb-2 sm:mb-3">
            <span className="font-medium">Position availability</span>
            <span className="font-semibold text-orange-600">
              {spotsLeft > 0 ? `${spotsLeft} spots left` : "Fully booked"}
            </span>
          </div>

          {/* Progress Bar - Enhanced shadow */}
          <div className="w-full bg-gradient-to-r from-orange-100 to-rose-100 rounded-full h-1.5 sm:h-2 shadow-inner border border-orange-200/20">
            <div
              className="bg-gradient-to-r from-orange-500 via-orange-600 to-rose-500 h-1.5 sm:h-2 rounded-full transition-all duration-500 shadow-md"
              style={{ width: `${progressPercentage}%` }}
            />
          </div>

          {/* Progress Text */}
          <div className="flex justify-between text-xs text-gray-500 mt-1 sm:mt-2">
            <span>{job.peopleAccepted} accepted</span>
            <span>{job.peopleNeeded} needed</span>
          </div>
        </div>

        {/* Click to Apply - Enhanced contrast */}
        <div className="text-center pt-1 sm:pt-2 border-t border-orange-200/40">
          <p className="text-sm font-semibold text-orange-700 group-hover:text-orange-900 transition-colors duration-300 py-1 sm:py-0 cursor-pointer">
            Click here to apply
          </p>
        </div>
      </div>
    </div>
  );
};

export default JobCard;
