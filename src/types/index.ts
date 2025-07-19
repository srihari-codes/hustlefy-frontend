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
  _id: string; // <-- Use _id to match backend response
  jobId: string;
  seekerId:
    | string
    | {
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
  status: "pending" | "accepted" | "rejected";
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
