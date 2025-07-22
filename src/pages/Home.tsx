import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import JobList from "../components/Jobs/JobList";
import ApiService from "../services/api";
import { Job } from "../types";
import { Search, MapPin, Filter } from "lucide-react";

const Home: React.FC = () => {
  const { isAuthenticated, user } = useAuth();
  const navigate = useNavigate();
  const [jobs, setJobs] = useState<Job[]>([]);
  const [filteredJobs, setFilteredJobs] = useState<Job[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchJobs();
  }, []);

  const fetchJobs = async () => {
    try {
      setLoading(true);
      const response = await ApiService.getJobs();
      setJobs(response.data);
      setFilteredJobs(response.data);
    } catch (error: any) {
      setError("Failed to load jobs. Please try again.");
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
    if (!isAuthenticated) {
      navigate("/login");
      return;
    }

    if (user?.role !== "seeker") {
      alert(
        "Only job seekers can apply to jobs. Please create a seeker profile."
      );
      return;
    }

    navigate(`/apply/${jobId}`);
  };

  const categories = [...new Set(jobs.map((job) => job.category))];

  return (
    <main className="min-h-screen bg-orange-50">
      {/* Hero Section */}
      <section className="px-6 py-16 md:py-24 max-w-7xl mx-auto ">
        {/* Left Column */}
        <div className="w-full md:float-left md:w-1/2 max-w-lg">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 leading-relaxed tracking-wide">
            Find Quick, Local Jobs on Your Schedule
          </h1>
          <p className="text-gray-600 mt-4 text-lg">
            Earn money with simple, one-time tasks nearby
          </p>
          {!isAuthenticated ? (
            <button
              onClick={() => navigate("/signup?role=seeker")}
              className="mt-6 inline-block bg-orange-500 hover:bg-orange-600 text-white font-semibold py-3 px-6 rounded-md transition-colors duration-200"
            >
              Find Tasks
            </button>
          ) : (
            <button
              onClick={() => {
                if (user?.role === "seeker") {
                  navigate("/seeker/dashboard");
                } else if (user?.role === "provider") {
                  navigate("/provider/dashboard");
                }
              }}
              className="mt-6 inline-block bg-orange-500 hover:bg-orange-600 text-white font-semibold py-3 px-6 rounded-md transition-colors duration-200"
            >
              Find Tasks
            </button>
          )}
        </div>

        {/* Right Column */}
        <div className="hidden md:block md:float-right md:w-1/2 flex justify-center mt-[70px] md:mt-0">
          <div className="w-[500px] md:w-[600px] h-[400px] md:h-[500px] flex items-center justify-center relative -mt-[80px] overflow-hidden">
            {/* Background SVG */}
            <img
              src="/assets/images/blob-haikei.svg"
              alt="Background blob"
              className="absolute inset-0 w-full h-full z-0 object-cover bg-transparent"
            />

            {/* Man Pointing PNG - Flipped to point left and cropped to show only the man */}
            <img
              src="/assets/images/man-pointing.png"
              alt="Man pointing to the left"
              className="w-[350px] h-[350px] md:w-[450px] md:h-[450px] object-cover object-center transform scale-x-[-1] translate-y-[20px] relative z-10"
            />
          </div>
        </div>

        <div className="md:clear-both"></div>
      </section>

      {/* Latest Tasks Section */}
      <section className="px-6 pb-12 max-w-7xl mx-auto">
        <div className="bg-white shadow-lg rounded-xl px-6 py-6 -mt-6 relative z-10">
          <h2 className="text-2xl font-bold text-gray-900 mb-6 font-poppins">
            Latest Tasks
          </h2>

          <div className="flex flex-wrap gap-4 items-center">
            {/* Category Dropdown */}
            <div className="flex-1 min-w-[120px]">
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="w-full border border-gray-300 rounded px-4 py-2 focus:outline-none focus:ring-2 focus:ring-orange-400 bg-white text-gray-700"
              >
                <option value="">Category</option>
                {categories.map((category) => (
                  <option key={category} value={category}>
                    {category}
                  </option>
                ))}
              </select>
            </div>

            {/* Anytime Dropdown */}
            <div className="flex-1 min-w-[120px]">
              <select className="w-full border border-gray-300 rounded px-4 py-2 focus:outline-none focus:ring-2 focus:ring-orange-400 bg-white text-gray-700">
                <option>Anytime</option>
                <option>Today</option>
                <option>Tomorrow</option>
                <option>This Week</option>
                <option>This Weekend</option>
              </select>
            </div>

            {/* Location Dropdown */}
            <div className="flex-1 min-w-[120px]">
              <select className="w-full border border-gray-300 rounded px-4 py-2 focus:outline-none focus:ring-2 focus:ring-orange-400 bg-white text-gray-700">
                <option>Location</option>
                <option>Mumbai</option>
                <option>Delhi</option>
                <option>Bangalore</option>
                <option>Pune</option>
              </select>
            </div>

            {/* Pay Dropdown */}
            <div className="flex-1 min-w-[120px]">
              <select className="w-full border border-gray-300 rounded px-4 py-2 focus:outline-none focus:ring-2 focus:ring-orange-400 bg-white text-gray-700">
                <option>Pay</option>
                <option>₹500-1000</option>
                <option>₹1000-2000</option>
                <option>₹2000-5000</option>
                <option>₹5000+</option>
              </select>
            </div>

            {/* Search Button */}
            <button className="bg-red-500 hover:bg-red-600 text-white px-6 py-2 rounded-md font-semibold transition-colors duration-200 min-w-[100px]">
              Search
            </button>
          </div>
        </div>
      </section>

      {/* Job Listings */}
      <section className="px-6 pb-12 max-w-7xl mx-auto">
        <div className="bg-white rounded-xl shadow-lg p-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-6 font-poppins">
            Available Jobs ({filteredJobs.length})
          </h2>

          {loading ? (
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500 mx-auto"></div>
              <p className="mt-4 text-gray-500">Loading jobs...</p>
            </div>
          ) : error ? (
            <div className="text-center py-12">
              <p className="text-red-500 mb-4">{error}</p>
              <button
                onClick={fetchJobs}
                className="bg-orange-500 text-white px-4 py-2 rounded-lg hover:bg-orange-600"
              >
                Try Again
              </button>
            </div>
          ) : (
            <JobList
              jobs={filteredJobs}
              onApply={handleApply}
              showApplyButton={!isAuthenticated || user?.role === "seeker"}
            />
          )}
        </div>
      </section>
    </main>
  );
};

export default Home;
