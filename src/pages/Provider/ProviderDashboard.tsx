import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import ApiService from "../../services/api";
import { Job, Applicant } from "../../types"; // <-- Use Applicant interface
import { Plus, Users, CheckCircle, XCircle, Clock } from "lucide-react";

const ProviderDashboard: React.FC = () => {
  const { user } = useAuth();
  const [jobs, setJobs] = useState<Job[]>([]);
  const [applicants, setApplicants] = useState<Applicant[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user?._id) {
      fetchProviderData();
    }
  }, [user?._id]);

  const fetchProviderData = async () => {
    try {
      setLoading(true);
      const [jobsResponse] = await Promise.all([ApiService.getMyJobs()]);
      setJobs(jobsResponse.data);

      // Fetch applicants for all jobs
      const allApplicants: Applicant[] = [];
      for (const job of jobsResponse.data) {
        try {
          const applicantsResponse = await ApiService.getJobApplicants(job._id);
          allApplicants.push(...applicantsResponse.data);
        } catch (error) {
          console.error(`Error fetching applicants for job ${job._id}:`, error);
        }
      }
      setApplicants(allApplicants);
    } catch (error) {
      console.error("Error fetching provider data:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleApplicationAction = async (
    applicantId: string,
    action: "accept" | "reject"
  ) => {
    try {
      const applicant = applicants.find((app) => app._id === applicantId);
      if (!applicant) return;

      // For Applicant interface, jobId is a string
      if (action === "accept") {
        await ApiService.acceptApplicant(applicant.jobId, applicantId);
      } else {
        await ApiService.rejectApplicant(applicant.jobId, applicantId);
      }

      // Refresh data after action
      await fetchProviderData();
    } catch (error) {
      console.error(`Error ${action}ing applicant:`, error);
      alert(`Failed to ${action} applicant. Please try again.`);
    }
  };

  const pendingApplicants = applicants.filter(
    (app) => app.status === "pending"
  );
  const activeJobs = jobs.filter((job) => job.status === "open");

  if (loading) {
    return (
      <div className="text-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
        <p className="mt-4 text-gray-500">Loading dashboard...</p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">
            Provider Dashboard
          </h1>
          <p className="mt-1 text-sm text-gray-600">
            Welcome back, {user?.name}
          </p>
        </div>
        <Link
          to="/provider/post-job"
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2"
        >
          <Plus className="h-4 w-4" />
          <span>Post New Job</span>
        </Link>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <div className="flex items-center">
            <Clock className="h-8 w-8 text-blue-600" />
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Active Jobs</p>
              <p className="text-2xl font-bold text-gray-900">
                {activeJobs.length}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <div className="flex items-center">
            <Users className="h-8 w-8 text-amber-600" />
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">
                Pending Applications
              </p>
              <p className="text-2xl font-bold text-gray-900">
                {pendingApplicants.length}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <div className="flex items-center">
            <CheckCircle className="h-8 w-8 text-green-600" />
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">
                Total Positions Filled
              </p>
              <p className="text-2xl font-bold text-gray-900">
                {jobs.reduce((sum, job) => sum + job.peopleAccepted, 0)}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Pending Applicants */}
      {pendingApplicants.length > 0 && (
        <div className="bg-white rounded-lg shadow-sm border">
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-xl font-semibold text-gray-900">
              Pending Applications
            </h2>
          </div>
          <div className="divide-y divide-gray-200">
            {pendingApplicants.map((applicant) => {
              const job = jobs.find((j) => j._id === applicant.jobId);
              return (
                <div key={applicant._id} className="p-6">
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <h3 className="text-lg font-medium text-gray-900">
                        {applicant.seekerName}
                      </h3>
                      <p className="text-sm text-gray-600 mb-2">
                        Applied for: {job?.title}
                      </p>
                      <p className="text-gray-700 mb-3">{applicant.message}</p>
                      <div className="flex flex-wrap gap-2">
                        {applicant.seekerCategories.map((category) => (
                          <span
                            key={category}
                            className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800"
                          >
                            {category}
                          </span>
                        ))}
                      </div>
                    </div>
                    <div className="ml-6 flex space-x-3">
                      <button
                        onClick={() =>
                          handleApplicationAction(applicant._id, "accept")
                        }
                        className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors flex items-center space-x-1"
                      >
                        <CheckCircle className="h-4 w-4" />
                        <span>Accept</span>
                      </button>
                      <button
                        onClick={() =>
                          handleApplicationAction(applicant._id, "reject")
                        }
                        className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors flex items-center space-x-1"
                      >
                        <XCircle className="h-4 w-4" />
                        <span>Reject</span>
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Active Jobs */}
      <div className="bg-white rounded-lg shadow-sm border">
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">
            Your Active Jobs
          </h2>
        </div>
        {activeJobs.length === 0 ? (
          <div className="p-6 text-center">
            <p className="text-gray-500">
              No active jobs. Create your first job posting!
            </p>
            <Link
              to="/provider/post-job"
              className="mt-4 inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <Plus className="h-4 w-4 mr-2" />
              Post Your First Job
            </Link>
          </div>
        ) : (
          <div className="divide-y divide-gray-200">
            {activeJobs.map((job) => (
              <div key={job._id} className="p-6">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="text-lg font-medium text-gray-900">
                      {job.title}
                    </h3>
                    <p className="text-sm text-gray-600 mb-2">
                      {job.category} • {job.location}
                    </p>
                    <p className="text-gray-700 mb-3 line-clamp-2">
                      {job.description}
                    </p>
                    <div className="flex items-center space-x-4 text-sm text-gray-600">
                      <span>${job.payment}</span>
                      <span>{job.duration}</span>
                      <span>
                        {job.peopleAccepted}/{job.peopleNeeded} filled
                      </span>
                    </div>
                  </div>
                  <div className="ml-6">
                    <span
                      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        job.peopleAccepted === job.peopleNeeded
                          ? "bg-green-100 text-green-800"
                          : "bg-blue-100 text-blue-800"
                      }`}
                    >
                      {job.peopleAccepted === job.peopleNeeded
                        ? "Fulfilled"
                        : "Open"}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default ProviderDashboard;
