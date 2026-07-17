export type AdminRole = "super_admin" | "gp_admin";

export interface User {
  id: number;
  name: string;
  mobile: string;
  role: AdminRole;
  panchayat_id?: number | null;
  panchayat_name?: string | null;
  avatarUrl?: string;
}
