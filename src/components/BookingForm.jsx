import { useState, useEffect } from "react";
import { bookAppointment, getSlotConfig } from "./../../apis/apis";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import SuccessModal from "./BookingForm/SuccessModel";
import RegistrationForm from "./BookingForm/RegistrationForm";
import DateTimeSelector from "./BookingForm/DateTimeSelector";

const BookingForm = () => {
  const today = new Date();
  const [selectedDate, setSelectedDate] = useState(null);
  const [selectedTime, setSelectedTime] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [dateSlotMap, setDateSlotMap] = useState({});

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
  const [currentMonthDays, setCurrentMonthDays] = useState([]);

  const generateMonthDays = (year, month) => {
    const days = [];

    const firstDayOfMonth = new Date(year, month, 1);
    const lastDayOfMonth = new Date(year, month + 1, 0);

    const leadingEmptyDays = firstDayOfMonth.getDay(); // Sunday = 0, Monday = 1...

    // Add empty slots before the first date
    for (let i = 0; i < leadingEmptyDays; i++) {
      days.push(null); // null for empty slots
    }

    // Add days of the month
    for (let d = 1; d <= lastDayOfMonth.getDate(); d++) {
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

    const slotList =
      dateSlotMap[selectedDate.toISOString().split("T")[0]] || [];
    const selectedSlotObj = slotList.find((s) => s.time === selectedTime);

    if (!selectedSlotObj) {
      toast.error("❌ Selected time is invalid");
      return;
    }

    if (!selectedDate || !selectedTime) {
      toast.error("📅 Please select a date and time.");
      return;
    }

    const phoneRegex = /^[0-9]{10}$/;
    if (!phoneRegex.test(form.phone)) {
      toast.error("📱 Enter a valid 10-digit mobile number");
      return;
    }

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
      date: selectedDate.toISOString().split("T")[0],
      time: selectedTime,
      counselorEmail: selectedSlotObj.counselorEmail,
      counselorId: selectedSlotObj.counselorId,
    };

    try {
      const response = await bookAppointment(bookingData);
      if (response.success || response.booking._id) {
        setShowSuccess(true);
        setGMeet(response.meetLink);
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

  useEffect(() => {
    setCurrentMonthDays(generateMonthDays(currentYear, currentMonth));
  }, [currentMonth, currentYear]);
  useEffect(() => {
    const fetchSlotConfig = async () => {
      try {
        const data = await getSlotConfig();
        const map = {};
        data.forEach(({ date, slots }) => {
          map[date] = slots;
        });
        setDateSlotMap(map);
      } catch (err) {
        console.error("❌ Failed to fetch slots:", err);
      }
    };

    fetchSlotConfig();
  }, []);

  const timeSlots = ["4:00 PM", "5:30 PM", "7:00 PM", "8:30 PM"];

  return (
    <div className="flex items-center justify-center min-h-screen bg-black text-black px-4">
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
            dateSlotMap={dateSlotMap} // ✅ added
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
            timeSlots={
              selectedDate
                ? Array.from(
                    new Set(
                      (dateSlotMap[selectedDate.toISOString().split("T")[0]] || []).map(
                        (slot) => slot.time
                      )
                    )
                  )
                : []
            }
            
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
