export type FieldType = 
  | "text" | "textarea" | "richtext" 
  | "number" | "boolean" | "date" 
  | "select" | "multiselect" | "async-relation" 
  | "media-picker" | "media-gallery" 
  | "citations" | "string-array";

import { BLOG_CATEGORIES } from "@/constants";

export interface FormField {
  name: string;
  label: string;
  type: FieldType;
  required?: boolean;
  options?: { label: string; value: string }[];
  relationModel?: string; // For async-relation
  description?: string;
  placeholder?: string;
}

export interface FormTab {
  id: string;
  label: string;
  fields: FormField[];
}

export interface EntitySchema {
  id: string;
  name: string;
  apiPath: string; // e.g. "/api/admin/blogs"
  tabs: FormTab[];
}

// Reusable Shared Tabs
const SEO_TAB: FormTab = {
  id: "seo",
  label: "SEO & Discovery",
  fields: [
    { name: "seo.title", label: "Meta Title", type: "text" },
    { name: "seo.description", label: "Meta Description", type: "textarea" },
    { name: "seo.keywords", label: "Keywords", type: "string-array" },
    { name: "seo.canonicalUrl", label: "Canonical URL", type: "text" },
    { name: "seo.schemaMarkup", label: "Custom Schema Markup", type: "textarea" },
    { name: "aiSummary", label: "AI Summary (llms.txt)", type: "textarea" },
  ]
};

const SCHEDULING_TAB: FormTab = {
  id: "scheduling",
  label: "Scheduling & Publish",
  fields: [
    { name: "status", label: "Status", type: "select", options: [
      { label: "Draft", value: "draft" },
      { label: "Published", value: "published" },
      { label: "Scheduled", value: "scheduled" },
      { label: "Archived", value: "archived" }
    ]},
    { name: "publishAt", label: "Publish Date", type: "date" },
    { name: "unpublishAt", label: "Unpublish Date", type: "date" },
    { name: "isBreaking", label: "Is Breaking?", type: "boolean" },
    { name: "breakingUntil", label: "Breaking Until", type: "date" },
    { name: "isFeatured", label: "Is Featured?", type: "boolean" },
    { name: "featuredUntil", label: "Featured Until", type: "date" },
  ]
};

const MEDIA_TAB: FormTab = {
  id: "media",
  label: "Media",
  fields: [
    { name: "featuredImage", label: "Featured Image", type: "media-picker" },
    { name: "ogImage", label: "OG Image (Socials)", type: "media-picker" },
  ]
};

const CITATIONS_TAB: FormTab = {
  id: "citations",
  label: "Citations",
  fields: [
    { name: "citations", label: "References", type: "citations" }
  ]
};

const VERSIONING_TAB: FormTab = {
  id: "versioning",
  label: "Revision History",
  fields: [
    { name: "versionHistory", label: "History", type: "text" } // type string-array or custom, GenericEditor handles field.name === "versionHistory"
  ]
};

export const SCHEMAS: Record<string, EntitySchema> = {
  blogs: {
    id: "blogs",
    name: "Blog / Report",
    apiPath: "/api/admin/blogs",
    tabs: [
      {
        id: "main",
        label: "Main Content",
        fields: [
          { name: "title", label: "Title", type: "text", required: true },
          { name: "slug", label: "Slug", type: "text", required: true },
          { name: "excerpt", label: "Excerpt / Summary", type: "textarea", required: true },
          { name: "content", label: "Content", type: "richtext", required: true },
          { name: "category", label: "Category", type: "select", options: BLOG_CATEGORIES.map(c => ({ label: c, value: c })) },
          { name: "reportType", label: "Report Type", type: "select", options: [
            { label: "Analysis", value: "Analysis" },
            { label: "Briefing", value: "Briefing" },
            { label: "Op-Ed", value: "Op-Ed" },
            { label: "Intelligence", value: "Intelligence" },
            { label: "Report", value: "Report" },
          ]},
          { name: "visibility", label: "Visibility", type: "select", options: [
            { label: "Public", value: "public" },
            { label: "Premium", value: "premium" },
            { label: "Private", value: "private" },
          ]},
          { name: "tags", label: "Tags", type: "string-array" },
          { name: "isTrending", label: "Mark as Trending", type: "boolean" },
          { name: "commentsEnabled", label: "Enable Comments", type: "boolean" },
        ]
      },
      {
        id: "relations",
        label: "Relations",
        fields: [
          { name: "entityRelations", label: "Linked Entities", type: "async-relation", relationModel: "any" }
        ]
      },
      MEDIA_TAB,
      CITATIONS_TAB,
      SEO_TAB,
      SCHEDULING_TAB,
      VERSIONING_TAB
    ]
  },

  conflicts: {
    id: "conflicts",
    name: "Conflict",
    apiPath: "/api/admin/conflicts",
    tabs: [
      {
        id: "main",
        label: "Main Info",
        fields: [
          { name: "title", label: "Conflict Name", type: "text", required: true },
          { name: "slug", label: "Slug", type: "text", required: true },
          { name: "summary", label: "Summary", type: "textarea", required: true },
          { name: "type", label: "Conflict Type", type: "select", options: [
            { label: "Kinetic", value: "Kinetic" },
            { label: "Proxy", value: "Proxy" },
            { label: "Economic", value: "Economic" },
            { label: "Cyber", value: "Cyber" }
          ]},
          { name: "threatLevel", label: "Threat Level", type: "select", options: [
            { label: "Critical", value: "Critical" },
            { label: "High", value: "High" },
            { label: "Elevated", value: "Elevated" },
            { label: "Monitoring", value: "Monitoring" }
          ]},
        ]
      },
      {
        id: "parties",
        label: "Involved Parties",
        fields: [
          { name: "involvedParties", label: "Parties", type: "async-relation", relationModel: "Country" }
        ]
      },
      MEDIA_TAB,
      SEO_TAB,
      SCHEDULING_TAB,
      VERSIONING_TAB
    ]
  },
  regions: {
    id: "regions",
    name: "Region",
    apiPath: "/api/admin/regions",
    tabs: [
      {
        id: "main",
        label: "Main",
        fields: [
          { name: "title", label: "Title", type: "text", required: true },
          { name: "slug", label: "Slug", type: "text", required: true },
          { name: "summary", label: "Summary", type: "textarea" },
          { name: "theatre", label: "Theatre", type: "text" },
          { name: "strategicWeight", label: "Strategic Weight", type: "select", options: [
            { label: "Critical", value: "Critical" },
            { label: "High", value: "High" },
            { label: "Medium", value: "Medium" },
            { label: "Low", value: "Low" }
          ]},
          { name: "trend", label: "Trend", type: "select", options: [
            { label: "Up", value: "Up" },
            { label: "Down", value: "Down" },
            { label: "Stable", value: "Stable" }
          ]},
        ]
      },
      MEDIA_TAB,
      SEO_TAB,
      SCHEDULING_TAB
    ]
  },
  countries: {
    id: "countries",
    name: "Country",
    apiPath: "/api/admin/countries",
    tabs: [
      {
        id: "main",
        label: "Main Info",
        fields: [
          { name: "name", label: "Country Name", type: "text", required: true },
          { name: "slug", label: "Slug", type: "text", required: true },
          { name: "isoCode", label: "ISO Code (e.g. IN, US)", type: "text", required: true },
          { name: "capital", label: "Capital City", type: "text", required: true },
          { name: "region", label: "Region", type: "text", required: true },
          { name: "overview", label: "Overview", type: "textarea", required: true },
          { name: "population", label: "Population", type: "number" },
          { name: "gdp", label: "GDP", type: "text" },
          { name: "intelligenceScore", label: "Intelligence Score (0-100)", type: "number" },
          { name: "geopoliticalStatus", label: "Geopolitical Status", type: "select", options: [
            { label: "Superpower", value: "Superpower" },
            { label: "Regional Power", value: "Regional Power" },
            { label: "Emerging", value: "Emerging" },
            { label: "Neutral", value: "Neutral" },
            { label: "Conflict Zone", value: "Conflict Zone" },
          ]},
          { name: "alliances", label: "Alliance Memberships", type: "string-array" },
        ]
      },
      {
        id: "relations",
        label: "Relations",
        fields: [
          { name: "relatedConflicts", label: "Related Conflicts", type: "async-relation", relationModel: "Conflict" },
          { name: "relatedLeaders", label: "Related Leaders", type: "async-relation", relationModel: "Leader" },
          { name: "relatedAlliances", label: "Related Alliances", type: "async-relation", relationModel: "Alliance" },
        ]
      },
      {
        id: "media",
        label: "Media",
        fields: [
          { name: "flagUrl", label: "Flag Image URL", type: "text" },
          { name: "featuredImage", label: "Featured Image", type: "media-picker" },
          { name: "ogImage", label: "OG Image (Socials)", type: "media-picker" },
        ]
      },
      SEO_TAB,
      SCHEDULING_TAB,
      VERSIONING_TAB,
    ]
  },
  leaders: {
    id: "leaders",
    name: "Leader",
    apiPath: "/api/admin/leaders",
    tabs: [
      {
        id: "main",
        label: "Main Info",
        fields: [
          { name: "name", label: "Full Name", type: "text", required: true },
          { name: "slug", label: "Slug", type: "text", required: true },
          { name: "title", label: "Title / Role", type: "text", required: true },
          { name: "party", label: "Party / Organisation", type: "text" },
          { name: "termStart", label: "Term Start Date", type: "date", required: true },
          { name: "bio", label: "Biography", type: "textarea", required: true },
          { name: "foreignPolicyStance", label: "Foreign Policy Stance", type: "textarea", required: true },
          { name: "approvalRating", label: "Approval Rating (%)", type: "number" },
          { name: "tags", label: "Tags", type: "string-array" },
        ]
      },
      {
        id: "relations",
        label: "Relations",
        fields: [
          { name: "countryId", label: "Country", type: "async-relation", relationModel: "Country" },
        ]
      },
      {
        id: "media",
        label: "Media",
        fields: [
          { name: "imageUrl", label: "Portrait Image URL", type: "text" },
          { name: "featuredImage", label: "Featured Image", type: "media-picker" },
          { name: "ogImage", label: "OG Image (Socials)", type: "media-picker" },
        ]
      },
      SEO_TAB,
      SCHEDULING_TAB,
      VERSIONING_TAB,
    ]
  },
  alliances: {
    id: "alliances",
    name: "Alliance",
    apiPath: "/api/admin/alliances",
    tabs: [
      {
        id: "main",
        label: "Main Info",
        fields: [
          { name: "name", label: "Alliance Name", type: "text", required: true },
          { name: "slug", label: "Slug", type: "text", required: true },
          { name: "acronym", label: "Acronym (e.g. NATO)", type: "text" },
          { name: "description", label: "Description", type: "textarea", required: true },
          { name: "founded", label: "Founded Date", type: "date", required: true },
          { name: "headquarters", label: "Headquarters", type: "text" },
        ]
      },
      {
        id: "members",
        label: "Member Countries",
        fields: [
          { name: "memberCountries", label: "Member Countries", type: "async-relation", relationModel: "Country" },
        ]
      },
      MEDIA_TAB,
      SEO_TAB,
      SCHEDULING_TAB,
      VERSIONING_TAB,
    ]
  },
  timelines: {
    id: "timelines",
    name: "Timeline Event",
    apiPath: "/api/admin/timelines",
    tabs: [
      {
        id: "main",
        label: "Event Details",
        fields: [
          { name: "title", label: "Event Title", type: "text", required: true },
          { name: "description", label: "Description", type: "textarea", required: true },
          { name: "eventDate", label: "Event Date", type: "date", required: true },
          { name: "entityType", label: "Entity Type", type: "select", required: true, options: [
            { label: "Country", value: "country" },
            { label: "Leader", value: "leader" },
            { label: "Conflict", value: "conflict" },
          ]},
          { name: "severity", label: "Severity", type: "select", options: [
            { label: "Critical", value: "critical" },
            { label: "Major", value: "major" },
            { label: "Normal", value: "normal" },
            { label: "Minor", value: "minor" },
          ]},
          { name: "tags", label: "Tags", type: "string-array" },
        ]
      },
      {
        id: "entity",
        label: "Linked Entity",
        fields: [
          { name: "entityId", label: "Linked Entity", type: "async-relation", relationModel: "any",
            description: "Select the Country, Leader, or Conflict this event belongs to" },
        ]
      },
      SCHEDULING_TAB,
      VERSIONING_TAB,
    ]
  },
};
