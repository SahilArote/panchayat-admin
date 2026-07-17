export interface ApiResponse<T> {
  success: boolean;
  message: string;
  meta?: {
    timestamp: string;
    version: string;
  };
  data: T;
}

export interface Pagination {
  total: number;
  page: number;
  limit: number;
  pages: number;
}

export interface PaginatedResponse<T> {
  success: boolean;
  message: string;
  meta?: {
    timestamp: string;
    version: string;
  };
  data: T[];
  pagination: Pagination;
}

export type AdminRole = "super_admin" | "gp_admin";

export interface AdminUser {
  id: number;
  name: string;
  mobile: string;
  role: AdminRole;
  panchayat_id?: number | null; // null for super_admin
  panchayat_name?: string | null;
  created_at?: string;
}

export interface Panchayat {
  id: number;
  name: string;
  taluka?: string;
  district?: string;
  state?: string;
  population?: number;
  ward_count?: number;
  logo_url?: string;
  citizen_count?: number;
  open_complaints?: number;
  created_at?: string;
  updated_at?: string;
}

export interface Citizen {
  id: number;
  panchayat_id: number;
  name: string;
  mobile: string;
  gender: "male" | "female" | "other";
  age: number;
  address: string;
  role: "citizen" | "officer" | "admin";
  panchayat_name?: string;
  created_at?: string;
  updated_at?: string;
}

export type ComplaintCategory = "road" | "water" | "streetlight" | "garbage" | "drainage" | "tree" | "other";
export type ComplaintStatus = "open" | "in_progress" | "resolved" | "rejected";

export interface Complaint {
  id: number;
  citizen_id: number;
  panchayat_id: number;
  reference_no: string;
  category: ComplaintCategory;
  description: string;
  photo_url?: string | null;
  location?: string | null;
  latitude?: number | null;
  longitude?: number | null;
  status: ComplaintStatus;
  remark?: string | null;
  citizen_name?: string;
  citizen_mobile?: string;
  panchayat_name?: string;
  created_at: string;
  updated_at: string;
}

export type CertificateType = "birth" | "death" | "income" | "residence";
export type CertificateStatus = "pending" | "under_review" | "approved" | "rejected" | "ready";

export interface Certificate {
  id: number;
  citizen_id: number;
  panchayat_id: number;
  reference_no: string;
  type: CertificateType;
  applicant_name: string;
  details: Record<string, any>;
  status: CertificateStatus;
  remark?: string | null;
  pdf_url?: string | null;
  citizen_name?: string;
  panchayat_name?: string;
  created_at: string;
  updated_at: string;
}

export interface WaterBill {
  id: number;
  citizen_id: number;
  panchayat_id: number;
  month: number;
  year: number;
  amount: number;
  paid: boolean;
  order_id?: string | null;
  payment_ref?: string | null;
  payment_date?: string | null;
  receipt_no?: string | null;
  citizen_name?: string;
  panchayat_name?: string;
  created_at?: string;
}

export type NoticeType = "general" | "meeting" | "scheme" | "water" | "emergency";

export interface Notice {
  id: number;
  panchayat_id: number;
  title: string;
  body: string;
  type: NoticeType;
  created_by?: number | null;
  panchayat_name?: string;
  created_at: string;
  updated_at: string;
}

export type SchemeCategory = "agriculture" | "housing" | "health" | "education" | "women" | "employment" | "other";

export interface Scheme {
  id: number;
  name: string;
  description?: string | null;
  benefit?: string | null;
  eligibility?: string | null;
  category: SchemeCategory;
  last_date?: string | null;
  apply_url?: string | null;
  created_at?: string;
}

export interface DashboardStats {
  total_citizens: number;
  total_complaints: number;
  resolved_complaints: number;
  pending_complaints: number;
  total_notices: number;
  total_collected: number;
  total_due_bills: number;
  complaints_by_category: Record<string, number>;
  monthly_revenue: Array<{ month: string; amount: number }>;
}
