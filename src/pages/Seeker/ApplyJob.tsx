import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import ApiService from "../../services/api";
import { Job } from "../../types";
import {
  ArrowLeft,
  MapPin,
  Clock,
  DollarSign,
  Users,
  Send,
} from "lucide-react";

const ApplyJob: React.FC = () => {
  const { jobId } = useParams<{ jobId: string }>();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [job, setJob] = useState<Job | null>(null);
  const [message, setMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [fetchingJob, setFetchingJob] = useState(true);

  useEffect(() => {
    console.log("ApplyJob jobId:", jobId); // <-- Print jobId for debugging
    if (!jobId) {
      setJob(null);
      setFetchingJob(false);
      return;
    }
    fetchJob();
  }, [jobId]);

  const fetchJob = async () => {
    try {
      setFetchingJob(true);
      const response = await ApiService.getJob(jobId!);
      setJob(response.data);
    } catch (error) {
      console.error("Error fetching job:", error);
      setJob(null);
    } finally {
      setFetchingJob(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    try {
      await ApiService.applyForJob(job!._id, message); // <-- Use job._id instead of job.id
      navigate("/seeker/dashboard");
    } catch (error: any) {
      setError(
        error.message || "Failed to submit application. Please try again."
      );
    } finally {
      setIsLoading(false);
    }
  };

  if (fetchingJob) {
    return (
      <div className="text-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
        <p className="mt-4 text-gray-500">Loading job details...</p>
      </div>
    );
  }

  if (!job) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">Job not found</p>
        <button
          onClick={() => navigate("/seeker/dashboard")}
          className="mt-4 text-blue-600 hover:text-blue-500"
        >
          Back to Dashboard
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <button
          onClick={() => navigate("/seeker/dashboard")}
          className="flex items-center text-gray-600 hover:text-gray-900 mb-4"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Dashboard
        </button>
        <h1 className="text-3xl font-bold text-gray-900">Apply for Job</h1>
        <p className="mt-1 text-sm text-gray-600">
          Review the job details and submit your application.
        </p>
      </div>

      {/* Job Details */}
      <div className="bg-white rounded-lg shadow-sm border p-6 mb-8">
        <div className="flex justify-between items-start mb-4">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">{job.title}</h2>
            <p className="text-lg text-gray-600">{job.providerName}</p>
          </div>
          <span className="bg-blue-100 text-blue-800 text-sm font-medium px-3 py-1 rounded-full">
            {job.category}
          </span>
        </div>

        <p className="text-gray-700 mb-6">{job.description}</p>

        <div className="grid grid-cols-2 gap-6">
          <div className="flex items-center text-gray-600">
            <MapPin className="h-5 w-5 mr-2" />
            <span>{job.location}</span>
          </div>
          <div className="flex items-center text-gray-600">
            <Clock className="h-5 w-5 mr-2" />
            <span>{job.duration}</span>
          </div>
          <div className="flex items-center text-gray-600">
            <DollarSign className="h-5 w-5 mr-2" />
            <span>${job.payment} total</span>
          </div>
          <div className="flex items-center text-gray-600">
            <Users className="h-5 w-5 mr-2" />
            <span>
              {job.peopleAccepted}/{job.peopleNeeded} positions filled
            </span>
          </div>
        </div>
      </div>

      {/* Your Profile Preview */}
      <div className="bg-gray-50 rounded-lg p-6 mb-8">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          Your Profile (as seen by employer)
        </h3>
        <div className="space-y-3">
          <div>
            <span className="font-medium text-gray-700">Name:</span>{" "}
            {user?.name}
          </div>
          <div>
            <span className="font-medium text-gray-700">Location:</span>{" "}
            {user?.location}
          </div>
          <div>
            <span className="font-medium text-gray-700">Work Categories:</span>
            <div className="mt-1 flex flex-wrap gap-2">
              {user?.workCategories.map((category) => (
                <span
                  key={category}
                  className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800"
                >
                  {category}
                </span>
              ))}
            </div>
          </div>
          <div>
            <span className="font-medium text-gray-700">Bio:</span>
            <p className="mt-1 text-gray-600">
              {user?.bio || "No bio provided"}
            </p>
          </div>
        </div>
      </div>

      {/* Application Form */}
      <div className="bg-white rounded-lg shadow-sm border p-6">
        <form onSubmit={handleSubmit}>
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-6">
              {error}
            </div>
          )}

          <div className="mb-6">
            <label
              htmlFor="message"
              className="block text-sm font-medium text-gray-700 mb-2"
            >
              Cover Message (Optional)
            </label>
            <textarea
              id="message"
              rows={4}
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              className="block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              placeholder="Tell the employer why you're interested in this job and what makes you a good fit..."
            />
            <p className="mt-1 text-sm text-gray-500">
              Your profile information will be automatically included with your
              application.
            </p>
          </div>

          <div className="flex justify-end">
            <button
              type="submit"
              disabled={isLoading}
              className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 flex items-center space-x-2"
            >
              <Send className="h-4 w-4" />
              <span>{isLoading ? "Submitting..." : "Submit Application"}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ApplyJob;
