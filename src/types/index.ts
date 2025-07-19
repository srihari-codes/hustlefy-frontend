export interface User {
  _id: string;
  id: string;
  name: string;
  email: string;
  phone?: string;
  profilePicture?: string;
  location: string;
  workCategories: string[];
  bio: string;
  role: "provider" | "seeker";
}

export interface Job {
  id: string;
  title: string;
  description: string;
  location: string;
  peopleNeeded: number;
  peopleAccepted: number;
  category: string;
  duration: string;
  payment: number;
  providerId: string;
  providerName: string;
  createdAt: string;
  status: "open" | "fulfilled";
}

export interface Application {
  id: string;
  jobId: string;
  seekerId: string;
  seekerName: string;
  seekerBio: string;
  seekerCategories: string[];
  message: string;
  status: "pending" | "accepted" | "rejected";
  appliedAt: string;
}

export interface AuthState {
  isAuthenticated: boolean;
  user: User | null;
}

export interface GoogleLoginResponse {
  user: User;
  token: string;
  isNewUser?: boolean;
  message?: string;
}
