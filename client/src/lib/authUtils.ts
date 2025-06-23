export function isUnauthorizedError(error: Error): boolean {
  return error.message.includes("401") || error.message.includes("Unauthorized");
}

export const GUEST_LIMITATIONS = {
  maxViewableItems: 10,
  maxSearchResults: 5,
  canCreateContent: false,
  canJoinTournaments: false,
  canJoinClans: false,
  canSendMessages: false,
  canLike: false,
  canComment: false,
  canFollow: false,
  canAccessProfile: false,
  canAccessSettings: false,
  canAccessAnalytics: false,
} as const;

export function checkGuestLimitation(feature: keyof typeof GUEST_LIMITATIONS, isAuthenticated: boolean): boolean {
  if (isAuthenticated) return true;
  return GUEST_LIMITATIONS[feature];
}

export function getGuestLimitationMessage(feature: string): string {
  return `Sign in to ${feature}. Join GamingX to unlock all features!`;
}