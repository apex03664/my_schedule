import React, { useState, useEffect } from "react";
import rocket from "./rocket.json";
import axios from "axios";
import PhoneInput from "react-phone-input-2";
import "react-phone-input-2/lib/style.css";
import Lottie from "lottie-react";

const RegistrationForm = ({
  form,
  setForm,
  selectedDate,
  selectedTime,
  userTimezone,
  batchOptions,
  setShowForm,
  handleSubmit,
  handleChange,
}) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const detectLocation = async () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const { latitude, longitude } = position.coords;
          try {
            const response = await axios.get(
              `https://nominatim.openstreetmap.org/reverse`,
              {
                params: {
                  format: "json",
                  lat: latitude,
                  lon: longitude,
                },
              }
            );
            const { address } = response.data;
            const city = address.city || address.town || address.village || "";
            const state = address.state || "";
            const country = address.country || "";
            const locationString = `${city}, ${state}, ${country}`;
            setForm((prevForm) => ({ ...prevForm, location: locationString }));
          } catch (error) {
            console.error("Error fetching location:", error);
          }
        },
        (error) => {
          console.error("Geolocation error:", error);
        }
      );
    }
  };

  useEffect(() => {
    if (!form.location) {
      detectLocation();
    }
  }, []);

  const onSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage("");
    setIsSubmitting(true);

    try {
      await handleSubmit(e);
    } catch (err) {
      setErrorMessage("❌ Something went wrong. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#1A0B2E] py-4 px-4 sm:py-8 sm:px-6">
      <div className="max-w-2xl mx-auto">
        <form
          onSubmit={onSubmit}
          className="bg-[#2D1B4E] border border-[#4A2C6D] rounded-2xl p-6 space-y-6"
        >
          {isSubmitting && (
            <div className="fixed inset-0 bg-black/95 flex flex-col items-center justify-center z-[9999]">
              <Lottie animationData={rocket} style={{ width: 300, height: 300 }} />
              <div className="text-white text-lg font-semibold mt-4 animate-pulse">
                Booking your session...
              </div>
            </div>
          )}

          {/* Header */}
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="text-2xl">📝</span>
              <h3 className="text-2xl font-bold text-white">Registration</h3>
            </div>
            <p className="text-sm text-gray-400">Fill in your details to complete booking</p>
          </div>

          {/* Selected DateTime */}
          <div className="bg-[#1A0B2E] rounded-xl p-4 border border-[#4A2C6D]">
            <div className="flex items-center gap-4">
              <div className="bg-[#9D4EDD] text-white font-bold px-4 py-3 rounded-lg text-center min-w-[60px]">
                <div className="text-xs leading-none uppercase">
                  {selectedDate?.toLocaleString("en-US", { month: "short" })}
                </div>
                <div className="text-2xl">{selectedDate?.getDate()}</div>
              </div>
              <div className="flex-1">
                <div className="text-white font-medium">
                  {selectedDate?.toLocaleDateString("en-GB", {
                    weekday: "long",
                    day: "2-digit",
                    month: "long",
                    year: "numeric"
                  })}
                </div>
                <div className="text-sm text-[#9D4EDD] font-medium mt-1">
                  {selectedTime}
                </div>
                <div className="text-xs text-gray-500 mt-0.5">
                  🌍 {userTimezone?.split('/')[1] || 'IST'}
                </div>
              </div>
            </div>
          </div>

          {errorMessage && (
            <div className="bg-red-500/10 border border-red-500/30 text-red-400 p-3 rounded-lg text-sm">
              {errorMessage}
            </div>
          )}

          <div className="space-y-4">
            {/* Name */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Full Name <span className="text-red-400">*</span>
              </label>
              <input
                type="text"
                name="name"
                placeholder="Enter your full name"
                value={form.name}
                onChange={handleChange}
                required
                className="w-full px-4 py-3 border border-[#4A2C6D] rounded-lg bg-[#1A0B2E] text-white placeholder-gray-500 focus:outline-none focus:border-[#9D4EDD] transition"
              />
            </div>

            {/* Email */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Email Address <span className="text-red-400">*</span>
              </label>
              <input
                type="email"
                name="email"
                placeholder="your.email@example.com"
                value={form.email}
                onChange={handleChange}
                required
                className="w-full px-4 py-3 border border-[#4A2C6D] rounded-lg bg-[#1A0B2E] text-white placeholder-gray-500 focus:outline-none focus:border-[#9D4EDD] transition"
              />
            </div>

            {/* Mobile */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Mobile Number <span className="text-red-400">*</span>
              </label>
              <PhoneInput
                country={"in"}
                value={form.phone}
                onChange={(value, countryData) => {
                  setForm({
                    ...form,
                    phone: value,
                    countryCode: `+${countryData.dialCode}`,
                  });
                }}
                inputProps={{
                  name: "phone",
                  required: true,
                }}
                containerStyle={{ width: "100%" }}
                inputStyle={{
                  width: "100%",
                  height: "48px",
                  backgroundColor: "#1A0B2E",
                  border: "1px solid #4A2C6D",
                  borderRadius: "0.5rem",
                  color: "#ffffff",
                  fontSize: "14px",
                  paddingLeft: "50px",
                }}
                buttonStyle={{
                  backgroundColor: "#1A0B2E",
                  border: "1px solid #4A2C6D",
                  borderRadius: "0.5rem 0 0 0.5rem",
                }}
                dropdownStyle={{
                  backgroundColor: "#2D1B4E",
                  border: "1px solid #4A2C6D",
                  color: "#ffffff",
                }}
                searchStyle={{
                  backgroundColor: "#1A0B2E",
                  color: "#ffffff",
                  borderRadius: "0.5rem",
                }}
                enableSearch={true}
                placeholder="Enter phone number"
              />
            </div>

            {/* Location */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                City & State <span className="text-red-400">*</span>
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  name="location"
                  placeholder="City, State, Country"
                  value={form.location || ""}
                  onChange={(e) => setForm({ ...form, location: e.target.value })}
                  required
                  className="flex-1 px-4 py-3 border border-[#4A2C6D] rounded-lg bg-[#1A0B2E] text-white placeholder-gray-500 focus:outline-none focus:border-[#9D4EDD] transition"
                />
                <button
                  type="button"
                  onClick={detectLocation}
                  className="px-4 py-3 bg-[#4A2C6D] hover:bg-[#5C3A7F] border border-[#5C3A7F] rounded-lg text-white transition whitespace-nowrap"
                >
                  📍 Detect
                </button>
              </div>
            </div>

            {/* Grade - Dropdown */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Student Grade <span className="text-red-400">*</span>
              </label>
              <select
                name="grade"
                value={form.grade}
                onChange={(e) => setForm({ ...form, grade: e.target.value })}
                required
                className="w-full px-4 py-3 border border-[#4A2C6D] rounded-lg bg-[#1A0B2E] text-white focus:outline-none focus:border-[#9D4EDD] transition"
              >
                <option value="">Select grade</option>
                <option value="5th">5th Grade</option>
                <option value="6th">6th Grade</option>
                <option value="7th">7th Grade</option>
                <option value="8th">8th Grade</option>
                 <option value="9th">9th Grade</option>
              </select>
            </div>

            {/* School Name - Optional */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                School Name  
              </label>
              <input
                type="text"
                name="schoolName"
                placeholder="Enter your school name"
                value={form.schoolName || ""}
                onChange={handleChange}
                className="w-full px-4 py-3 border border-[#4A2C6D] rounded-lg bg-[#1A0B2E] text-white placeholder-gray-500 focus:outline-none focus:border-[#9D4EDD] transition"
              />
            </div>

            {/* Batch No */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Batch Number <span className="text-red-400">*</span>
              </label>
              <select
                name="batchNo"
                className="w-full px-4 py-3 border border-[#4A2C6D] rounded-lg bg-[#1A0B2E] text-white focus:outline-none focus:border-[#9D4EDD] transition"
                value={form.batchNo}
                onChange={handleChange}
              >
                {batchOptions.map((b) => (
                  <option key={b} value={b}>
                    Batch {b}
                  </option>
                ))}
              </select>
            </div>

            {/* Parent Confirmation */}
            <div className="bg-[#1A0B2E] border border-[#4A2C6D] rounded-lg p-4">
              <label className="flex items-start gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  required
                  checked={form.parentConfirmed || false}
                  onChange={(e) => setForm({ ...form, parentConfirmed: e.target.checked })}
                  className="mt-1 w-4 h-4 text-[#9D4EDD] bg-[#1A0B2E] border-[#4A2C6D] rounded focus:ring-[#9D4EDD] focus:ring-2"
                />
                <span className="text-sm text-gray-300">
                  I confirm that <strong className="text-white">both parents will be available</strong> with the student for this Family Counselling session <span className="text-red-400">*</span>
                </span>
              </label>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={() => setShowForm(false)}
              disabled={isSubmitting}
              className="flex-1 px-6 py-3 border border-[#4A2C6D] hover:bg-[#4A2C6D] rounded-lg text-white transition disabled:opacity-50"
            >
              ← Back
            </button>
            <button
              type="submit"
              disabled={
                !form.name ||
                !form.email ||
                !form.phone ||
                !form.schoolName ||
                !form.location ||
                !form.grade ||
                !form.parentConfirmed ||
                isSubmitting
              }
              className="flex-1 px-6 py-3 bg-[#9D4EDD] hover:bg-[#B565F2] rounded-lg text-white font-semibold transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              ✅ Confirm Booking
            </button>
          </div>

          {/* Privacy Note */}
          <p className="text-xs text-center text-gray-500 pt-2">
            Your information is secure and will only be used for this counselling session
          </p>
        </form>
      </div>
    </div>
  );
};

export default RegistrationForm;
