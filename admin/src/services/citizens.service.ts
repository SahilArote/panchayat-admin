import { ApiResponse, PaginatedResponse, Citizen } from "./types";
import citizensMock from "../mocks/citizens.mock.json";

let localCitizens = citizensMock as unknown as Citizen[];

export const citizensService = {
  async getCitizens(
    panchayatId: number,
    params?: {
      search?: string;
      page?: number;
      limit?: number;
    }
  ): Promise<PaginatedResponse<Citizen>> {
    await new Promise((resolve) => setTimeout(resolve, 500));
    let filtered = [...localCitizens];
    if (panchayatId > 0) {
      filtered = filtered.filter((c) => c.panchayat_id === panchayatId);
    }
    if (params?.search) {
      const q = params.search.toLowerCase();
      filtered = filtered.filter(
        (c) =>
          c.name.toLowerCase().includes(q) ||
          c.mobile.includes(q) ||
          c.address.toLowerCase().includes(q)
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
      message: "Citizens fetched successfully (Mock)",
      data: paginatedData,
      pagination: { total, page, limit, pages },
    };
  },

  async getCitizenDetail(id: number): Promise<ApiResponse<Citizen>> {
    await new Promise((resolve) => setTimeout(resolve, 300));
    const citizen = localCitizens.find((c) => c.id === id);
    if (!citizen) throw new Error("Citizen not found");
    return {
      success: true,
      message: "Citizen profile fetched (Mock)",
      data: citizen,
    };
  },

  async createCitizen(data: Omit<Citizen, "id">): Promise<ApiResponse<Citizen>> {
    await new Promise((resolve) => setTimeout(resolve, 600));
    const newCitizen: Citizen = {
      ...data,
      id: localCitizens.length + 1,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    localCitizens.unshift(newCitizen);
    return {
      success: true,
      message: "Citizen profile created successfully (Mock)",
      data: newCitizen,
    };
  },

  async updateCitizen(id: number, data: Partial<Citizen>): Promise<ApiResponse<Citizen>> {
    await new Promise((resolve) => setTimeout(resolve, 500));
    const index = localCitizens.findIndex((c) => c.id === id);
    if (index === -1) throw new Error("Citizen profile not found");
    localCitizens[index] = {
      ...localCitizens[index],
      ...data,
      updated_at: new Date().toISOString(),
    };
    return {
      success: true,
      message: "Citizen profile updated successfully (Mock)",
      data: localCitizens[index],
    };
  },
};
