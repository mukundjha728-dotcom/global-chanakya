// Platform-wide constants — Global Chanakya
// PDA Sections 2, 3, 10

export const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL || "https://global-chanakya-web.vercel.app";

export const SITE_NAME = "Global Chanakya";

export const SITE_DESCRIPTION =
  "Enterprise-grade geopolitical intelligence and strategic media platform with 24-hour premium early access.";

// Subscription pricing
export const SUBSCRIPTION_PRICE_INR = 19; // ₹19
export const SUBSCRIPTION_PRICE_PAISE = 1900; // Razorpay expects paise
export const SUBSCRIPTION_DURATION_DAYS = 7;
export const SUBSCRIPTION_DURATION_MS =
  SUBSCRIPTION_DURATION_DAYS * 24 * 60 * 60 * 1000;

// Early access window
export const EARLY_ACCESS_HOURS = 24;
export const EARLY_ACCESS_MS = EARLY_ACCESS_HOURS * 60 * 60 * 1000;

// User roles
export const USER_ROLES = {
  GUEST: "guest",
  FREE: "free",
  PREMIUM: "premium",
  ADMIN: "admin",
} as const;

// Blog categories
export const BLOG_CATEGORIES = [
  "Geopolitics",
  "Strategic Affairs",
  "Indo-Pacific",
  "South Asia",
  "Middle East",
  "Europe",
  "Americas",
  "China",
  "Russia",
  "Technology & Security",
  "Defence",
  "Economy & Trade",
  "Intelligence Brief",
] as const;

// Blog visibility
export const BLOG_VISIBILITY = {
  PUBLIC: "public",
  PREMIUM: "premium",
  PRIVATE: "private",
} as const;

// Blog status
export const BLOG_STATUS = {
  DRAFT: "draft",
  PUBLISHED: "published",
  ARCHIVED: "archived",
  SCHEDULED: "scheduled",
} as const;

// Auth providers
export const AUTH_PROVIDERS = {
  CREDENTIALS: "credentials",
  GOOGLE: "google",
  GITHUB: "github",
} as const;

// Razorpay
export const RAZORPAY_CURRENCY = "INR";
export const RAZORPAY_PLAN_NAME = "7-Day Premium Early Access";

// API routes
export const API_ROUTES = {
  AUTH: "/api/auth",
  BLOGS: "/api/blogs",
  COMMENTS: "/api/comments",
  SUBSCRIPTIONS: "/api/subscriptions",
  USERS: "/api/users",
  ADMIN: "/api/admin",
  ANALYTICS: "/api/analytics",
  NOTIFICATIONS: "/api/notifications",
  RAZORPAY_CREATE_ORDER: "/api/razorpay/create-order",
  RAZORPAY_VERIFY: "/api/razorpay/verify",
} as const;

// Navigation links
export const NAV_LINKS = [
  { label: "Latest Intel", href: "/blogs" },
  { label: "Categories", href: "/categories" },
  { label: "Premium", href: "/subscribe", premium: true },
  { label: "About", href: "/about" },
] as const;

// Admin sidebar links
export const ADMIN_NAV_LINKS = [
  { label: "Dashboard", href: "/admin", icon: "LayoutDashboard" },
  { label: "Blogs", href: "/admin/blogs", icon: "FileText" },
  { label: "Users", href: "/admin/users", icon: "Users" },
  { label: "Analytics", href: "/admin/analytics", icon: "BarChart3" },
  { label: "Security", href: "/admin/security", icon: "ShieldAlert" },
  { label: "Media", href: "/admin/media", icon: "Image" },
  { label: "Settings", href: "/admin/settings", icon: "Settings" },
] as const;
