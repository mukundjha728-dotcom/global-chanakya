// Global type definitions for Global Chanakya platform
// PDA Section 5 — aligns with MongoDB schema

export type UserRole = "guest" | "free" | "premium" | "admin";
export type AuthProvider = "credentials" | "google" | "github";
export type BlogStatus = "draft" | "published" | "archived" | "scheduled";
export type BlogVisibility = "public" | "premium" | "private";
export type SubscriptionStatus = "active" | "expired" | "failed" | "refunded";
export type CommentStatus = "approved" | "pending" | "spam";
export type AuditSeverity = "info" | "warning" | "critical";

export interface BlogAnalytics {
  views: number;
  likes: number;
  bookmarks: number;
  readTime: number;
  ctr: number;
}

export interface BlogSEO {
  title: string;
  description: string;
  keywords: string[];
  canonicalUrl?: string;
  schemaMarkup?: string;
}

export interface UserPreferences {
  notifications: {
    email: boolean;
    premiumExpiry: boolean;
    newArticles: boolean;
    commentReplies: boolean;
  };
  darkMode: boolean;
  language: string;
}

export interface UserSubscription {
  plan: string;
  paymentId?: string;
  expiresAt: Date;
  status: "active" | "expired";
}

// API response shape
export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

// Blog card shape for frontend rendering
export interface BlogCardProps {
  _id: string;
  title: string;
  slug: string;
  excerpt: string;
  featuredImage?: string;
  category: string;
  tags: string[];
  visibility: BlogVisibility;
  publishAt: string;
  earlyAccessUntil?: string;
  status: BlogStatus;
  analytics: BlogAnalytics;
  author: {
    _id: string;
    name: string;
    avatar?: string;
  };
  isTrending: boolean;
  readingTime?: number;
  createdAt: string;
}

// Extended session user type
export interface SessionUser {
  id: string;
  name?: string | null;
  email?: string | null;
  image?: string | null;
  role: UserRole;
}

// Access check result
export interface ContentAccessResult {
  canAccess: boolean;
  reason?: "premium_required" | "login_required" | "not_found" | "ok";
  unlocksAt?: Date;
}
