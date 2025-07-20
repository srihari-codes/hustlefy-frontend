// utils/onboarding.ts
import { User } from "../types";

export function isOnboardingComplete(user: User | null): boolean {
  if (!user) return false;

  if (user.role === "provider") {
    return !!user.name && !!user.phone && !!user.email;
  } else {
    return (
      !!user.name &&
      !!user.phone &&
      !!user.email &&
      !!user.bio &&
      Array.isArray(user.workCategories) &&
      user.workCategories.length > 0
    );
  }
}
