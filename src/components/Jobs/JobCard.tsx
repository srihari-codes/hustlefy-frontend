import React from "react";
import { Job } from "../../types";
import { MapPin, Clock, DollarSign, Users } from "lucide-react";

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
  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
      <div className="flex justify-between items-start mb-4">
        <div>
          <h3 className="text-lg font-semibold text-gray-900 mb-1">
            {job.title}
          </h3>
          <p className="text-sm text-gray-600">{job.providerName}</p>
        </div>
        <span className="bg-blue-100 text-blue-800 text-xs font-medium px-2.5 py-0.5 rounded">
          {job.category}
        </span>
      </div>

      <p className="text-gray-700 mb-4 line-clamp-2">{job.description}</p>

      <div className="grid grid-cols-2 gap-4 mb-4">
        <div className="flex items-center text-sm text-gray-600">
          <MapPin className="h-4 w-4 mr-1" />
          {job.location}
        </div>
        <div className="flex items-center text-sm text-gray-600">
          <Clock className="h-4 w-4 mr-1" />
          {job.duration}
        </div>
        <div className="flex items-center text-sm text-gray-600">
          <DollarSign className="h-4 w-4 mr-1" />${job.payment}
        </div>
        <div className="flex items-center text-sm text-gray-600">
          <Users className="h-4 w-4 mr-1" />
          {job.peopleAccepted}/{job.peopleNeeded} filled
        </div>
      </div>

      {showApplyButton && onApply && (
        <button
          onClick={() => onApply(job._id)}
          className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors"
        >
          Apply Now
        </button>
      )}
    </div>
  );
};

export default JobCard;
