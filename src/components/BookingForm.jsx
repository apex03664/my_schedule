import { useState } from "react";
import { bookAppointment } from "./../../apis/apis"; // Make sure this is imported
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import Lottie from "lottie-react";
import successAnimation from "./sujson.json";

const BookingForm = () => {
  const today = new Date();
  const [selectedDate, setSelectedDate] = useState(null);
  const [selectedTime, setSelectedTime] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    location: "",
    grade: "",
    countryCode: "+91",
    parentConfirmed: false,
  });

  const [currentMonth, setCurrentMonth] = useState(today.getMonth());
  const [currentYear, setCurrentYear] = useState(today.getFullYear());
  const [timezone, setTimezone] = useState("Asia/Kolkata");
  const [showSuccess, setShowSuccess] = useState(false);

  const getMonthDays = (year, month) => {
    const lastDay = new Date(year, month + 1, 0);
    const days = [];
    for (let d = 1; d <= lastDay.getDate(); d++) {
      days.push(new Date(year, month, d));
    }
    return days;
  };

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };
function getOneHourLater(timeStr) {
  if (!timeStr) return "";

  const [time, modifier] = timeStr.split(" ");
  let [hours, minutes] = time.split(":").map(Number);

  if (modifier === "PM" && hours !== 12) hours += 12;
  if (modifier === "AM" && hours === 12) hours = 0;

  const date = new Date();
  date.setHours(hours);
  date.setMinutes(minutes);
  date.setSeconds(0);

  // Add one hour
  date.setHours(date.getHours() + 1);

  const newHours = date.getHours();
  const newMinutes = date.getMinutes().toString().padStart(2, "0");
  const newModifier = newHours >= 12 ? "PM" : "AM";
  const formattedHours = newHours % 12 === 0 ? 12 : newHours % 12;

  return `${formattedHours}:${newMinutes} ${newModifier}`;
}

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!selectedDate || !selectedTime) {
      toast.error("📅 Please select a date and time.");
      return;
    }

    // 👉 Mobile validation (example: 10 digits)
    const phoneRegex = /^[0-9]{10}$/;
    if (!phoneRegex.test(form.phone)) {
      toast.error("📱 Enter a valid 10-digit mobile number");
      return;
    }
    // 👉 Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(form.email)) {
      toast.error("📧 Enter a valid email address");
      return;
    }
    const bookingData = {
      name: form.name,
      email: form.email,
      phone: form.phone,
      location: form.location,
      grade: form.grade,
      countryCode: form.countryCode || "+91",
      date: selectedDate.toISOString().split("T")[0], // format to YYYY-MM-DD
      time: selectedTime,
    };

    try {
      const response = await bookAppointment(bookingData);
      if (response.success || response.booking._id) {
        setShowSuccess(true);
        toast.success("✅ Booking confirmed!");

        setShowForm(false);
        setForm({
          name: "",
          email: "",
          phone: "",
          location: "",
          grade: "",
          countryCode: "+91",
          parentConfirmed: false,
        });
        setSelectedDate(null);
        setSelectedTime("");
      } else {
        toast.error("❌ Booking failed, try again.");
      }
    } catch (error) {
      console.error("Error booking appointment:", error);
      alert("Something went wrong while booking. Please try again.");
    }
  };

  const currentMonthDays = getMonthDays(currentYear, currentMonth);
  const timeSlots = ["4:00 PM", "5:30 PM", "7:00 PM", "8:30 PM"];

  return (
    <div className="flex items-center justify-center min-h-screen bg-white text-black px-4">
      <ToastContainer
        position="top-right"
        autoClose={3000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="colored"
      />

      <div className="w-full max-w-6xl grid grid-cols-1 md:grid-cols-4 gap-6">
        {/* Left Panel */}
        <div className="hidden md:flex flex-col items-start justify-start bg-black text-white border-r border-gray-800 p-6 col-span-1 space-y-4 min-h-full">
          <button
            type="button"
            onClick={() => setShowForm(false)}
            className="text-sm text-gray-400 hover:text-white transition mb-2"
          >
            ← Back
          </button>

          <img
            src="https://upload.wikimedia.org/wikipedia/commons/thumb/0/0f/Esro_magica_logo.png/240px-Esro_magica_logo.png"
            alt="EsroMagica Logo"
            className="w-16 h-16 rounded-full mb-2"
          />

          <h2 className="text-lg font-semibold text-white">
            Space Career Launch Pad – UPI PAID
          </h2>

          <p className="text-sm text-gray-400">
            Set your Counselling appointment to be the part of
            <span className="font-semibold text-white">
              {" "}
              SUPER1000 Jr Space Scientist Program
            </span>
            . How your child can become the scientist, astronaut & research
            person in the field of Space Science and technology.
          </p>

          <button className="text-sm text-blue-400 mt-2 hover:underline">
            + Show more
          </button>

          <div className="text-sm text-gray-400 border border-gray-600 px-3 py-1 rounded-full w-fit mt-2">
            ⏱ 1 hour
          </div>
        </div>

        {/* Main Panel */}
        {!showForm ? (
          <div className="col-span-3 bg-[#0e0e0e] text-white rounded-3xl p-6 shadow-xl transition-all">
            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between items-center mb-6">
              <div>
                <h3 className="text-2xl font-bold">📅 Select a Date & Time</h3>
              </div>
              <div className="flex gap-2 mt-4 md:mt-0">
                <select
                  value={timezone}
                  onChange={(e) => setTimezone(e.target.value)}
                  className="bg-black border border-gray-700 px-3 py-1 rounded-md text-sm"
                >
                  <option value="Asia/Kolkata">GMT+05:30 🇮🇳</option>
                  <option value="America/New_York">GMT-04:00 🇺🇸</option>
                  <option value="Europe/London">GMT+01:00 🇬🇧</option>
                  <option value="Asia/Dubai">GMT+04:00 🇦🇪</option>
                </select>

                <div
                  className="bg-black border border-gray-700 px-3 py-1 rounded-md text-sm"
                  disabled
                >
                  <option>60m</option>
                </div>
              </div>
            </div>

            {/* Calendar and Time Slots */}
            <div className="flex flex-col md:flex-row gap-6">
              {/* Calendar Section */}
              <div className="w-full md:w-2/3">
                <div className="flex justify-between items-center mb-4">
                  <button
                    onClick={() => {
                      if (currentMonth === 0) {
                        setCurrentMonth(11);
                        setCurrentYear((prev) => prev - 1);
                      } else {
                        setCurrentMonth((prev) => prev - 1);
                      }
                    }}
                    className="text-xl font-bold px-3 py-1 rounded bg-gray-800 hover:bg-gray-700 transition"
                  >
                    ←
                  </button>
                  <div className="text-lg font-semibold">
                    {new Date(currentYear, currentMonth).toLocaleString(
                      "default",
                      {
                        month: "long",
                      }
                    )}{" "}
                    {currentYear}
                  </div>
                  <button
                    onClick={() => {
                      if (currentMonth === 11) {
                        setCurrentMonth(0);
                        setCurrentYear((prev) => prev + 1);
                      } else {
                        setCurrentMonth((prev) => prev + 1);
                      }
                    }}
                    className="text-xl font-bold px-3 py-1 rounded bg-gray-800 hover:bg-gray-700 transition"
                  >
                    →
                  </button>
                </div>

                {/* Days Grid */}
                <div className="grid grid-cols-7 gap-2 text-center">
                  {["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"].map((d) => (
                    <div
                      key={d}
                      className="text-sm text-gray-400 font-semibold"
                    >
                      {d}
                    </div>
                  ))}
                  {currentMonthDays.map((day) => {
                    const isPast = day < today;
                    const isSelected =
                      selectedDate &&
                      day.getDate() === selectedDate.getDate() &&
                      day.getMonth() === selectedDate.getMonth() &&
                      day.getFullYear() === selectedDate.getFullYear();

                    return (
                      <button
                        key={day.toISOString()}
                        disabled={isPast}
                        onClick={() => !isPast && setSelectedDate(day)}
                        className={`text-sm font-medium px-4 py-2 rounded-xl transition-all duration-200 
              ${isPast
                            ? "bg-gray-900 text-gray-600 cursor-not-allowed"
                            : isSelected
                              ? "bg-white text-black font-bold"
                              : "bg-gray-800 text-white hover:bg-white hover:text-black"
                          }`}
                      >
                        {day.getDate()}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Time Slots Section */}
              <div className="w-full md:w-1/3">
                <div className="mb-4 text-sm text-gray-400">
                  Selected:
                  <span className="text-white font-semibold">
                    {selectedDate?.toLocaleDateString("en-GB")} at{" "}
                    {selectedTime}
                  </span>
                </div>

                {/* 12h/24h toggle placeholder */}
                <div className="flex justify-between mb-3 text-xs text-gray-400">
                  <span className="bg-gray-800 px-3 py-1 rounded-full">
                    12h
                  </span>
                  <span className="bg-gray-800 px-3 py-1 rounded-full">
                    24h
                  </span>
                </div>

                {/* Slot Buttons */}
                <div className="space-y-2">
                  {timeSlots.map((slot) => (
                    <button
                      key={slot}
                      onClick={() => {
                        if (selectedDate) {
                          setSelectedTime(slot);
                          setShowForm(true);
                        }
                      }}
                      className={`w-full text-left px-4 py-2 rounded-lg border border-gray-700 transition-all flex items-center gap-2 
            ${selectedDate
                          ? selectedTime === slot
                            ? "bg-blue-600 text-white"
                            : "bg-black text-white hover:bg-blue-700"
                          : "opacity-50 cursor-not-allowed"
                        }`}
                    >
                      <span className="w-2 h-2 bg-green-400 rounded-full inline-block"></span>
                      {slot}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="min-h-screen bg-black text-white px-4 py-8 md:px-10 flex items-center justify-center">
            <div className="w-full max-w-6xl grid grid-cols-1 md:grid-cols-4 gap-6 bg-[#0e0e0e] rounded-2xl overflow-hidden shadow-2xl">
              {/* LEFT PANEL */}
              <div className="hidden md:flex flex-col justify-start items-start border-r border-gray-800 p-6 col-span-1">
                <button className="text-sm text-gray-400 mb-4 hover:text-white">
                  ← Back
                </button>

                <img
                  src="https://upload.wikimedia.org/wikipedia/commons/thumb/0/0f/Esro_magica_logo.png/240px-Esro_magica_logo.png"
                  alt="EsroMagica Logo"
                  className="w-16 h-16 rounded-full mb-4"
                />

                <h2 className="text-lg font-bold mb-2 text-white">
                  Space Career Launch Pad – UPI PAID
                </h2>

                <p className="text-sm text-gray-400 leading-relaxed mb-2">
                  Set your Counselling appointment to be the part of{" "}
                  <strong>SUPER1000 Jr Space Scientist Program</strong>. How
                  your child can become the scientist, astronaut & research
                  person in the field of Space Science and technology.
                </p>

                <button className="text-sm text-blue-400 hover:underline mb-2">
                  + Show more
                </button>

                <span className="flex items-center text-sm text-gray-400 gap-1 mt-2">
                  ⏱{" "}
                  <span className="bg-gray-700 text-white px-2 py-0.5 rounded-full text-xs">
                    1 hour
                  </span>
                </span>
              </div>

              {/* FORM PANEL */}
              <form
                onSubmit={handleSubmit}
                className="col-span-3 bg-black text-white rounded-none md:rounded-r-2xl p-6 space-y-6 transition-all"
              >
                <h3 className="text-xl font-bold mb-4">Registration</h3>

                <div className="flex items-center gap-4">
                  <div className="bg-white text-black font-bold px-3 py-2 rounded-lg text-center">
                    <div className="text-sm leading-none">
                      {selectedDate?.toLocaleString("en-US", { month: "short" }).toUpperCase()}
                    </div>
                    <div className="text-2xl">
                      {selectedDate?.getDate()}
                    </div>
                  </div>
                  <div>
                    <div className="font-medium">
                      {selectedDate?.toLocaleDateString("en-GB", {
    weekday: "long",
    day: "2-digit",
    month: "long",
  })}
                    </div>
                    <div className="text-sm text-gray-400">
                      {selectedTime} – {getOneHourLater(selectedTime)}
                    </div>

                  </div>
                </div>


                {/* Name */}
                <div>
                  <label className="block font-semibold mb-1">
                    Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="name"
                    placeholder="Enter your full name"
                    value={form.name}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-2 bg-transparent border border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                {/* Email */}
                <div>
                  <label className="block font-semibold mb-1">
                    Email address <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="email"
                    name="email"
                    placeholder="Enter your email"
                    value={form.email}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-2 bg-transparent border border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                {/* Mobile */}
                <div>
                  <label className="block font-semibold mb-1">
                    Mobile number <span className="text-red-500">*</span>
                  </label>
                  <div className="flex gap-2">
                    <select
                      required
                      className="w-1/3 px-3 py-2 border border-gray-700 bg-transparent text-white rounded-lg focus:ring-2 focus:ring-blue-500"
                      value={form.countryCode || "+91"}
                      onChange={(e) =>
                        setForm({ ...form, countryCode: e.target.value })
                      }
                    >
                      <option value="+91">+91</option>
                      <option value="+1">+1</option>
                      <option value="+44">+44</option>
                      <option value="+971">+971</option>
                    </select>
                    <input
                      type="tel"
                      name="phone"
                      placeholder="Phone Number"
                      value={form.phone}
                      onChange={handleChange}
                      required
                      className="w-2/3 px-4 py-2 bg-transparent border border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>

                {/* Location */}
                <div>
                  <label className="block font-semibold mb-1">
                    What is your City & State Name?{" "}
                    <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="location"
                    placeholder="City & State"
                    value={form.location || ""}
                    onChange={(e) =>
                      setForm({ ...form, location: e.target.value })
                    }
                    required
                    className="w-full px-4 py-2 bg-transparent border border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                {/* Grade */}
                <div>
                  <label className="block font-semibold mb-2">
                    GRADE of Student <span className="text-red-500">*</span>
                  </label>
                  <div className="space-y-1">
                    {[
                      "GRADE 3-4",
                      "GRADE 5-7",
                      "GRADE 8-10",
                      "GRADE 11-12",
                    ].map((g) => (
                      <label key={g} className="flex items-center gap-2">
                        <input
                          type="radio"
                          name="grade"
                          value={g}
                          checked={form.grade === g}
                          onChange={(e) =>
                            setForm({ ...form, grade: e.target.value })
                          }
                          className="form-radio accent-blue-500"
                        />
                        <span>{g}</span>
                      </label>
                    ))}
                  </div>
                </div>

                {/* Parent Confirmation */}
                <div>
                  <label className="block font-semibold mb-1">
                    Please confirm that both parents are available with student
                    for this Family Counselling session!{" "}
                    <span className="text-red-500">*</span>
                  </label>
                  <label className="flex items-center gap-2 mt-1">
                    <input
                      type="checkbox"
                      required
                      checked={form.parentConfirmed || false}
                      onChange={(e) =>
                        setForm({ ...form, parentConfirmed: e.target.checked })
                      }
                      className="form-checkbox accent-green-500"
                    />
                    <span>Yes, both parents will join.</span>
                  </label>
                </div>

                {/* Buttons */}
                <div className="flex justify-end gap-4 pt-4">
                  <button
                    type="button"
                    onClick={() => setShowForm(false)}
                    className="px-5 py-2 border border-gray-600 rounded-lg hover:bg-gray-800 text-white transition"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={
                      !form.name ||
                      !form.location ||
                      !form.grade ||
                      !form.parentConfirmed
                    }
                    className={`px-6 py-2 rounded-lg transition font-semibold ${!form.name ||
                      !form.location ||
                      !form.grade ||
                      !form.parentConfirmed
                      ? "bg-gray-600 text-gray-400 cursor-not-allowed"
                      : "bg-blue-600 hover:bg-blue-700 text-white"
                      }`}
                  >
                    ✅ Confirm Booking
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>

      {/* Success Message */}
      {showSuccess && (
        <div className="fixed inset-0 bg-black flex flex-col items-center justify-center text-white text-center z-50 p-4">
          <div className="w-64 h-64 mb-4">
            {" "}
            {/* Controlled size */}
            <Lottie animationData={successAnimation} loop={true} />
          </div>

          <h2 className="text-2xl font-bold mb-2">🎉 Thank you for booking!</h2>
          <p className="text-gray-300 text-sm max-w-md">
            Your one-on-one counselling session has been successfully scheduled.
            We’re excited to meet you!
          </p>
        </div>
      )}
    </div>
  );
};

export default BookingForm;
