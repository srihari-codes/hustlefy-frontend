import React from 'react';
import { Job } from '../../types';
import JobCard from './JobCard';

interface JobListProps {
  jobs: Job[];
  onApply?: (jobId: string) => void;
  showApplyButton?: boolean;
  emptyMessage?: string;
}

const JobList: React.FC<JobListProps> = ({ 
  jobs, 
  onApply, 
  showApplyButton = true,
  emptyMessage = "No jobs available at the moment." 
}) => {
  if (jobs.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500 text-lg">{emptyMessage}</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {jobs.map(job => (
        <JobCard
          key={job.id}
          job={job}
          onApply={onApply}
          showApplyButton={showApplyButton}
        />
      ))}
    </div>
  );
};

export default JobList;