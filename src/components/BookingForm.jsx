import { useState, useEffect } from "react";
import { bookAppointment, getSlotConfig } from "./../../apis/apis";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import SuccessModal from "./BookingForm/SuccessModel";
import RegistrationForm from "./BookingForm/RegistrationForm";
import DateTimeSelector from "./BookingForm/DateTimeSelector";
import { format } from "date-fns";

const BookingForm = () => {
  const today = new Date();
  const [selectedDate, setSelectedDate] = useState(null);
  const [selectedTime, setSelectedTime] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [dateSlotMap, setDateSlotMap] = useState({});
  const [currentMonth, setCurrentMonth] = useState(today.getMonth());
  const [currentYear, setCurrentYear] = useState(today.getFullYear());
  const [timezone, setTimezone] = useState("Asia/Kolkata");
  const [currentMonthDays, setCurrentMonthDays] = useState([]);

  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    location: "",
    grade: "",
    countryCode: "+91",
    batchNo:"96",
    parentConfirmed: false,
  });

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const getOneHourLater = (timeStr) => {
    if (!timeStr) return "";
    const [time, modifier] = timeStr.split(" ");
    let [hours, minutes] = time.split(":").map(Number);
    if (modifier === "PM" && hours !== 12) hours += 12;
    if (modifier === "AM" && hours === 12) hours = 0;

    const date = new Date();
    date.setHours(hours + 1, minutes, 0);
    const newHours = date.getHours();
    const formattedHours = newHours % 12 || 12;
    const newModifier = newHours >= 12 ? "PM" : "AM";
    return `${formattedHours}:${String(date.getMinutes()).padStart(2, "0")} ${newModifier}`;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedDate || !selectedTime)
      return toast.error("📅 Please select a date and time.");

    const phoneValid = /^[0-9]{10}$/.test(form.phone);
    const emailValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email);
    if (!phoneValid) return toast.error("📱 Enter a valid 10-digit mobile number");
    if (!emailValid) return toast.error("📧 Enter a valid email address");

    const dateStr = format(selectedDate, "yyyy-MM-dd");
    const slotList = dateSlotMap[dateStr] || [];
    const selectedSlotObj = slotList.find((s) => s.time === selectedTime);
    if (!selectedSlotObj) return toast.error("❌ Selected time is invalid");

    try {
      const response = await bookAppointment({
        ...form,
        date: dateStr,
        program:"ISRO MISSIONS WORKSHOP 5TH TO 9TH",
        time: selectedTime,
        counselorEmail: selectedSlotObj.counselorEmail,
        counselorId: selectedSlotObj.counselorId,
      });

      if (response.success || response.booking?._id) {
        setShowSuccess(true);
        toast.success("✅ Booking confirmed!");
        resetForm();
      } else {
         
        toast.error(response);
      }
    } catch (err) {
      console.error("Booking error:", err);
      toast.error(err);
    }
  };

  const resetForm = () => {
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
    setShowForm(false);
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

        const now = new Date();
        now.setSeconds(0, 0);

        const sortedDates = Object.keys(map).sort();
        for (let dateStr of sortedDates) {
          const slots = map[dateStr];
          for (let slot of slots) {
            const [time, meridian] = slot.time.split(" ");
            let [hours, minutes] = time.split(":").map(Number);
            if (meridian === "PM" && hours !== 12) hours += 12;
            if (meridian === "AM" && hours === 12) hours = 0;

            const slotDate = new Date(`${dateStr}T${hours.toString().padStart(2, "0")}:${minutes.toString().padStart(2, "0")}:00`);

            if (slotDate > now) {
              setSelectedDate(new Date(dateStr));
              setSelectedTime("");
              return;
            }
          }
        }
        setSelectedDate(null);
        setSelectedTime("");
      } catch (err) {
        console.error("❌ Failed to fetch slots:", err);
      }
    };

    fetchSlotConfig();
  }, []);

  const generateMonthDays = (year, month) => {
    const days = [];
    const first = new Date(year, month, 1);
    const last = new Date(year, month + 1, 0);
    for (let i = 0; i < first.getDay(); i++) days.push(null);
    for (let d = 1; d <= last.getDate(); d++) days.push(new Date(year, month, d));
    return days;
  };

  const selectedDateStr = selectedDate ? format(selectedDate, "yyyy-MM-dd") : null;
  const timeSlots = selectedDateStr && dateSlotMap[selectedDateStr] ? [...new Set(dateSlotMap[selectedDateStr].map((s) => s.time))] : [];

  return (
    <div className="flex items-center justify-center min-h-screen bg-black text-black px-6 md:px-12 lg:px-20 py-10">
      <ToastContainer position="top-right" autoClose={3000} theme="colored" />
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
            dateSlotMap={dateSlotMap}
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
      {showSuccess && <SuccessModal clientEmail={form.email} />}
    </div>
  );
};

export default BookingForm;
