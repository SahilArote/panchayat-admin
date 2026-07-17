// TEMPORARILY MOCKED — real endpoint requires JWT auth; switch USE_MOCK back to false once a real admin login endpoint exists on /server.

import { SERVICE_CONFIG } from "./config";
import { apiClient } from "./api-client";
import { ApiResponse, PaginatedResponse, WaterBill } from "./types";
import waterBillsMock from "../mocks/waterBills.mock.json";

let mockWaterBills: WaterBill[] = waterBillsMock as unknown as WaterBill[];

export const waterBillsService = {
  async getWaterBills(
    panchayatId: number,
    params?: {
      paid?: boolean;
      page?: number;
      limit?: number;
    }
  ): Promise<PaginatedResponse<WaterBill>> {
    if (SERVICE_CONFIG.waterBills) {
      await new Promise((resolve) => setTimeout(resolve, 500));
      let filtered = [...mockWaterBills];
      if (panchayatId > 0) {
        filtered = filtered.filter((b) => b.panchayat_id === panchayatId);
      }
      if (params?.paid !== undefined) {
        filtered = filtered.filter((b) => b.paid === params.paid);
      }

      const page = params?.page ?? 1;
      const limit = params?.limit ?? 10;
      const total = filtered.length;
      const pages = Math.ceil(total / limit);
      const startIndex = (page - 1) * limit;
      const paginatedData = filtered.slice(startIndex, startIndex + limit);

      return {
        success: true,
        message: "Water bills fetched successfully",
        data: paginatedData,
        pagination: { total, page, limit, pages },
      };
    } else {
      // Since there's no backend route for admin listing of all citizen bills,
      // we'll try to query or fallback gracefully.
      try {
        const response = await apiClient.get<PaginatedResponse<WaterBill>>(
          `/water-bills/panchayat/${panchayatId}`,
          { params }
        );
        return response.data;
      } catch (err) {
        console.warn("Backend /water-bills/panchayat/:id not implemented yet. Falling back to local mock data.");
        let filtered = [...mockWaterBills];
        if (panchayatId > 0) {
          filtered = filtered.filter((b) => b.panchayat_id === panchayatId);
        }
        if (params?.paid !== undefined) {
          filtered = filtered.filter((b) => b.paid === params.paid);
        }
        return {
          success: true,
          message: "Water bills fetched (mock fallback)",
          data: filtered,
          pagination: { total: filtered.length, page: 1, limit: 10, pages: 1 },
        };
      }
    }
  },

  async generateBills(
    panchayatId: number,
    month: number,
    year: number,
    amount: number
  ): Promise<ApiResponse<{ generated_count: number }>> {
    if (SERVICE_CONFIG.waterBills) {
      await new Promise((resolve) => setTimeout(resolve, 1000));
      // Simulate generating 1420 bills for Nerle Gram Panchayat citizens
      return {
        success: true,
        message: `Successfully generated ${142} water bills of ${amount} INR for period ${month}/${year}`,
        data: {
          generated_count: 142,
        },
      };
    } else {
      const response = await apiClient.post<ApiResponse<{ generated_count: number }>>(
        "/water-bills/generate",
        { panchayat_id: panchayatId, month, year, amount }
      );
      return response.data;
    }
  },
};
