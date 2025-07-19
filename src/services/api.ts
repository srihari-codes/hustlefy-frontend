const API_BASE_URL =
  import.meta.env.VITE_API_URL || "http://localhost:5000/api";

// API utility functions
class ApiService {
  private static getAuthHeaders(): HeadersInit {
    const token = localStorage.getItem("token");
    return {
      "Content-Type": "application/json",
      ...(token && { Authorization: `Bearer ${token}` }),
    };
  }

  private static async handleResponse(response: Response) {
    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || "An error occurred");
    }

    return data;
  }

  // Auth endpoints
  static async register(userData: any) {
    const response = await fetch(`${API_BASE_URL}/auth/register`, {
      method: "POST",
      headers: this.getAuthHeaders(),
      body: JSON.stringify(userData),
    });
    return this.handleResponse(response);
  }

  static async login(credentials: { email: string; password: string }) {
    const response = await fetch(`${API_BASE_URL}/auth/login`, {
      method: "POST",
      headers: this.getAuthHeaders(),
      body: JSON.stringify(credentials),
    });
    return this.handleResponse(response);
  }

  static async loginWithGoogle(data: { credential: string }) {
    const response = await fetch(`${API_BASE_URL}/auth/google`, {
      method: "POST",
      headers: this.getAuthHeaders(),
      body: JSON.stringify(data),
    });
    return this.handleResponse(response);
  }

  static async getMe() {
    const response = await fetch(`${API_BASE_URL}/auth/me`, {
      headers: this.getAuthHeaders(),
    });
    return this.handleResponse(response);
  }

  // Profile endpoints
  static async getProfile() {
    const response = await fetch(`${API_BASE_URL}/profile`, {
      headers: this.getAuthHeaders(),
    });
    return this.handleResponse(response);
  }

  static async updateProfile(profileData: any) {
    const response = await fetch(`${API_BASE_URL}/profile`, {
      method: "PUT",
      headers: this.getAuthHeaders(),
      body: JSON.stringify(profileData),
    });
    return this.handleResponse(response);
  }

  // Job endpoints
  static async getJobs(filters?: {
    category?: string;
    location?: string;
    search?: string;
  }) {
    const params = new URLSearchParams();
    if (filters?.category) params.append("category", filters.category);
    if (filters?.location) params.append("location", filters.location);
    if (filters?.search) params.append("search", filters.search);

    const queryString = params.toString();
    const url = `${API_BASE_URL}/jobs${queryString ? `?${queryString}` : ""}`;

    const response = await fetch(url);
    return this.handleResponse(response);
  }

  static async getJob(jobId: string) {
    const response = await fetch(`${API_BASE_URL}/jobs/${jobId}`);
    return this.handleResponse(response);
  }

  static async createJob(jobData: any) {
    const response = await fetch(`${API_BASE_URL}/jobs`, {
      method: "POST",
      headers: this.getAuthHeaders(),
      body: JSON.stringify(jobData),
    });
    return this.handleResponse(response);
  }

  static async getMyJobs() {
    const response = await fetch(`${API_BASE_URL}/jobs/my/jobs`, {
      headers: this.getAuthHeaders(),
    });
    return this.handleResponse(response);
  }

  static async deleteJob(jobId: string) {
    const response = await fetch(`${API_BASE_URL}/jobs/${jobId}`, {
      method: "DELETE",
      headers: this.getAuthHeaders(),
    });
    return this.handleResponse(response);
  }

  // Application endpoints
  static async applyForJob(jobId: string, message?: string) {
    const response = await fetch(`${API_BASE_URL}/jobs/${jobId}/apply`, {
      method: "POST",
      headers: this.getAuthHeaders(),
      body: JSON.stringify({ message }),
    });
    return this.handleResponse(response);
  }

  static async getJobApplicants(jobId: string) {
    const response = await fetch(`${API_BASE_URL}/jobs/${jobId}/applicants`, {
      headers: this.getAuthHeaders(),
    });
    return this.handleResponse(response);
  }

  static async acceptApplicant(jobId: string, applicationId: string) {
    const response = await fetch(
      `${API_BASE_URL}/jobs/${jobId}/accept/${applicationId}`,
      {
        method: "POST",
        headers: this.getAuthHeaders(),
      }
    );
    return this.handleResponse(response);
  }

  static async rejectApplicant(jobId: string, applicationId: string) {
    const response = await fetch(
      `${API_BASE_URL}/jobs/${jobId}/reject/${applicationId}`,
      {
        method: "POST",
        headers: this.getAuthHeaders(),
      }
    );
    return this.handleResponse(response);
  }

  static async getMyApplications() {
    const response = await fetch(`${API_BASE_URL}/jobs/my/applications`, {
      headers: this.getAuthHeaders(),
    });
    return this.handleResponse(response);
  }
}

export default ApiService;
