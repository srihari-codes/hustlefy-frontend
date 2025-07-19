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
  _id: string;
  title: string;
  description: string;
  location: string;
  category: string;
  peopleNeeded: number;
  peopleAccepted: number;
  duration: string;
  payment: number;
  providerId?: {
    _id: string;
    name: string;
    email: string;
  } | null;
  providerName: string;
  status: string;
  acceptedUsers: any[];
  createdAt: string;
  updatedAt: string;
  __v: number;
}

export interface Application {
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
  seekerId: string;
  seekerName: string;
  seekerBio: string;
  seekerCategories: string[];
  message: string;
  status: "pending" | "accepted" | "rejected" | "fulfilled";
  createdAt: string;
  updatedAt: string;
  __v?: number;
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

export interface Applicant {
  _id: string;
  jobId: string; // <-- jobId is a string here
  seekerId: {
    _id: string;
    name: string;
    email: string;
    workCategories: string[];
    bio: string;
    location: string;
    phone: string;
  };
  seekerName: string;
  seekerBio: string;
  seekerCategories: string[];
  message: string;
  status: "pending" | "accepted" | "rejected" | "fulfilled";
  createdAt: string;
  updatedAt: string;
  __v?: number;
}
