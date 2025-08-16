import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import ApiService from "../../services/api";
import { Job } from "../../types";
import {
  ArrowLeft,
  MapPin,
  Clock,
  IndianRupee,
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
      <div className="min-h-screen bg-orange-50 relative">
        {/* Very subtle background elements */}
        <div className="absolute inset-0">
          <div className="absolute top-1/3 left-1/3 w-64 h-64 bg-orange-100/30 rounded-full blur-3xl"></div>
          <div className="absolute bottom-1/3 right-1/3 w-48 h-48 bg-orange-200/20 rounded-full blur-3xl"></div>
        </div>

        <div className="relative min-h-screen flex flex-col justify-center py-12 sm:px-6 lg:px-8">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading job details...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!job) {
    return (
      <div className="min-h-screen bg-orange-50 relative">
        {/* Very subtle background elements */}
        <div className="absolute inset-0">
          <div className="absolute top-1/3 left-1/3 w-64 h-64 bg-orange-100/30 rounded-full blur-3xl"></div>
          <div className="absolute bottom-1/3 right-1/3 w-48 h-48 bg-orange-200/20 rounded-full blur-3xl"></div>
        </div>

        <div className="relative min-h-screen flex flex-col justify-center py-12 sm:px-6 lg:px-8">
          <div className="text-center">
            <p className="text-gray-600 text-lg">Job not found</p>
            <button
              onClick={() => navigate("/seeker/dashboard")}
              className="mt-4 text-orange-600 hover:text-orange-500 font-medium transition-colors duration-200"
            >
              Back to Dashboard
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-orange-50 relative">
      {/* Very subtle background elements */}
      <div className="absolute inset-0">
        <div className="absolute top-1/3 left-1/3 w-64 h-64 bg-orange-100/30 rounded-full blur-3xl"></div>
        <div className="absolute bottom-1/3 right-1/3 w-48 h-48 bg-orange-200/20 rounded-full blur-3xl"></div>
      </div>

      <div className="relative min-h-screen py-12 sm:px-6 lg:px-8">
        <div className="sm:mx-auto sm:w-full sm:max-w-2xl">
          {/* Header */}
          <div className="mb-8">
            <button
              onClick={() => navigate("/seeker/dashboard")}
              className="flex items-center text-orange-600 hover:text-orange-700 hover:underline transition-all duration-200 font-medium mb-4"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Dashboard
            </button>
            <h1 className="text-3xl font-bold text-gray-800">Apply for Job</h1>
            <p className="mt-2 text-sm text-gray-600">
              Review the job details and submit your application.
            </p>
          </div>

          {/* Job Details Card */}
          <div className="bg-white/60 backdrop-blur-sm border border-orange-100/60 shadow-lg rounded-2xl p-8 mb-8">
            <div className="flex justify-between items-start mb-4">
              <div>
                <h2 className="text-2xl font-bold text-gray-800">
                  {job.title}
                </h2>
                <p className="text-lg text-gray-600">{job.providerName}</p>
              </div>
              <span className="bg-orange-100 text-orange-800 text-sm font-medium px-3 py-1 rounded-full">
                {job.category}
              </span>
            </div>

            <p className="text-gray-700 mb-6">{job.description}</p>

            <div className="grid grid-cols-2 gap-6">
              <div className="flex items-center text-gray-600">
                <MapPin className="h-5 w-5 mr-2 text-orange-500" />
                <span>{job.location}</span>
              </div>
              <div className="flex items-center text-gray-600">
                <Clock className="h-5 w-5 mr-2 text-orange-500" />
                <span>{job.duration}</span>
              </div>
              <div className="flex items-center text-gray-600">
                <IndianRupee className="h-5 w-5 mr-2 text-orange-500" />
                <span>{job.payment} total</span>
              </div>
              <div className="flex items-center text-gray-600">
                <Users className="h-5 w-5 mr-2 text-orange-500" />
                <span>
                  {job.peopleAccepted}/{job.peopleNeeded} positions filled
                </span>
              </div>
            </div>
          </div>

          {/* Your Profile Preview */}
          <div className="bg-white/40 backdrop-blur-sm border border-orange-100/40 shadow-lg rounded-2xl p-8 mb-8">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">
              Your Profile (as seen by employer)
            </h3>
            <div className="space-y-3">
              <div className="break-words">
                <span className="font-medium text-gray-700">Name:</span>{" "}
                <span className="text-gray-600">{user?.name}</span>
              </div>

              <div>
                <span className="font-medium text-gray-700">
                  Work Categories:
                </span>
                <div className="mt-2 flex flex-wrap gap-2">
                  {user?.workCategories.map((category) => (
                    <span
                      key={category}
                      className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-orange-100 text-orange-800 break-words"
                    >
                      {category}
                    </span>
                  ))}
                </div>
              </div>
              <div>
                <span className="font-medium text-gray-700">Bio:</span>
                <div className="mt-1 text-gray-600 break-words whitespace-pre-wrap overflow-wrap-anywhere">
                  {user?.bio || "No bio provided"}
                </div>
              </div>
            </div>
          </div>

          {/* Application Form */}
          <div className="bg-white/60 backdrop-blur-sm border border-orange-100/60 shadow-lg rounded-2xl p-8">
            <form onSubmit={handleSubmit} className="space-y-6">
              {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg animate-slide-down">
                  {error}
                </div>
              )}

              <div className="group">
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
                  maxLength={250}
                  className="w-full px-3 py-2 bg-white/80 border border-gray-200 rounded-lg placeholder-gray-400 text-gray-900 focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-all duration-200 resize-none"
                  placeholder="Tell the employer why you're interested in this job and what makes you a good fit..."
                />
                <div className="flex justify-between mt-2">
                  <p className="text-sm text-gray-500">
                    Your profile information will be automatically included with
                    your application.
                  </p>
                </div>
              </div>

              <div className="flex justify-end">
                <button
                  type="submit"
                  disabled={isLoading}
                  className="bg-orange-600 hover:bg-orange-700 text-white px-6 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 flex items-center space-x-2 font-medium"
                >
                  {isLoading ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                      <span>Submitting...</span>
                    </>
                  ) : (
                    <>
                      <Send className="h-4 w-4" />
                      <span>Submit Application</span>
                    </>
                  )}
                </button>
              </div>
            </form>
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

export default ApplyJob;
