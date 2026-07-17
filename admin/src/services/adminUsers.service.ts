import { ApiResponse, PaginatedResponse, AdminUser } from "./types";
import adminUsersMock from "../mocks/adminUsers.mock.json";

let localAdminUsers = adminUsersMock as unknown as AdminUser[];

export const adminUsersService = {
  async getAdminUsers(params?: {
    search?: string;
    page?: number;
    limit?: number;
  }): Promise<PaginatedResponse<AdminUser>> {
    await new Promise((resolve) => setTimeout(resolve, 500));
    let filtered = [...localAdminUsers];

    if (params?.search) {
      const q = params.search.toLowerCase();
      filtered = filtered.filter(
        (a) =>
          a.name.toLowerCase().includes(q) ||
          a.mobile.includes(q) ||
          (a.panchayat_name && a.panchayat_name.toLowerCase().includes(q))
      );
    }

    const page = params?.page ?? 1;
    const limit = params?.limit ?? 10;
    const total = filtered.length;
    const pages = Math.ceil(total / limit);
    const startIndex = (page - 1) * limit;
    const paginatedData = filtered.slice(startIndex, startIndex + limit);

    return {
      success: true,
      message: "Admin users fetched successfully (Mock)",
      data: paginatedData,
      pagination: { total, page, limit, pages },
    };
  },

  async createAdminUser(data: Omit<AdminUser, "id">): Promise<ApiResponse<AdminUser>> {
    await new Promise((resolve) => setTimeout(resolve, 600));
    const newAdmin: AdminUser = {
      ...data,
      id: localAdminUsers.length + 800,
      created_at: new Date().toISOString(),
    };
    localAdminUsers.unshift(newAdmin);
    return {
      success: true,
      message: "GP Admin account created successfully (Mock)",
      data: newAdmin,
    };
  },

  async deleteAdminUser(id: number): Promise<ApiResponse<null>> {
    await new Promise((resolve) => setTimeout(resolve, 400));
    localAdminUsers = localAdminUsers.filter((a) => a.id !== id);
    return {
      success: true,
      message: "Admin account deleted successfully (Mock)",
      data: null,
    };
  },
};
