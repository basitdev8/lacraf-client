export interface AdminUser {
  id: string;
  name: string;
  email: string;
}

export interface DashboardStats {
  totalArtisans: number;
  pendingReview: number;
  approved: number;
  rejected: number;
  blocked: number;
  newThisWeek: number;
}

export type KycStatusValue = "PENDING" | "UNDER_REVIEW" | "APPROVED" | "REJECTED";
export type ArtisanCategory = "HANDICRAFT" | "HANDLOOM" | "EDIBLES";
export type ArtisanFilter =
  | "all"
  | "pending-review"
  | "under-review"
  | "approved"
  | "rejected"
  | "blocked";

export interface ArtisanListItem {
  id: string;
  fullName: string;
  email: string;
  phone: string;
  category: ArtisanCategory;
  emailVerified: boolean;
  isApproved: boolean;
  isActive: boolean;
  createdAt: string;
  shop: { shopName: string } | null;
  kyc: { status: KycStatusValue; submittedAt: string | null } | null;
}

export interface ArtisansListResponse {
  artisans: ArtisanListItem[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface ArtisanDetail {
  id: string;
  fullName: string;
  email: string;
  phone: string;
  gender: string | null;
  category: ArtisanCategory;
  village: string | null;
  district: string | null;
  state: string | null;
  emailVerified: boolean;
  isApproved: boolean;
  isActive: boolean;
  approvalNote: string | null;
  shop: {
    id: string;
    shopName: string;
    description: string;
    address: string;
  } | null;
  kyc: {
    id: string;
    status: KycStatusValue;
    rejectionReason: string | null;
    submittedAt: string | null;
    reviewedAt: string | null;
    documents: Record<string, string>;
  } | null;
}

export interface ReviewResponse {
  message: string;
  artisanId: string;
  decision: "APPROVED" | "REJECTED";
  kycStatus: KycStatusValue;
}
