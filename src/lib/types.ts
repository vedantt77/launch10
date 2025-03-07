export interface Startup {
  id: string;
  name: string;
  logo: string; // For the details page logo
  cardImage: string; // For the listing card
  shortDescription: string;
  mrr: number;
  category: string;
  foundedDate: string;
  location: string;
  website: string;
  longDescription: string;
  isVerified?: boolean;
  metrics: {
    mrr: number;
    launchedIn: string;
    founders: string;
    funding: string;
    monetisation: string;
    commitment: string;
  };
  socialLinks: {
    twitter?: string;
    linkedin?: string;
    github?: string;
    bluesky?: string;
  };
  submissionDetails?: {
    submittedAt: Date;
    scheduledLaunchDate: Date;
    status: 'pending' | 'approved' | 'rejected' | 'launched';
  };
}

export interface SubmittedStartup {
  id: string;
  name: string;
  url: string;
  socialHandle: string;
  description: string;
  logoUrl: string;
  submittedAt: Date;
  scheduledLaunchDate?: Date;
  status: string;
  listingType?: string;
  doFollowBacklink?: boolean;
}
