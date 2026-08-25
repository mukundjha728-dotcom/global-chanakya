// Platform-wide constants — Global Chanakya
// PDA Sections 2, 3, 10

export const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL || "https://www.globalchanakya.in";

export const SITE_NAME = "Global Chanakya Intelligence";

export const SITE_DESCRIPTION = "Access unvarnished geopolitical intelligence, defence analysis, and strategic briefs on global power shifts. Read expert insights at Global Chanakya today.";

// Subscription and Early Access logic has been deprecated (Free Open Intelligence Tier)

// User roles
export const USER_ROLES = {
  GUEST: "guest",
  FREE: "free",
  ADMIN: "admin",
} as const;

// Blog categories
export const BLOG_CATEGORIES = [
  "Geopolitics",
  "Indo-Pacific",
  "South Asia",
  "Middle East",
  "Defence",
  "China",
  "Russia",
  "Europe",
  "Economy & Trade",
] as const;

// Blog visibility
export const BLOG_VISIBILITY = {
  PUBLIC: "public",
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
} as const;

// Navigation links
export const NAV_LINKS = [
  { label: "Home", href: "/" },
  { label: "Reports", href: "/blogs" },
  { label: "About", href: "/about" },
] as const;

// Admin sidebar links
export const ADMIN_NAV_LINKS = [
  { label: "Dashboard", href: "/gc-control-9x7k", icon: "LayoutDashboard" },
  { label: "Blogs", href: "/gc-control-9x7k/blogs", icon: "FileText" },
  { label: "Users", href: "/gc-control-9x7k/users", icon: "Users" },
  { label: "Analytics", href: "/gc-control-9x7k/analytics", icon: "BarChart3" },
  { label: "Security", href: "/gc-control-9x7k/security", icon: "ShieldAlert" },
  { label: "Media", href: "/gc-control-9x7k/media", icon: "Image" },
  { label: "Settings", href: "/gc-control-9x7k/settings", icon: "Settings" },
] as const;
