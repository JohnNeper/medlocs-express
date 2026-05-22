export const API_BASE_URL = import.meta.env.VITE_API_URL || "https://medlocs.westtechs.org";


/**
 * Helper for generic fetch requests
 */
async function fetchApi(endpoint: string, options: RequestInit = {}) {
  const url = `${API_BASE_URL}${endpoint}`;
  const response = await fetch(url, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...options.headers,
    },
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.message || `API Error: ${response.status} ${response.statusText}`);
  }

  return response.json();
}

/**
 * Mobile Authentication & Verification API
 */
export const authApi = {
  sendPhoneVerificationCode: (phone: string) =>
    fetchApi("/verification/send-phone-verification-code", {
      method: "POST",
      body: JSON.stringify({ phoneNumber: phone }),
    }),

  verifyPhoneCode: (phone: string, code: string) =>
    fetchApi("/verification/verify-phone-code", {
      method: "POST",
      body: JSON.stringify({ phoneNumber: phone, code }),
    }),

  registerCustomer: (customerData: { phone: string; name: string }) =>
    fetchApi("/v1/mobile/register", {
      method: "POST",
      body: JSON.stringify(customerData),
    }),

  getCustomer: (phone: string) =>
    fetchApi(`/v1/mobile/customers/${encodeURIComponent(phone)}`),
};

/**
 * Pharmacies & Products API
 */
export const pharmacyApi = {
  getNearby: (lat: number, lng: number, city: string = "Bafoussam") =>
    fetchApi(`/v1/mobile/pharmacies/nearby?latitude=${lat}&longitude=${lng}&city=${encodeURIComponent(city)}`),

  searchProducts: (query: string, city: string = "Bafoussam") =>
    fetchApi(`/v1/mobile/products/search?query=${encodeURIComponent(query)}&city=${encodeURIComponent(city)}`),
};

/**
 * Reservations & Prescriptions API
 */
export const reservationApi = {
  getReservationsByPhone: (phone: string) =>
    fetchApi(`/v1/mobile/reservations?customerPhone=${encodeURIComponent(phone)}`),

  createReservation: (reservationData: any) =>
    fetchApi("/v1/mobile/reservations", {
      method: "POST",
      body: JSON.stringify(reservationData),
    }),

  uploadPrescription: async (formData: FormData) => {
    // We don't use fetchApi here because FormData needs browser to set Content-Type with boundary automatically
    const response = await fetch(`${API_BASE_URL}/v1/mobile/upload-prescription`, {
      method: "POST",
      body: formData,
    });
    if (!response.ok) {
      throw new Error(`Upload failed: ${response.status}`);
    }
    return response.json();
  },
};
