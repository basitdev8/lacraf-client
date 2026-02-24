export interface Customer {
  id: string;
  fullName: string;
  email: string;
  phone: string | null;
  emailVerified: boolean;
  isActive: boolean;
  createdAt: string;
}

export interface CustomerAuthResponse {
  customer: Customer;
  accessToken: string;
  refreshToken: string;
}

export interface CustomerAddress {
  id: string;
  fullName: string;
  phone: string;
  addressLine1: string;
  addressLine2: string | null;
  city: string;
  state: string;
  pincode: string;
  isDefault: boolean;
}

export interface OrderItem {
  id: string;
  productTitle: string;
  variantLabel: string | null;
  unitPrice: number;
  quantity: number;
  subtotal: number;
}

export type OrderStatus =
  | "PENDING_PAYMENT"
  | "CONFIRMED"
  | "CRAFTING"
  | "PROCESSING"
  | "SHIPPED"
  | "DELIVERED"
  | "CANCELLED"
  | "REFUNDED";

export interface Order {
  id: string;
  status: OrderStatus;
  subtotal: number;
  shippingFee: number;
  totalAmount: number;
  shippingAddress: CustomerAddress;
  notes: string | null;
  items: OrderItem[];
  razorpayOrderId: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface OrdersListResponse {
  orders: Order[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}
