/**
 * User type for comment system
 */
export type CommentUser = {
  /** Unique user identifier */
  id: string;
  /** User's full name */
  fullName: string;
  /** Optional link to user profile page */
  userProfile?: string;
  /** Optional avatar URL */
  avatarUrl?: string;
};
