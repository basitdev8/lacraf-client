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

// ─── Categories ────────────────────────────────────────────────────────────────

export interface AttributeTemplate {
  key: string;
  label: string;
  type: "TEXT" | "NUMBER" | "BOOLEAN" | "LONG_TEXT";
  isRequired: boolean;
  unit?: string;
}

export interface Subcategory {
  id: string;
  name: string;
  slug: string;
  attributeTemplates?: AttributeTemplate[];
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  subcategories: Subcategory[];
  _count?: { products: number };
}

// ─── Products ──────────────────────────────────────────────────────────────────

export interface ProductAttribute {
  key: string;
  label: string;
  type: "TEXT" | "NUMBER" | "BOOLEAN" | "LONG_TEXT";
  value: string;
}

export interface ProductImage {
  id: string;
  publicId: string;
  secureUrl: string;
  sortOrder: number;
}

export interface ProductVariant {
  id: string;
  label: string;
  price: number;
  stock: number;
  isDefault: boolean;
  attributes: ProductAttribute[];
  images: ProductImage[];
}

export type ProductStatus = "DRAFT" | "UNDER_REVIEW" | "APPROVED" | "REJECTED";

export interface Product {
  id: string;
  title: string;
  description: string;
  status: ProductStatus;
  rejectionReason: string | null;
  categoryId: string;
  subcategoryId: string;
  category?: { id: string; name: string };
  subcategory?: { id: string; name: string };
  attributes: ProductAttribute[];
  variants: ProductVariant[];
  images: ProductImage[];
  hasGiCertificate?: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface ProductsListResponse {
  products: Product[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}
