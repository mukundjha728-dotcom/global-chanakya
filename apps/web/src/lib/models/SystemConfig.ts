import mongoose, { Schema, Document } from "mongoose";

export interface ILink {
  label: string;
  href: string;
  isExternal?: boolean;
}

export interface ISystemConfig extends Document {
  version: number;
  isActive: boolean;
  ragCorpusVersion: number;
  liveCorpusVersion: number;
  
  navigation: {
    mainLinks: ILink[];
    dropdowns: {
      label: string;
      links: ILink[];
    }[];
    order: number;
    visibility: boolean;
  };

  footer: {
    columns: {
      title: string;
      links: ILink[];
    }[];
    copyrightText: string;
  };

  homepage: {
    sections: {
      sectionType: string;
      order: number;
      isActive: boolean;
      assignedContentIds: mongoose.Types.ObjectId[];
      fallbackLogic: string;
    }[];
  };

  globalSeo: {
    metaTitleFallback: string;
    metaDescriptionFallback: string;
    ogImageFallback?: string;
    robotsConfig: string;
    canonicalDefaults: string;
    schemaOverrides: string;
    llmsTxtSections: string;
  };

  growth: {
    announcementBar: {
      isActive: boolean;
      message: string;
      link?: string;
      linkText?: string;
      bgColor?: string;
    };
    newsletterConfig: string;
    trendingRules: string;
  };

  createdAt: Date;
  updatedAt: Date;
}

const LinkSchema = new Schema<ILink>({
  label: { type: String, required: true },
  href: { type: String, required: true },
  isExternal: { type: Boolean, default: false },
}, { _id: false });

const SystemConfigSchema = new Schema<ISystemConfig>({
  version: { type: Number, default: 1 },
  isActive: { type: Boolean, default: false },
  ragCorpusVersion: { type: Number, default: 1 },
  liveCorpusVersion: { type: Number, default: 1 },

  navigation: {
    mainLinks: [LinkSchema],
    dropdowns: [{
      label: { type: String, required: true },
      links: [LinkSchema],
    }],
    order: { type: Number, default: 0 },
    visibility: { type: Boolean, default: true },
  },

  footer: {
    columns: [{
      title: { type: String, required: true },
      links: [LinkSchema],
    }],
    copyrightText: { type: String, default: "© Global Chanakya Intelligence" },
  },

  homepage: {
    sections: [{
      sectionType: { type: String },
      order: { type: Number },
      isActive: { type: Boolean, default: true },
      assignedContentIds: [{ type: Schema.Types.ObjectId }],
      fallbackLogic: { type: String }
    }],
  },

  globalSeo: {
    metaTitleFallback: { type: String },
    metaDescriptionFallback: { type: String },
    ogImageFallback: { type: String },
    robotsConfig: { type: String },
    canonicalDefaults: { type: String },
    schemaOverrides: { type: String },
    llmsTxtSections: { type: String },
  },

  growth: {
    announcementBar: {
      isActive: { type: Boolean, default: false },
      message: { type: String },
      link: { type: String },
      linkText: { type: String },
      bgColor: { type: String },
    },
    newsletterConfig: { type: String },
    trendingRules: { type: String },
  },
}, { timestamps: true });

export const SystemConfig = mongoose.models.SystemConfig || mongoose.model<ISystemConfig>("SystemConfig", SystemConfigSchema);
