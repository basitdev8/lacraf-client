export interface Artisan {
  id: string;
  fullName: string;
  email: string;
  phone: string;
  gender: string | null;
  dob: string | null;
  village: string | null;
  district: string | null;
  state: string | null;
  category: "HANDICRAFT" | "HANDLOOM" | "EDIBLES";
  emailVerified: boolean;
  isApproved: boolean;
  isActive: boolean;
  createdAt: string;
}

export interface AuthResponse {
  artisan: Artisan;
  accessToken: string;
  refreshToken: string;
}

export interface Shop {
  id: string;
  artisanId: string;
  shopName: string;
  description: string;
  address: string;
  createdAt: string;
  updatedAt: string;
}

export interface KycDocument {
  type: string;
  uploaded: boolean;
  uploadedAt: string | null;
}

export interface KycStatus {
  status: "PENDING" | "UNDER_REVIEW" | "APPROVED" | "REJECTED";
  documents: KycDocument[];
  rejectionReason: string | null;
  submittedAt: string | null;
  reviewedAt: string | null;
}

export type OnboardingStep = "register" | "verify" | "shop" | "kyc" | "waiting";
