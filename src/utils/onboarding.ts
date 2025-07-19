// utils/onboarding.ts
import { User } from "../types";

export function isOnboardingComplete(user: User | null): boolean {
  if (!user) return false;
  console.log("Checking onboarding for user:", user);
  // Check if role is set and other required fields (customize as needed)
  console.log(!!user.role && !!user.name && !!user.location);
  return !!user.role && !!user.name && !!user.location;
}
