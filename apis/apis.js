import axios from "axios";

const BASE_URL = "https://s6q2uf08u2.execute-api.eu-north-1.amazonaws.com/api";
// const BASE_URL = "http://localhost:5000/api";

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

// Cancel a booking by ID
export const cancelBooking = async (bookingId) => {
  try {
    const response = await axios.delete(
      `${BASE_URL}/admin/booking/${bookingId}`
    );
    return response.data;
  } catch (err) {
    console.error("Error cancelling booking:", err);
    throw err.response?.data || { message: "Failed to cancel booking" };
  }
};

// Reschedule a booking by ID
export const rescheduleBooking = async (bookingId, newDate, newSlot) => {
  try {
    const response = await axios.put(
      `${BASE_URL}/admin/booking/reschedule/${bookingId}`,
      {
        date: newDate,
        slot: newSlot,
      }
    );
    return response.data;
  } catch (err) {
    console.error("Error rescheduling booking:", err);
    throw err.response?.data || { message: "Failed to reschedule booking" };
  }
};
export const bookAppointment = async (data) => {
  try {
    const response = await axios.post(`${BASE_URL}/public/bookings`, data);
    return response.data;
  } catch (error) {
    console.log(error);
    throw error.response?.data || error.message;
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

export const getMeetLink = async (bookingId) => {
  try {
    const response = await axios.get(`${BASE_URL}/meet/${bookingId}`);
    return response.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};
