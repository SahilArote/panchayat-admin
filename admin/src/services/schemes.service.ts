import { SERVICE_CONFIG } from "./config";
import { apiClient } from "./api-client";
import { ApiResponse, PaginatedResponse, Scheme } from "./types";

let mockSchemes: Scheme[] = [
  {
    id: 501,
    name: "Krishi Sinchayee Yojana",
    description: "Financial assistance for drip irrigation system installation for small and marginal farmers.",
    benefit: "55% subsidy on total installation cost.",
    eligibility: "Farmers owning up to 2 hectares of cultivable land in Sangli/Satara/Pune district.",
    category: "agriculture",
    last_date: "2026-09-30",
    apply_url: "https://mahadbt.maharashtra.gov.in",
    created_at: "2026-07-01T00:00:00Z",
  },
  {
    id: 502,
    name: "Sanjay Gandhi Niradhar Pension Scheme",
    description: "Monthly financial pension assistance to destitute senior citizens, disabled individuals, and widows.",
    benefit: "1,500 INR monthly direct bank transfer.",
    eligibility: "Age above 65 (for senior citizens), family income below 21,000 INR per annum.",
    category: "employment",
    last_date: "2026-12-31",
    apply_url: "https://sanjaygandhiniradhar.gov.in",
    created_at: "2026-07-02T00:00:00Z",
  },
  {
    id: 503,
    name: "Rajarshi Chhatrapati Shahu Maharaj Scholarship",
    description: "Scholarship for higher education tuition fees for students belonging to economically backward classes (EBC).",
    benefit: "50% refund on tuition and exam fees.",
    eligibility: "Students admitted in professional courses, family income limit 8 lakh INR.",
    category: "education",
    last_date: "2026-10-15",
    apply_url: "https://mahadbt.maharashtra.gov.in",
    created_at: "2026-07-05T00:00:00Z",
  },
];

export const schemesService = {
  async getSchemes(params?: {
    category?: string;
    search?: string;
    page?: number;
    limit?: number;
  }): Promise<PaginatedResponse<Scheme>> {
    if (SERVICE_CONFIG.schemes.list) {
      await new Promise((resolve) => setTimeout(resolve, 500));
      let filtered = [...mockSchemes];
      if (params?.category) {
        filtered = filtered.filter((s) => s.category === params.category);
      }
      if (params?.search) {
        const query = params.search.toLowerCase();
        filtered = filtered.filter(
          (s) =>
            s.name.toLowerCase().includes(query) ||
            s.description?.toLowerCase().includes(query)
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
        message: "Schemes fetched successfully",
        data: paginatedData,
        pagination: { total, page, limit, pages },
      };
    } else {
      const response = await apiClient.get<PaginatedResponse<Scheme>>("/schemes", {
        params,
      });
      return response.data;
    }
  },

  async getSchemeDetail(id: number): Promise<ApiResponse<Scheme>> {
    if (SERVICE_CONFIG.schemes.list) {
      await new Promise((resolve) => setTimeout(resolve, 300));
      const scheme = mockSchemes.find((s) => s.id === id);
      if (!scheme) throw new Error("Scheme not found");
      return {
        success: true,
        message: "Scheme details fetched",
        data: scheme,
      };
    } else {
      const response = await apiClient.get<ApiResponse<Scheme>>(`/schemes/${id}`);
      return response.data;
    }
  },

  async createScheme(data: Omit<Scheme, "id">): Promise<ApiResponse<Scheme>> {
    if (SERVICE_CONFIG.schemes.mutate) {
      await new Promise((resolve) => setTimeout(resolve, 600));
      const newScheme: Scheme = {
        ...data,
        id: mockSchemes.length + 501,
        created_at: new Date().toISOString(),
      };
      mockSchemes.unshift(newScheme);
      return {
        success: true,
        message: "Scheme created successfully (Mock)",
        data: newScheme,
      };
    } else {
      const response = await apiClient.post<ApiResponse<Scheme>>("/schemes", data);
      return response.data;
    }
  },

  async updateScheme(id: number, data: Partial<Scheme>): Promise<ApiResponse<Scheme>> {
    if (SERVICE_CONFIG.schemes.mutate) {
      await new Promise((resolve) => setTimeout(resolve, 500));
      const index = mockSchemes.findIndex((s) => s.id === id);
      if (index === -1) throw new Error("Scheme not found");
      mockSchemes[index] = {
        ...mockSchemes[index],
        ...data,
      };
      return {
        success: true,
        message: "Scheme updated successfully (Mock)",
        data: mockSchemes[index],
      };
    } else {
      const response = await apiClient.put<ApiResponse<Scheme>>(`/schemes/${id}`, data);
      return response.data;
    }
  },

  async deleteScheme(id: number): Promise<ApiResponse<null>> {
    if (SERVICE_CONFIG.schemes.mutate) {
      await new Promise((resolve) => setTimeout(resolve, 400));
      mockSchemes = mockSchemes.filter((s) => s.id !== id);
      return {
        success: true,
        message: "Scheme deleted successfully (Mock)",
        data: null,
      };
    } else {
      const response = await apiClient.delete<ApiResponse<null>>(`/schemes/${id}`);
      return response.data;
    }
  },
};
