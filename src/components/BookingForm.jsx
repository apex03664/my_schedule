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

  // Helper to get Friday of the current week for batch 99 base
  const getFridayOfCurrentWeek = (date) => {
    const day = date.getDay(); // 0 Sun, 1 Mon, ..., 5 Fri
    // Days to subtract to get Friday: if today is Fri (5), subtract 0; else subtract days accordingly
    const daysToFriday = day >= 5 ? day - 5 : day + 2;
    return new Date(date.getFullYear(), date.getMonth(), date.getDate() - daysToFriday);
  };

  // Calculate batch number starting at 99 for current week Friday
  const getBatchForDate = (date) => {
    const batch99Friday = getFridayOfCurrentWeek(today);
    const diffTime = date.getTime() - batch99Friday.getTime();
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
    const weeksPassed = Math.floor(diffDays / 7);
    return 99 + (weeksPassed >= 0 ? weeksPassed : 0);
  };

  const getBatchDateRange = (date) => {
    const batch = getBatchForDate(date);
    const dayOfWeek = date.getDay();
    let startFriday;
    if (dayOfWeek === 5) {
      startFriday = new Date(date);
    } else {
      const daysSinceFriday =
        dayOfWeek === 6 ? 1 :
        dayOfWeek === 0 ? 2 :
        dayOfWeek === 1 ? 3 :
        dayOfWeek === 2 ? 4 :
        dayOfWeek === 3 ? 5 : 6;
      startFriday = new Date(date.getTime() - (daysSinceFriday * 24 * 60 * 60 * 1000));
    }
    const endThursday = new Date(startFriday.getTime() + 6 * 24 * 60 * 60 * 1000);

    return {
      batch,
      startDate: format(startFriday, "do MMM"),
      endDate: format(endThursday, "do MMM yyyy"),
    };
  };

  // State
  const [selectedDate, setSelectedDate] = useState(null);
  const [selectedTime, setSelectedTime] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [dateSlotMap, setDateSlotMap] = useState({});
  const [currentMonth, setCurrentMonth] = useState(today.getMonth());
  const [currentYear, setCurrentYear] = useState(today.getFullYear());
  const [timezone, setTimezone] = useState("Asia/Kolkata");
  const [currentMonthDays, setCurrentMonthDays] = useState([]);

  // Batch options: current batch and previous batch
 const currentBatch = getBatchForDate(today);
const previousBatch = currentBatch > 99 ? currentBatch - 1 : 98;
const batchOptions = [currentBatch, previousBatch];

 
  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    location: "",
    grade: "",
    countryCode: "+91",
    batchNo: currentBatch.toString(),
    parentConfirmed: false,
  });

  // Update batch number when selected date changes
  useEffect(() => {
    if (selectedDate) {
      const batchForSelectedDate = getBatchForDate(selectedDate);
      setForm((prev) => ({
        ...prev,
        batchNo: batchForSelectedDate.toString(),
      }));
    }
  }, [selectedDate]);

  // Generate days for current month (for calendar)
  useEffect(() => {
    const generateMonthDays = (year, month) => {
      const days = [];
      const first = new Date(year, month, 1);
      const last = new Date(year, month + 1, 0);
      for (let i = 0; i < first.getDay(); i++) days.push(null);
      for (let d = 1; d <= last.getDate(); d++) days.push(new Date(year, month, d));
      return days;
    };
    setCurrentMonthDays(generateMonthDays(currentYear, currentMonth));
  }, [currentMonth, currentYear]);

  // Fetch slots and auto-select the first upcoming slot & set batch accordingly
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
              const selectedDateObj = new Date(dateStr);
              setSelectedDate(selectedDateObj);
              setSelectedTime("");
              const batchForAutoSelected = getBatchForDate(selectedDateObj);
              setForm((prev) => ({
                ...prev,
                batchNo: batchForAutoSelected.toString(),
              }));
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
    if (!selectedDate || !selectedTime) return toast.error("📅 Please select a date and time.");

    const emailValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email);
    if (!emailValid) return toast.error("📧 Enter a valid email address");

    const dateStr = format(selectedDate, "yyyy-MM-dd");
    const slotList = dateSlotMap[dateStr] || [];
    const selectedSlotObj = slotList.find((s) => s.time === selectedTime);
    if (!selectedSlotObj) return toast.error("❌ Selected time is invalid");

    const batchInfo = getBatchDateRange(selectedDate);

    try {
      const response = await bookAppointment({
        ...form,
        date: dateStr,
        program: `ISRO MISSIONS WORKSHOP BATCH ${batchInfo.batch} (${batchInfo.startDate} - ${batchInfo.endDate})`,
        time: selectedTime,
        counselorEmail: selectedSlotObj.counselorEmail,
        counselorId: selectedSlotObj.counselorId,
      });

      if (response.success || response.booking?._id) {
        setShowSuccess(true);
        toast.success(`✅ Booking confirmed for Batch ${batchInfo.batch}!`);
        resetForm();
      } else {
        toast.error(response);
      }
    } catch (err) {
      console.error("Booking error:", err);
      toast.error(err.message || err);
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
      batchNo: currentBatch.toString(),
      parentConfirmed: false,
    });
    setSelectedDate(null);
    setSelectedTime("");
    setShowForm(false);
  };

  const selectedDateStr = selectedDate ? format(selectedDate, "yyyy-MM-dd") : null;
  const timeSlots =
    selectedDateStr && dateSlotMap[selectedDateStr]
      ? [...new Set(dateSlotMap[selectedDateStr].map((s) => s.time))]
      : [];

  const currentBatchInfo = getBatchDateRange(today);

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
            currentBatchInfo={currentBatchInfo}
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
              batchOptions={batchOptions} // pass both current and previous batches
              batchInfo={currentBatchInfo}
            />
          </div>
        )}
      </div>
      {showSuccess && <SuccessModal clientEmail={form.email} />}
    </div>
  );
};

export default BookingForm;
