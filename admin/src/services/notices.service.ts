import { SERVICE_CONFIG } from "./config";
import { apiClient } from "./api-client";
import { ApiResponse, PaginatedResponse, Notice, NoticeType } from "./types";

let mockNotices: Notice[] = [
  {
    id: 401,
    panchayat_id: 1,
    title: "Pre-Monsoon Health Advisory",
    body: "Citizens are advised to boil drinking water and clean their surroundings to prevent mosquito breeding. Bleaching powder is available at the GP office.",
    type: "emergency",
    created_by: 888,
    panchayat_name: "Nerle Gram Panchayat",
    created_at: "2026-07-16T10:00:00Z",
    updated_at: "2026-07-16T10:00:00Z",
  },
  {
    id: 402,
    panchayat_id: 1,
    title: "Gram Sabha Meeting Scheduled",
    body: "A general body meeting is scheduled on August 20th, 2026 at the Gram Panchayat hall to discuss the annual development budget.",
    type: "meeting",
    created_by: 888,
    panchayat_name: "Nerle Gram Panchayat",
    created_at: "2026-07-15T09:00:00Z",
    updated_at: "2026-07-15T09:00:00Z",
  },
  {
    id: 403,
    panchayat_id: 1,
    title: "Sanjay Gandhi Niradhar Yojana Forms",
    body: "Forms for eligible senior citizens and widows are being accepted at Ward 2 library center until next Monday. Please bring Aadhaar card and income certificate.",
    type: "scheme",
    created_by: 888,
    panchayat_name: "Nerle Gram Panchayat",
    created_at: "2026-07-10T14:30:00Z",
    updated_at: "2026-07-10T14:30:00Z",
  },
];

export const noticesService = {
  async getNotices(params?: {
    panchayat_id?: number;
    type?: NoticeType;
    page?: number;
    limit?: number;
  }): Promise<PaginatedResponse<Notice>> {
    if (SERVICE_CONFIG.notices) {
      await new Promise((resolve) => setTimeout(resolve, 500));
      let filtered = [...mockNotices];
      if (params?.panchayat_id) {
        filtered = filtered.filter((n) => n.panchayat_id === params.panchayat_id);
      }
      if (params?.type) {
        filtered = filtered.filter((n) => n.type === params.type);
      }

      const page = params?.page ?? 1;
      const limit = params?.limit ?? 10;
      const total = filtered.length;
      const pages = Math.ceil(total / limit);
      const startIndex = (page - 1) * limit;
      const paginatedData = filtered.slice(startIndex, startIndex + limit);

      return {
        success: true,
        message: "Notices fetched successfully",
        data: paginatedData,
        pagination: { total, page, limit, pages },
      };
    } else {
      const response = await apiClient.get<PaginatedResponse<Notice>>("/notices", {
        params,
      });
      return response.data;
    }
  },

  async createNotice(data: {
    panchayat_id: number;
    title: string;
    body: string;
    type: NoticeType;
  }): Promise<ApiResponse<Notice>> {
    if (SERVICE_CONFIG.notices) {
      await new Promise((resolve) => setTimeout(resolve, 600));
      const newNotice: Notice = {
        id: mockNotices.length + 401,
        panchayat_id: data.panchayat_id,
        title: data.title,
        body: data.body,
        type: data.type,
        created_by: 888,
        panchayat_name: "Nerle Gram Panchayat",
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };
      mockNotices.unshift(newNotice);
      return {
        success: true,
        message: "Notice created successfully",
        data: newNotice,
      };
    } else {
      const response = await apiClient.post<ApiResponse<Notice>>("/notices", data);
      return response.data;
    }
  },

  async deleteNotice(id: number): Promise<ApiResponse<null>> {
    if (SERVICE_CONFIG.notices) {
      await new Promise((resolve) => setTimeout(resolve, 400));
      mockNotices = mockNotices.filter((n) => n.id !== id);
      return {
        success: true,
        message: "Notice deleted successfully",
        data: null,
      };
    } else {
      const response = await apiClient.delete<ApiResponse<null>>(`/notices/${id}`);
      return response.data;
    }
  },
};
