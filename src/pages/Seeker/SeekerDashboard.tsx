import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import JobList from "../../components/Jobs/JobList";
import ApiService from "../../services/api";
import { Job } from "../../types";
import {
  Search,
  Filter,
  MapPin,
  Briefcase,
  Clock,
  CheckCircle,
  XCircle,
} from "lucide-react";

interface Application {
  _id: string;
  jobId: {
    _id: string;
    title: string;
    description: string;
    location: string;
    category: string;
    duration: string;
    payment: number;
    status: string;
  };
  status: "pending" | "accepted" | "rejected" | "fulfilled";
  appliedDate?: string;
  message?: string;
  createdAt: string; // <-- Add this line
  updatedAt?: string; // <-- Optional
  // ...other fields as needed
}

const SeekerDashboard: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [jobs, setJobs] = useState<Job[]>([]);
  const [filteredJobs, setFilteredJobs] = useState<Job[]>([]);
  const [applications, setApplications] = useState<Application[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchJobs();
    fetchApplications();
  }, [user]);

  const fetchJobs = async () => {
    try {
      setLoading(true);
      const response = await ApiService.getJobs();

      // Filter jobs based on user's location and categories
      const relevantJobs = response.data.filter((job: Job) => {
        const hasCategory =
          Array.isArray(user?.workCategories) &&
          user.workCategories.length > 0 &&
          user.workCategories.includes(job.category);

        const hasLocation =
          typeof user?.location === "string" &&
          user.location.length > 0 &&
          job.location.toLowerCase().includes(user.location.toLowerCase());

        // If both are missing, show all jobs
        if (
          (!Array.isArray(user?.workCategories) ||
            user.workCategories.length === 0) &&
          (!user?.location || user.location.length === 0)
        ) {
          return true;
        }

        return hasCategory || hasLocation;
      });

      setJobs(relevantJobs);
      setFilteredJobs(relevantJobs);
    } catch (error) {
      console.error("Error fetching jobs:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchApplications = async () => {
    try {
      // Fetch user's applications
      const response = await ApiService.getUserApplications();
      setApplications(response.data || []);
    } catch (error) {
      console.error("Error fetching applications:", error);
    }
  };

  useEffect(() => {
    let filtered = jobs;

    if (searchTerm) {
      filtered = filtered.filter(
        (job) =>
          job.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
          job.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
          job.location.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (selectedCategory) {
      filtered = filtered.filter((job) => job.category === selectedCategory);
    }

    setFilteredJobs(filtered);
  }, [jobs, searchTerm, selectedCategory]);

  const handleApply = (jobId: string) => {
    navigate(`/apply/${jobId}`);
  };

  const userCategories = user?.workCategories || [];
  const availableCategories = [...new Set(jobs.map((job) => job.category))];

  // Calculate stats
  const totalApplications = applications.length;
  const pendingApplications = applications.filter(
    (app) => app.status === "pending"
  ).length;
  const acceptedApplications = applications.filter(
    (app) => app.status === "accepted"
  ).length;
  const rejectedApplications = applications.filter(
    (app) => app.status === "rejected"
  ).length;

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
      <div>
        <h1 className="text-3xl font-bold text-gray-900">
          Job Seeker Dashboard
        </h1>
        <p className="mt-1 text-sm text-gray-600">
          Welcome back, {user?.name}! Here's your job search overview.
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center">
            <div className="p-2 bg-blue-100 rounded-lg">
              <Briefcase className="h-6 w-6 text-blue-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total Applied</p>
              <p className="text-2xl font-bold text-gray-900">
                {totalApplications}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center">
            <div className="p-2 bg-yellow-100 rounded-lg">
              <Clock className="h-6 w-6 text-yellow-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Pending</p>
              <p className="text-2xl font-bold text-gray-900">
                {pendingApplications}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center">
            <div className="p-2 bg-green-100 rounded-lg">
              <CheckCircle className="h-6 w-6 text-green-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Accepted</p>
              <p className="text-2xl font-bold text-gray-900">
                {acceptedApplications}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center">
            <div className="p-2 bg-red-100 rounded-lg">
              <XCircle className="h-6 w-6 text-red-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Rejected</p>
              <p className="text-2xl font-bold text-gray-900">
                {rejectedApplications}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Applications */}
      {applications.length > 0 && (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900">
              Recent Applications
            </h2>
          </div>
          <div className="p-6">
            <div className="space-y-4 max-h-64 overflow-y-auto">
              {applications.slice(0, 5).map((application) => (
                <div
                  key={application._id}
                  className="flex items-start justify-between p-4 bg-gray-50 rounded-lg"
                >
                  <div className="flex-1">
                    <h3 className="text-sm font-medium text-gray-900">
                      Applied for: {application.jobId.title}
                    </h3>
                    <p className="text-sm text-gray-600 mt-1">
                      {application.jobId.category} •{" "}
                      {application.jobId.location}
                    </p>
                    {application.message && (
                      <p className="text-sm text-gray-500 mt-2 italic">
                        "{application.message}"
                      </p>
                    )}
                    {application.status === "accepted" && (
                      <p className="text-xs text-green-700 mt-2">
                        Check your email for more info.
                      </p>
                    )}
                  </div>
                  <div className="ml-4 flex flex-col items-end">
                    <span
                      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        application.status === "pending"
                          ? "bg-yellow-100 text-yellow-800"
                          : application.status === "accepted"
                          ? "bg-green-100 text-green-800"
                          : "bg-red-100 text-red-800"
                      }`}
                    >
                      {application.status.charAt(0).toUpperCase() +
                        application.status.slice(1)}
                    </span>
                    <span className="text-xs text-gray-500 mt-1">
                      {new Date(application.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                </div>
              ))}
            </div>
            {applications.length === 0 && (
              <p className="text-center text-gray-500 py-4">
                No applications yet. Start applying to jobs below!
              </p>
            )}
          </div>
        </div>
      )}

      {/* Your Categories */}
      {userCategories.length > 0 && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <h3 className="text-sm font-medium text-blue-900 mb-2">
            Your Work Categories:
          </h3>
          <div className="flex flex-wrap gap-2">
            {userCategories.map((category) => (
              <span
                key={category}
                className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800"
              >
                {category}
              </span>
            ))}
          </div>
        </div>
      )}

      {!jobs.length ? (
        // Show profile completion prompt only if categories are missing or incomplete
        !user?.workCategories?.length ? (
          <div className="flex flex-col items-center justify-center py-12">
            <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 max-w-md w-full">
              <h3 className="text-sm font-medium text-amber-900 mb-2">
                Complete Your Profile
              </h3>
              <p className="text-sm text-amber-700 mb-3">
                Add more details to your profile to get better job
                recommendations and improve your application success rate.
              </p>
              <button
                onClick={() => navigate("/profile")}
                className="text-sm bg-amber-600 text-white px-3 py-1 rounded hover:bg-amber-700 transition-colors"
              >
                Update Profile
              </button>
            </div>
          </div>
        ) : (
          // If categories are present but no jobs, show a simple message
          <div className="flex flex-col items-center justify-center py-12">
            <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 max-w-md w-full">
              <h3 className="text-sm font-medium text-amber-900 mb-2">
                Add More Job Categories
              </h3>
              <p className="text-sm text-amber-700 mb-3">
                We currently have no jobs that match the categories and location
                in your profile. Please check back later or update your profile
                to explore more opportunities.
              </p>
              <button
                onClick={() => navigate("/profile")}
                className="text-sm bg-amber-600 text-white px-3 py-1 rounded hover:bg-amber-700 transition-colors"
              >
                Update Profile
              </button>
            </div>
          </div>
        )
      ) : (
        /* Job Listings */
        <div>
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-gray-900">
              Recommended Jobs ({filteredJobs.length})
            </h2>
          </div>

          <JobList
            jobs={filteredJobs}
            onApply={handleApply}
            emptyMessage="No jobs match your criteria. Try adjusting your search or categories."
          />
        </div>
      )}

      {/* Profile Completion Reminder */}
      {(!user?.workCategories?.length || !user?.bio) && (
        <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
          <h3 className="text-sm font-medium text-amber-900 mb-2">
            Complete Your Profile
          </h3>
          <p className="text-sm text-amber-700 mb-3">
            Add more details to your profile to get better job recommendations
            and improve your application success rate.
          </p>
          <button
            onClick={() => navigate("/profile")}
            className="text-sm bg-amber-600 text-white px-3 py-1 rounded hover:bg-amber-700 transition-colors"
          >
            Update Profile
          </button>
        </div>
      )}
    </div>
  );
};

export default SeekerDashboard;
