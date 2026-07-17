import { SERVICE_CONFIG } from "./config";
import { apiClient } from "./api-client";
import { ApiResponse, PaginatedResponse, Panchayat } from "./types";
import panchayatsMock from "../mocks/panchayats.mock.json";

// In-memory store for mocked mutations
let localPanchayats = panchayatsMock as unknown as Panchayat[];

export const panchayatsService = {
  async getPanchayats(params?: {
    search?: string;
    district?: string;
    taluka?: string;
    page?: number;
    limit?: number;
  }): Promise<PaginatedResponse<Panchayat>> {
    if (SERVICE_CONFIG.panchayats.list) {
      await new Promise((resolve) => setTimeout(resolve, 500));
      let filtered = [...localPanchayats];
      if (params?.search) {
        const query = params.search.toLowerCase();
        filtered = filtered.filter((p) => p.name.toLowerCase().includes(query));
      }
      if (params?.district) {
        filtered = filtered.filter((p) => p.district === params.district);
      }
      if (params?.taluka) {
        filtered = filtered.filter((p) => p.taluka === params.taluka);
      }

      const page = params?.page ?? 1;
      const limit = params?.limit ?? 10;
      const total = filtered.length;
      const pages = Math.ceil(total / limit);
      const startIndex = (page - 1) * limit;
      const paginatedData = filtered.slice(startIndex, startIndex + limit);

      return {
        success: true,
        message: "Panchayats fetched successfully",
        data: paginatedData,
        pagination: { total, page, limit, pages },
      };
    } else {
      const response = await apiClient.get<PaginatedResponse<Panchayat>>("/panchayats", {
        params,
      });
      return response.data;
    }
  },

  async getPanchayatDetail(id: number): Promise<ApiResponse<Panchayat>> {
    if (SERVICE_CONFIG.panchayats.list) {
      await new Promise((resolve) => setTimeout(resolve, 300));
      const panchayat = localPanchayats.find((p) => p.id === id);
      if (!panchayat) throw new Error("Panchayat not found");
      return {
        success: true,
        message: "Panchayat fetched successfully",
        data: panchayat,
      };
    } else {
      const response = await apiClient.get<ApiResponse<Panchayat>>(`/panchayats/${id}`);
      return response.data;
    }
  },

  async createPanchayat(data: Omit<Panchayat, "id">): Promise<ApiResponse<Panchayat>> {
    if (SERVICE_CONFIG.panchayats.mutate) {
      await new Promise((resolve) => setTimeout(resolve, 600));
      const newPanchayat: Panchayat = {
        ...data,
        id: localPanchayats.length + 1,
        citizen_count: 0,
        open_complaints: 0,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };
      localPanchayats.unshift(newPanchayat);
      return {
        success: true,
        message: "Panchayat created successfully",
        data: newPanchayat,
      };
    } else {
      const response = await apiClient.post<ApiResponse<Panchayat>>("/panchayats", data);
      return response.data;
    }
  },

  async updatePanchayat(id: number, data: Partial<Panchayat>): Promise<ApiResponse<Panchayat>> {
    if (SERVICE_CONFIG.panchayats.mutate) {
      await new Promise((resolve) => setTimeout(resolve, 500));
      const index = localPanchayats.findIndex((p) => p.id === id);
      if (index === -1) throw new Error("Panchayat not found");
      localPanchayats[index] = {
        ...localPanchayats[index],
        ...data,
        updated_at: new Date().toISOString(),
      };
      return {
        success: true,
        message: "Panchayat updated successfully",
        data: localPanchayats[index],
      };
    } else {
      const response = await apiClient.put<ApiResponse<Panchayat>>(`/panchayats/${id}`, data);
      return response.data;
    }
  },

  async deletePanchayat(id: number): Promise<ApiResponse<null>> {
    if (SERVICE_CONFIG.panchayats.mutate) {
      await new Promise((resolve) => setTimeout(resolve, 400));
      localPanchayats = localPanchayats.filter((p) => p.id !== id);
      return {
        success: true,
        message: "Panchayat deleted successfully",
        data: null,
      };
    } else {
      const response = await apiClient.delete<ApiResponse<null>>(`/panchayats/${id}`);
      return response.data;
    }
  },

  async assignAdmin(_panchayatId: number, _adminUserId: number): Promise<ApiResponse<null>> {
    // Simulated endpoint for GP Admin assignment
    await new Promise((resolve) => setTimeout(resolve, 600));
    return {
      success: true,
      message: "GP Admin assigned successfully",
      data: null,
    };
  },
};
