// utils/onboarding.ts
import { User } from "../types";

export function isOnboardingComplete(user: User | null): boolean {
  if (!user) return false;
  // Check if role is set and other required fields (customize as needed)
  return !!user.role && !!user.name && !!user.location;
}
