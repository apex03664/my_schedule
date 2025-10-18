import { useState, useEffect } from "react";
import { bookAppointment, getAvailableSlots, getSlotConfig } from "./../../apis/apis";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import dayjs from 'dayjs'; // ✅ Add dayjs
import utc from 'dayjs/plugin/utc';
import timezone from 'dayjs/plugin/timezone';
import SuccessModal from "./BookingForm/SuccessModel";
import RegistrationForm from "./BookingForm/RegistrationForm";
import DateTimeSelector from "./BookingForm/DateTimeSelector";
import { format } from "date-fns";
import useBatch from "./useBatch";

// ✅ Initialize dayjs plugins
dayjs.extend(utc);
dayjs.extend(timezone);

// ✅ Helper: Get user's timezone automatically
const getUserTimezone = () => {
  try {
    return Intl.DateTimeFormat().resolvedOptions().timeZone;
  } catch (error) {
    console.warn('Failed to detect timezone, defaulting to Asia/Kolkata');
    return 'Asia/Kolkata';
  }
};

// ✅ Helper: Convert IST slot to user's timezone
const convertISTToUserTimezone = (istDateStr, istTimeSlot, userTimezone) => {
  try {
    const [startTime, endTime] = istTimeSlot.split('-').map(t => t.trim());

    // Parse IST datetime
    const istStartStr = `${istDateStr} ${startTime}`;
    const istStart = dayjs.tz(istStartStr, 'YYYY-MM-DD h:mm A', 'Asia/Kolkata');

    if (!istStart.isValid()) {
      console.warn('Invalid IST time:', istStartStr);
      return istTimeSlot; // Fallback
    }

    // Convert to user's timezone
    const userStart = istStart.tz(userTimezone);
    const userEnd = userStart.add(1, 'hour'); // Assuming 1-hour slots

    return {
      displayTime: `${userStart.format('h:mm A')}-${userEnd.format('h:mm A')}`,
      originalIST: istTimeSlot,
      date: userStart.format('YYYY-MM-DD'),
      dateObj: userStart.toDate()
    };
  } catch (error) {
    console.error('Conversion error:', error);
    return istTimeSlot;
  }
};

const BookingForm = () => {
  const today = new Date();
  const { currentBatch, loading: batchLoading, error: batchError } = useBatch();

  const batchOptions = [];
  if (currentBatch !== null) {
    batchOptions.push(currentBatch);
    if (currentBatch > 99) batchOptions.push(currentBatch - 1);
    if (currentBatch > 100) batchOptions.push(currentBatch - 2);
  } else {
    batchOptions.push("Can't fetch ! Kindly book and inform us");
  }

  const [selectedDate, setSelectedDate] = useState(null);
  const [selectedTime, setSelectedTime] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [dateSlotMap, setDateSlotMap] = useState({});
  const [currentMonth, setCurrentMonth] = useState(today.getMonth());
  const [currentYear, setCurrentYear] = useState(today.getFullYear());

  // ✅ Auto-detect user's timezone
  const [userTimezone, setUserTimezone] = useState(getUserTimezone());
  const [currentMonthDays, setCurrentMonthDays] = useState([]);

  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    location: "",
    grade: "",
    countryCode: "+91",
    batchNo: currentBatch !== null ? currentBatch.toString() : "100",
    parentConfirmed: false,
  });

  useEffect(() => {
    if (currentBatch !== null) {
      setForm((prev) => ({ ...prev, batchNo: currentBatch.toString() }));
    }
  }, [currentBatch]);

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
  }, [currentYear, currentMonth]);

  // ✅ FIXED: Fetch UTC slots and convert to user's timezone
  useEffect(() => {
    const fetchSlotConfig = async () => {
      try {
        // ✅ Use public API that returns UTC data
        const data = await getAvailableSlots(); // Changed from getSlotConfig
        const map = {};

        console.log(`🌍 User timezone: ${userTimezone}`);
        console.log(`📥 Received ${data.length} dates from backend (UTC format)`);
        console.log('Sample data:', data[0]);

        data.forEach(({ date, dateUTC, slots }) => {
          if (!slots || slots.length === 0) return;

          // ✅ Convert UTC slots to user's timezone
          const convertedSlots = slots.map(slot => {
            // Convert UTC to user's local timezone
            const converted = convertUTCToUserTimezone(dateUTC, slot.timeUTC, userTimezone);

            console.log(`🔄 Converting: UTC ${slot.timeUTC} → ${userTimezone} ${converted.displayTime}`);

            return {
              ...slot,
              timeUTC: slot.timeUTC, // Keep original UTC
              displayTime: converted.displayTime, // User's local time
              userDate: converted.date, // User's local date
              userDateObj: converted.dateObj
            };
          });

          // ✅ Group by user's local date (slots might shift dates across timezones)
          convertedSlots.forEach(slot => {
            const userDateStr = slot.userDate;
            if (!map[userDateStr]) {
              map[userDateStr] = [];
            }
            map[userDateStr].push(slot);
          });

          console.log(`✅ Processed ${convertedSlots.length} slots for ${date}`);
        });

        console.log(`🎯 Total available dates in ${userTimezone}: ${Object.keys(map).length}`);
        setDateSlotMap(map);

        // ✅ Auto-select first available slot
        const now = new Date();
        const sortedDates = Object.keys(map).sort();

        for (let dateStr of sortedDates) {
          const slots = map[dateStr];
          if (slots && slots.length > 0) {
            const firstSlot = slots[0];
            if (firstSlot.userDateObj > now) {
              setSelectedDate(new Date(dateStr));
              setSelectedTime("");
              console.log(`✅ Auto-selected: ${dateStr}`);
              return;
            }
          }
        }

        setSelectedDate(null);
        setSelectedTime("");
        console.log(`ℹ️ No future slots available`);
      } catch (err) {
        console.error("❌ Failed to fetch slots:", err);
        toast.error("Failed to load available slots");
      }
    };

    fetchSlotConfig();
  }, [userTimezone]);

  // ✅ FIXED: Convert UTC to user's timezone
  const convertUTCToUserTimezone = (utcDateISO, utcTimeSlot, userTimezone) => {
    try {
      console.log('🔵 Converting UTC to user timezone:', {
        utcDateISO,
        utcTimeSlot,
        userTimezone
      });

      // Split time range (e.g., "13:30-14:30")
      const [startTime, endTime] = utcTimeSlot.split('-');

      // Get UTC date in YYYY-MM-DD format
      const utcDateStr = dayjs(utcDateISO).utc().format('YYYY-MM-DD');

      // Parse UTC datetime
      const utcStart = dayjs.utc(`${utcDateStr} ${startTime}`);

      if (!utcStart.isValid()) {
        console.error('❌ Invalid UTC time:', utcDateStr, startTime);
        return {
          displayTime: utcTimeSlot,
          date: utcDateStr,
          dateObj: new Date(utcDateStr)
        };
      }

      console.log('🔵 Parsed UTC:', utcStart.format('YYYY-MM-DD HH:mm Z'));

      // ✅ Convert to user's timezone
      const userStart = utcStart.tz(userTimezone);
      const userEnd = userStart.add(1, 'hour');

      const result = {
        displayTime: `${userStart.format('h:mm A')}-${userEnd.format('h:mm A')}`,
        date: userStart.format('YYYY-MM-DD'),
        dateObj: userStart.toDate()
      };

      console.log('✅ Converted to user timezone:', {
        userTimezone,
        userTime: result.displayTime,
        userDate: result.date
      });

      return result;
    } catch (error) {
      console.error('❌ Conversion error:', error);
      return {
        displayTime: utcTimeSlot,
        date: dayjs(utcDateISO).format('YYYY-MM-DD'),
        dateObj: new Date(utcDateISO)
      };
    }
  };


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
  if (!selectedDate || !selectedTime) {
    return toast.error("📅 Please select a date and time.");
  }

  const emailValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email);
  if (!emailValid) return toast.error("📧 Enter a valid email address");

  const dateStr = format(selectedDate, "yyyy-MM-dd");
  const slotList = dateSlotMap[dateStr] || [];
  const selectedSlotObj = slotList.find((s) => s.displayTime === selectedTime);

  if (!selectedSlotObj) {
    return toast.error("❌ Selected time is invalid");
  }

  try {
    console.log('📤 ISRO Workshop Booking:', {
      userTime: selectedTime,
      userTimezone,
      timeSlotUTC: selectedSlotObj.timeUTC,
      dateUTC: selectedSlotObj.userDateObj.toISOString()
    });

    // ✅ Send UTC data to backend
    const response = await bookAppointment({
      ...form,
      date: dateStr,
      program: `ISRO MISSIONS WORKSHOP 5TH TO 9TH`,
      time: selectedTime, // User's local time (for display)
      dateUTC: selectedSlotObj.userDateObj.toISOString(), // ✅ UTC date
      timeSlotUTC: selectedSlotObj.timeUTC, // ✅ UTC time (e.g., "09:00-10:00")
      timezone: userTimezone, // User's timezone (should be "Asia/Kolkata" for India)
      counselorEmail: selectedSlotObj.counselorEmail,
      counselorId: selectedSlotObj.counselorId,
    });

    if (response.success || response.booking?._id) {
      setShowSuccess(true);
      toast.success(`✅ Booking confirmed for ${selectedTime} (${userTimezone})!`);
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
      batchNo: currentBatch !== null ? currentBatch.toString() : "100",
      parentConfirmed: false,
    });
    setSelectedDate(null);
    setSelectedTime("");
    setShowForm(false);
  };

  const selectedDateStr = selectedDate ? format(selectedDate, "yyyy-MM-dd") : null;

  // ✅ Show converted time slots
  const timeSlots =
    selectedDateStr && dateSlotMap[selectedDateStr]
      ? [...new Set(dateSlotMap[selectedDateStr].map((s) => s.displayTime))]
      : [];

  return (
    <div className="flex items-center justify-center min-h-screen bg-black text-black px-6 md:px-12 lg:px-20 py-10">
      <ToastContainer position="top-right" autoClose={3000} theme="colored" />
      <div className="w-full max-w-6xl">
        {/* ✅ Show timezone info */}
        <div className="mb-4 p-3 bg-blue-900/30 border border-blue-500/30 rounded-lg text-white text-sm">
          <div className="flex items-center gap-2">
            <span>🌍</span>
            <span>Your timezone: <strong>{userTimezone}</strong></span>
            <span className="ml-auto text-xs text-gray-400">All times shown in your local time</span>
          </div>
        </div>

        {!showForm ? (
          <DateTimeSelector
            timezone={userTimezone}
            setTimezone={setUserTimezone}
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
              userTimezone={userTimezone}
              getOneHourLater={getOneHourLater}
              setShowForm={setShowForm}
              handleSubmit={handleSubmit}
              handleChange={handleChange}
              batchOptions={batchOptions}
            />
          </div>
        )}
      </div>
      {showSuccess && <SuccessModal clientEmail={form.email} />}
    </div>
  );
};

export default BookingForm;
