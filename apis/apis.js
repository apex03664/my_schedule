import axios from "axios";

//  const BASE_URL = "https://s6q2uf08u2.execute-api.eu-north-1.amazonaws.com/api";
const BASE_URL = "https://apiem.esromagica.in/api";

// Get all bookings
export const getAllBookings = async () => {
  try {
    const response = await axios.get(`${BASE_URL}/admin/bookings`);
    return response.data;
  } catch (err) {
    console.error("Error fetching bookings:", err);
    throw err.response?.data || { message: "Failed to fetch bookings" };
  }
};
// ✅ Add this function if not already present
export const getSlotConfig = async () => {
  const response = await axios.get(`${BASE_URL}/admin/config/slots`);
  return response.data; // should return [{ date: "2025-07-22", slots: [...] }, ...]
};

export const bookAppointment = async (data) => {
  try {
    const response = await axios.post(`${BASE_URL}/public/bookings`, data);
    return response.data;
  } catch (error) {
    console.log(error);
    return error.response.data.message;
  }
};

export const getAvailableSlots = async () => {
  try {
    const response = await axios.get(`${BASE_URL}/slots/available`);
    return response.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};