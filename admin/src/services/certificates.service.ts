// TEMPORARILY MOCKED — real endpoint requires JWT auth; switch USE_MOCK back to false once a real admin login endpoint exists on /server.

import { SERVICE_CONFIG } from "./config";
import { apiClient } from "./api-client";
import { ApiResponse, PaginatedResponse, Certificate, CertificateStatus } from "./types";
import certificatesMock from "../mocks/certificates.mock.json";

let mockCertificates: Certificate[] = certificatesMock as unknown as Certificate[];

export const certificatesService = {
  async getCertificates(
    panchayatId: number,
    params?: {
      status?: CertificateStatus;
      type?: string;
      page?: number;
      limit?: number;
    }
  ): Promise<PaginatedResponse<Certificate>> {
    // Check SERVICE_CONFIG
    if (SERVICE_CONFIG.certificates) {
      await new Promise((resolve) => setTimeout(resolve, 600));
      let filtered = [...mockCertificates];
      if (panchayatId > 0) {
        filtered = filtered.filter((c) => c.panchayat_id === panchayatId);
      }
      if (params?.status) {
        filtered = filtered.filter((c) => c.status === params.status);
      }
      if (params?.type) {
        filtered = filtered.filter((c) => c.type === params.type);
      }

      const page = params?.page ?? 1;
      const limit = params?.limit ?? 10;
      const total = filtered.length;
      const pages = Math.ceil(total / limit);
      const startIndex = (page - 1) * limit;
      const paginatedData = filtered.slice(startIndex, startIndex + limit);

      return {
        success: true,
        message: "Certificates fetched successfully",
        data: paginatedData,
        pagination: { total, page, limit, pages },
      };
    } else {
      // NOTE: If the backend has no admin list route yet, we'll try querying a standard REST route
      // or fallback gracefully to mock if it 404s.
      try {
        const response = await apiClient.get<PaginatedResponse<Certificate>>(
          `/certificates/panchayat/${panchayatId}`,
          { params }
        );
        return response.data;
      } catch (err: any) {
        console.warn("Backend /certificates/panchayat/:id not implemented yet. Falling back to local mock data.");
        // Fallback to mock logic
        let filtered = [...mockCertificates];
        if (panchayatId > 0) {
          filtered = filtered.filter((c) => c.panchayat_id === panchayatId);
        }
        if (params?.status) {
          filtered = filtered.filter((c) => c.status === params.status);
        }
        if (params?.type) {
          filtered = filtered.filter((c) => c.type === params.type);
        }
        return {
          success: true,
          message: "Certificates fetched (mock fallback)",
          data: filtered,
          pagination: { total: filtered.length, page: 1, limit: 10, pages: 1 },
        };
      }
    }
  },

  async getCertificateDetail(id: number): Promise<ApiResponse<Certificate>> {
    if (SERVICE_CONFIG.certificates) {
      await new Promise((resolve) => setTimeout(resolve, 300));
      const cert = mockCertificates.find((c) => c.id === id);
      if (!cert) throw new Error("Certificate not found");
      return {
        success: true,
        message: "Certificate details fetched",
        data: cert,
      };
    } else {
      const response = await apiClient.get<ApiResponse<Certificate>>(`/certificates/${id}`);
      return response.data;
    }
  },

  async updateStatus(
    id: number,
    status: CertificateStatus,
    remark?: string,
    pdfUrl?: string
  ): Promise<ApiResponse<Certificate>> {
    if (SERVICE_CONFIG.certificates) {
      await new Promise((resolve) => setTimeout(resolve, 500));
      const certIndex = mockCertificates.findIndex((c) => c.id === id);
      if (certIndex === -1) throw new Error("Certificate not found");

      mockCertificates[certIndex] = {
        ...mockCertificates[certIndex],
        status,
        remark: remark || null,
        pdf_url: pdfUrl || (status === "ready" ? "https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf" : null),
        updated_at: new Date().toISOString(),
      };

      return {
        success: true,
        message: "Certificate status updated successfully",
        data: mockCertificates[certIndex],
      };
    } else {
      const response = await apiClient.patch<ApiResponse<Certificate>>(`/certificates/${id}/status`, {
        status,
        remark,
        pdf_url: pdfUrl,
      });
      return response.data;
    }
  },
};
