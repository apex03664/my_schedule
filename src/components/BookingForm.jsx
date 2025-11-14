import { useState, useEffect, useMemo } from "react";
import { bookAppointment, getAvailableSlots } from "./../../apis/apis";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';
import timezone from 'dayjs/plugin/timezone';
import SuccessModal from "./BookingForm/SuccessModel";
import RegistrationForm from "./BookingForm/RegistrationForm";
import DateTimeSelector from "./BookingForm/DateTimeSelector";
import useBatch from "./useBatch";

dayjs.extend(utc);
dayjs.extend(timezone);

const getUserTimezone = () => {
  try {
    const detected = Intl.DateTimeFormat().resolvedOptions().timeZone;
    // Default to Dubai for UAE region
    return detected.includes('Dubai') || detected.includes('UAE') ? 'Asia/Dubai' : detected;
  } catch (error) {
    return 'Asia/Dubai';
  }
};

const convertUTCToUserTimezone = (utcDateISO, utcTimeSlot, userTimezone) => {
  try {
    const [startTime] = utcTimeSlot.split('-');
    
    // ✅ Parse UTC date properly
    const utcDateStr = dayjs(utcDateISO).utc().format('YYYY-MM-DD');
    
    // ✅ Create UTC datetime
    const utcStart = dayjs.tz(`${utcDateStr} ${startTime}`, 'YYYY-MM-DD HH:mm', 'UTC');
    
    if (!utcStart.isValid()) {
      console.error('❌ Invalid UTC time:', utcDateStr, startTime);
      return {
        displayTime: utcTimeSlot,
        date: utcDateStr,
        dateObj: new Date(utcDateStr),
        utcDateTimeISO: utcDateISO
      };
    }
    
    // ✅ Convert to user's timezone
    const userStart = utcStart.tz(userTimezone);
    const userEnd = userStart.add(1, 'hour');
    
    return {
      displayTime: `${userStart.format('h:mm A')}-${userEnd.format('h:mm A')}`,
      date: userStart.format('YYYY-MM-DD'),
      dateObj: userStart.toDate(),
      utcDateTimeISO: utcStart.toISOString()
    };
  } catch (error) {
    console.error('❌ Conversion error:', error);
    return {
      displayTime: utcTimeSlot,
      date: dayjs(utcDateISO).format('YYYY-MM-DD'),
      dateObj: new Date(utcDateISO),
      utcDateTimeISO: utcDateISO
    };
  }
};

const BookingForm = () => {
  const { currentBatch } = useBatch();

  // ✅ Fixed batch logic
  const batchOptions = useMemo(() => {
    const options = [];
    if (currentBatch !== null && currentBatch > 0) {
      options.push(currentBatch);
      options.push(currentBatch - 1);
      options.push(currentBatch - 2);
    }
    return options.length > 0 ? options : [99, 98, 97]; // Fallback
  }, [currentBatch]);
  
  const [selectedDate, setSelectedDate] = useState(null);
  const [selectedTime, setSelectedTime] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [dateSlotMap, setDateSlotMap] = useState({});
// ✅ Initialize with user's detected timezone
const [userTimezone, setUserTimezone] = useState(() => {
  try {
    return Intl.DateTimeFormat().resolvedOptions().timeZone;
  } catch (error) {
    return 'Asia/Dubai';
  }
});

  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    location: "",
    grade: "",
    schoolName: "", // ✅ Optional school name field
    countryCode: "+971", // UAE
    batchNo: batchOptions[0]?.toString() || "99",
    parentConfirmed: false,
  });

  useEffect(() => {
    if (batchOptions.length > 0) {
      setForm((prev) => ({ ...prev, batchNo: batchOptions[0].toString() }));
    }
  }, [batchOptions]);

  // ✅ FIXED: Fetch and convert slots properly
  useEffect(() => {
    const fetchSlotConfig = async () => {
      try {
        const data = await getAvailableSlots();
        const map = {};

        console.log(`🌍 User timezone: ${userTimezone}`);
        console.log(`📥 Received ${data.length} dates from backend`);

        data.forEach(({ date, dateUTC, slots }) => {
          if (!slots || slots.length === 0) return;

          slots.forEach(slot => {
            // ✅ Convert UTC to user's timezone
            const converted = convertUTCToUserTimezone(dateUTC, slot.timeUTC, userTimezone);

            console.log(`🔄 ${slot.timeUTC} UTC → ${converted.displayTime} ${userTimezone}`);

            const convertedSlot = {
              ...slot,
              timeUTC: slot.timeUTC,
              displayTime: converted.displayTime,
              userDate: converted.date,
              userDateObj: converted.dateObj,
              utcDateTimeISO: converted.utcDateTimeISO
            };

            // ✅ Group by user's local date
            const userDateStr = convertedSlot.userDate;
            if (!map[userDateStr]) {
              map[userDateStr] = [];
            }
            map[userDateStr].push(convertedSlot);
          });
        });

        console.log(`🎯 Total available dates: ${Object.keys(map).length}`);
        setDateSlotMap(map);

        // ✅ Auto-select first future slot
        const now = dayjs();
        const sortedDates = Object.keys(map).sort();

        for (let dateStr of sortedDates) {
          const slots = map[dateStr];
          if (slots && slots.length > 0) {
            const firstSlot = slots[0];
            if (dayjs(firstSlot.userDateObj).isAfter(now)) {
              // ✅ Create date without timezone shift
              const [year, month, day] = dateStr.split('-').map(Number);
              setSelectedDate(new Date(year, month - 1, day));
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

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedDate || !selectedTime) {
      return toast.error("📅 Please select a date and time.");
    }

    const emailValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email);
    if (!emailValid) return toast.error("📧 Enter a valid email address");

    // ✅ Format date without timezone shift
    const dateStr = dayjs(selectedDate).format("YYYY-MM-DD");
    const slotList = dateSlotMap[dateStr] || [];
    const selectedSlotObj = slotList.find((s) => s.displayTime === selectedTime);
    
    if (!selectedSlotObj) {
      return toast.error("❌ Selected time is invalid");
    }

    try {
      console.log('📤 UAE Booking:', {
        userTime: selectedTime,
        userTimezone,
        timeSlotUTC: selectedSlotObj.timeUTC,
        dateUTC: selectedSlotObj.utcDateTimeISO
      });

      const response = await bookAppointment({
        ...form,
        date: dateStr,
        program: "ISRO MISSIONS WORKSHOP 5TH TO 9TH SATA",
        time: selectedTime,
        dateUTC: selectedSlotObj.utcDateTimeISO,
        timeSlotUTC: selectedSlotObj.timeUTC,
        timezone: userTimezone,
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
      schoolName: "", // ✅ Reset school name
      countryCode: "+971",
      batchNo: batchOptions[0]?.toString() || "99",
      parentConfirmed: false,
    });
    setSelectedDate(null);
    setSelectedTime("");
    setShowForm(false);
  };

  // ✅ Get date string without timezone shift
  const selectedDateStr = selectedDate ? dayjs(selectedDate).format("YYYY-MM-DD") : null;
  
  const timeSlots = selectedDateStr && dateSlotMap[selectedDateStr]
    ? [...new Set(dateSlotMap[selectedDateStr].map((s) => s.displayTime))]
    : [];

  return (
    <>
      <ToastContainer position="top-right" autoClose={3000} theme="colored" />
      {!showForm ? (
        <DateTimeSelector
          timezone={userTimezone}
          setTimezone={setUserTimezone}
          selectedDate={selectedDate}
          setSelectedDate={setSelectedDate}
          selectedTime={selectedTime}
          setSelectedTime={setSelectedTime}
          timeSlots={timeSlots}
          setShowForm={setShowForm}
          dateSlotMap={dateSlotMap}
        />
      ) : (
        <RegistrationForm
          form={form}
          setForm={setForm}
          selectedDate={selectedDate}
          selectedTime={selectedTime}
          userTimezone={userTimezone}
          setShowForm={setShowForm}
          handleSubmit={handleSubmit}
          handleChange={handleChange}
          batchOptions={batchOptions}
        />
      )}
      {showSuccess && <SuccessModal clientEmail={form.email} />}
    </>
  );
};

export default BookingForm;
