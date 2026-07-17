// TEMPORARILY MOCKED — real endpoint requires JWT auth; switch USE_MOCK back to false once a real admin login endpoint exists on /server.

import { SERVICE_CONFIG } from "./config";
import { apiClient } from "./api-client";
import { ApiResponse, PaginatedResponse, Complaint, ComplaintStatus } from "./types";
import complaintsMock from "../mocks/complaints.mock.json";

let mockComplaints: Complaint[] = complaintsMock as unknown as Complaint[];

export const complaintsService = {
  async getComplaints(
    panchayatId: number,
    params?: {
      status?: ComplaintStatus;
      category?: string;
      page?: number;
      limit?: number;
    }
  ): Promise<PaginatedResponse<Complaint>> {
    if (SERVICE_CONFIG.complaints) {
      await new Promise((resolve) => setTimeout(resolve, 600));
      // In mock, if panchayatId is 0 or null (super_admin), return all, else filter
      let filtered = [...mockComplaints];
      if (panchayatId > 0) {
        filtered = filtered.filter((c) => c.panchayat_id === panchayatId);
      }
      if (params?.status) {
        filtered = filtered.filter((c) => c.status === params.status);
      }
      if (params?.category) {
        filtered = filtered.filter((c) => c.category === params.category);
      }

      const page = params?.page ?? 1;
      const limit = params?.limit ?? 10;
      const total = filtered.length;
      const pages = Math.ceil(total / limit);
      const startIndex = (page - 1) * limit;
      const paginatedData = filtered.slice(startIndex, startIndex + limit);

      return {
        success: true,
        message: "Complaints fetched successfully",
        data: paginatedData,
        pagination: { total, page, limit, pages },
      };
    } else {
      // In real mode, call backend endpoint
      const response = await apiClient.get<PaginatedResponse<Complaint>>(
        `/complaints/panchayat/${panchayatId}`,
        { params }
      );
      return response.data;
    }
  },

  async getComplaintDetail(id: number): Promise<ApiResponse<Complaint>> {
    if (SERVICE_CONFIG.complaints) {
      await new Promise((resolve) => setTimeout(resolve, 300));
      const complaint = mockComplaints.find((c) => c.id === id);
      if (!complaint) throw new Error("Complaint not found");
      return {
        success: true,
        message: "Complaint details fetched",
        data: complaint,
      };
    } else {
      const response = await apiClient.get<ApiResponse<Complaint>>(`/complaints/${id}`);
      return response.data;
    }
  },

  async updateStatus(
    id: number,
    status: ComplaintStatus,
    remark?: string
  ): Promise<ApiResponse<Complaint>> {
    if (SERVICE_CONFIG.complaints) {
      await new Promise((resolve) => setTimeout(resolve, 500));
      const complaintIndex = mockComplaints.findIndex((c) => c.id === id);
      if (complaintIndex === -1) throw new Error("Complaint not found");

      mockComplaints[complaintIndex] = {
        ...mockComplaints[complaintIndex],
        status,
        remark: remark || null,
        updated_at: new Date().toISOString(),
      };

      return {
        success: true,
        message: "Complaint status updated successfully",
        data: mockComplaints[complaintIndex],
      };
    } else {
      const response = await apiClient.patch<ApiResponse<Complaint>>(`/complaints/${id}/status`, {
        status,
        remark,
      });
      return response.data;
    }
  },
};
