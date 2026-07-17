import { ApiResponse, DashboardStats } from "./types";
import dashboardMock from "../mocks/dashboard.mock.json";

export const dashboardService = {
  async getStats(role: "super_admin" | "gp_admin", _panchayatId?: number): Promise<ApiResponse<DashboardStats>> {
    await new Promise((resolve) => setTimeout(resolve, 800));

    // If role is super_admin, return the aggregated statistics
    if (role === "super_admin") {
      return {
        success: true,
        message: "Super admin dashboard stats fetched successfully (Mock)",
        data: dashboardMock.super_admin as any,
      };
    } else {
      // If role is gp_admin, return the single-panchayat statistics
      return {
        success: true,
        message: "GP admin dashboard stats fetched successfully (Mock)",
        data: dashboardMock.gp_admin as any,
      };
    }
  },
};
export default dashboardService;
