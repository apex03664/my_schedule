import axios from 'axios';

const BASE_URL = 'https://s6q2uf08u2.execute-api.eu-north-1.amazonaws.com/api';

export const fetchAllBookings = async () => {
  const response = await axios.get(`${BASE_URL}/admin/bookings`);
  return response.data;
};
export const bookAppointment = async (data) => {
  try {
    const response = await axios.post(`${BASE_URL}/public/bookings`, data);
    return response.data;
  } catch (error) {
    console.log(error)
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
