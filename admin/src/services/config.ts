export const SERVICE_CONFIG = {
  complaints: true,    // true = use mock data
  certificates: true,  // true = use mock data
  notices: false,      // false = use real API
  schemes: {
    list: false,        // GET is real
    mutate: true,       // POST/PUT/DELETE is mock
  },
  waterBills: true,     // true = use mock data
  panchayats: {
    list: false,        // GET is real
    mutate: true,       // POST/PUT/DELETE is mock
  },
  auth: true,           // FULLY MOCK
  adminUsers: true,     // FULLY MOCK
  citizens: true,       // FULLY MOCK
  dashboard: true,      // FULLY MOCK
  gramSabha: true,      // FULLY MOCK
} as const;
