import { useState } from "react";
import { bookAppointment } from "./../../apis/apis"; // Make sure this is imported
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import SuccessModal from "./BookingForm/SuccessModel"
import RegistrationForm from "./BookingForm/RegistrationForm";
import DateTimeSelector from "./BookingForm/DateTimeSelector"

const BookingForm = () => {
  const today = new Date();
  const [selectedDate, setSelectedDate] = useState(null);
  const [selectedTime, setSelectedTime] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [gmeet, setGMeet] = useState("");
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
    const { name, value, type, checked } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
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
        setGMeet(response.meetLink)
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
<div className="flex items-center  justify-center min-h-screen bg-black  text-black px-4">
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
<div className="w-full max-w-6xl">
  {!showForm ? (
       <DateTimeSelector
        timezone={timezone}
        setTimezone={setTimezone}
        currentMonth={currentMonth}
        setCurrentMonth={setCurrentMonth}
        currentYear={currentYear}
        setCurrentYear={setCurrentYear}
        currentMonthDays={currentMonthDays}
        today={today}
        selectedDate={selectedDate}
        setSelectedDate={setSelectedDate}
        selectedTime={selectedTime}
        setSelectedTime={setSelectedTime}
        timeSlots={timeSlots}
        setShowForm={setShowForm}
      />
   ) : (
    <div className="min-h-screen bg-black text-white px-4 py-8 md:px-10 flex items-center justify-center">
         <RegistrationForm
          form={form}
          setForm={setForm}
          selectedDate={selectedDate}
          selectedTime={selectedTime}
          getOneHourLater={getOneHourLater}
          setShowForm={setShowForm}
          handleSubmit={handleSubmit}
          handleChange={handleChange}
        />
     </div>
  )}
</div>

  {showSuccess && (
    <SuccessModal
      onClose={() => setShowSuccess(false)}
      clientEmail={form.email}
      gmeetLink={gmeet}
    />
  )}
</div>

  );
};

export default BookingForm;
