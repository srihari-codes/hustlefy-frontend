import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import JobList from "../../components/Jobs/JobList";
import ApiService from "../../services/api";
import { Job } from "../../types";
import { Search, Filter, MapPin } from "lucide-react";

const SeekerDashboard: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [jobs, setJobs] = useState<Job[]>([]);
  const [filteredJobs, setFilteredJobs] = useState<Job[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchJobs();
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

  if (loading) {
    return (
      <div className="text-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
        <p className="mt-4 text-gray-500">Loading jobs...</p>
      </div>
    );
  }

  if (!jobs.length) {
    // Show profile completion prompt only if categories are missing or incomplete
    if (!user?.workCategories?.length) {
      return (
        <div className="flex flex-col items-center justify-center py-12">
          <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 max-w-md w-full">
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
        </div>
      );
    }
    // If categories are present but no jobs, show a simple message
    return (
      <div className="flex flex-col items-center justify-center py-12">
        <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 max-w-md w-full">
          <h3 className="text-sm font-medium text-amber-900 mb-2">
            Add More Job Categories
          </h3>
          <p className="text-sm text-amber-700 mb-3">
            We currently have no jobs that match the categories and location in
            your profile. Please check back later or update your profile to
            explore more opportunities.
          </p>
          <button
            onClick={() => navigate("/profile")}
            className="text-sm bg-amber-600 text-white px-3 py-1 rounded hover:bg-amber-700 transition-colors"
          >
            Update Profile
          </button>
        </div>
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
          Welcome back, {user?.name}! Here are jobs matching your profile.
        </p>
      </div>

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

      {/* Search and Filter */}
      <div className="bg-white rounded-lg shadow-sm border p-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
            <input
              type="text"
              placeholder="Search jobs..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          <div className="relative">
            <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent appearance-none"
            >
              <option value="">All Categories</option>
              {availableCategories.map((category) => (
                <option key={category} value={category}>
                  {category}
                </option>
              ))}
            </select>
          </div>

          <div className="relative">
            <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
            <input
              type="text"
              placeholder="Near your location"
              value={user?.location || ""}
              disabled
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-500"
            />
          </div>
        </div>
      </div>

      {/* Job Listings */}
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

      {/* Profile Completion Reminder */}
      {(!user?.workCategories.length || !user?.bio) && (
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
