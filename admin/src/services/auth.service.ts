import { SERVICE_CONFIG } from "./config";
import { apiClient } from "./api-client";
import { ApiResponse, AdminUser } from "./types";
import authMock from "../mocks/auth.mock.json";

export interface LoginResponse {
  token: string;
  refreshToken: string;
  user: AdminUser;
}

export const authService = {
  async login(mobile: string, secret: string): Promise<ApiResponse<LoginResponse>> {
    if (SERVICE_CONFIG.auth) {
      // Simulate API lag
      await new Promise((resolve) => setTimeout(resolve, 800));

      if (mobile === "9999999999" && secret === "superpassword") {
        return {
          success: true,
          message: "Login successful",
          data: authMock.super_admin as unknown as LoginResponse,
        };
      } else if (mobile === "8888888888" && secret === "gppassword") {
        return {
          success: true,
          message: "Login successful",
          data: authMock.gp_admin as unknown as LoginResponse,
        };
      } else {
        throw new Error("Invalid mobile number or password");
      }
    } else {
      const response = await apiClient.post<ApiResponse<LoginResponse>>("/auth/login-admin", {
        mobile,
        secret,
      });
      return response.data;
    }
  },

  async getProfile(): Promise<ApiResponse<AdminUser>> {
    if (SERVICE_CONFIG.auth) {
      const authUser = localStorage.getItem("authUser");
      if (authUser) {
        try {
          return {
            success: true,
            message: "Profile fetched successfully",
            data: JSON.parse(authUser),
          };
        } catch (e) {
          console.error(e);
        }
      }
      throw new Error("Not authenticated");
    } else {
      const response = await apiClient.get<ApiResponse<AdminUser>>("/auth/profile");
      return response.data;
    }
  },
};
