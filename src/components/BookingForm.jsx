import { useState, useEffect } from "react";
import { bookAppointment, getAvailableSlots } from "./../../apis/apis";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';
import timezone from 'dayjs/plugin/timezone';
import SuccessModal from "./BookingForm/SuccessModel";
import RegistrationForm from "./BookingForm/RegistrationForm";
import DateTimeSelector from "./BookingForm/DateTimeSelector";
import { format } from "date-fns";
import useBatch from "./useBatch.jsx";

dayjs.extend(utc);
dayjs.extend(timezone);

const getUserTimezone = () => {
  try {
    return Intl.DateTimeFormat().resolvedOptions().timeZone;
  } catch (error) {
    return 'Asia/Kolkata';
  }
};

const convertUTCToUserTimezone = (utcDateISO, utcTimeSlot, userTimezone) => {
  try {
    const [startTime] = utcTimeSlot.split('-');
    const utcDateStr = dayjs(utcDateISO).utc().format('YYYY-MM-DD');
    const utcStart = dayjs.utc(`${utcDateStr} ${startTime}`);
    
    if (!utcStart.isValid()) {
      return {
        displayTime: utcTimeSlot,
        date: utcDateStr,
        dateObj: new Date(utcDateStr)
      };
    }
    
    const userStart = utcStart.tz(userTimezone);
    const userEnd = userStart.add(1, 'hour');
    
    return {
      displayTime: `${userStart.format('h:mm A')}-${userEnd.format('h:mm A')}`,
      date: userStart.format('YYYY-MM-DD'),
      dateObj: userStart.toDate()
    };
  } catch (error) {
    return {
      displayTime: utcTimeSlot,
      date: dayjs(utcDateISO).format('YYYY-MM-DD'),
      dateObj: new Date(utcDateISO)
    };
  }
};

const BookingForm = () => {
  const { currentBatch } = useBatch();

  const batchOptions = [];
  if (currentBatch !== null) {
    batchOptions.push(currentBatch);
    batchOptions.push(currentBatch - 1);
    batchOptions.push(currentBatch - 2);
  } else {
    batchOptions.push("Can't fetch! Kindly book and inform us");
  }

  const [selectedDate, setSelectedDate] = useState(null);
  const [selectedTime, setSelectedTime] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [dateSlotMap, setDateSlotMap] = useState({});
  const [userTimezone, setUserTimezone] = useState(getUserTimezone());

  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    location: "",
    grade: "",
    schoolName: "", // ✅ Optional school name field
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
    const fetchSlotConfig = async () => {
      try {
        const data = await getAvailableSlots();
        const map = {};

        data.forEach(({ date, dateUTC, slots }) => {
          if (!slots || slots.length === 0) return;

          const convertedSlots = slots.map(slot => {
            const converted = convertUTCToUserTimezone(dateUTC, slot.timeUTC, userTimezone);
            
            return {
              ...slot,
              timeUTC: slot.timeUTC,
              displayTime: converted.displayTime,
              userDate: converted.date,
              userDateObj: converted.dateObj
            };
          });

          convertedSlots.forEach(slot => {
            const userDateStr = slot.userDate;
            if (!map[userDateStr]) {
              map[userDateStr] = [];
            }
            map[userDateStr].push(slot);
          });
        });

        setDateSlotMap(map);

        const now = new Date();
        const sortedDates = Object.keys(map).sort();
        
        for (let dateStr of sortedDates) {
          const slots = map[dateStr];
          if (slots && slots.length > 0) {
            const firstSlot = slots[0];
            if (firstSlot.userDateObj > now) {
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

  const dateStr = format(selectedDate, "yyyy-MM-dd");
  const slotList = dateSlotMap[dateStr] || [];
  const selectedSlotObj = slotList.find((s) => s.displayTime === selectedTime);
  
  if (!selectedSlotObj) {
    return toast.error("❌ Selected time is invalid");
  }

  try {
    console.log('📤 Little Scientist Booking:', {
      userTime: selectedTime,
      userTimezone,
      timeSlotUTC: selectedSlotObj.timeUTC,
      dateUTC: selectedSlotObj.userDateObj.toISOString()
    });

    const response = await bookAppointment({
      ...form,
      date: dateStr,
      program: "LITTLE SCIENTIST 1ST-4TH",
      time: selectedTime, // User's local time
      dateUTC: selectedSlotObj.userDateObj.toISOString(), // ✅ UTC date
      timeSlotUTC: selectedSlotObj.timeUTC, // ✅ UTC time
      timezone: userTimezone, // User's timezone
      counselorEmail: selectedSlotObj.counselorEmail,
      counselorId: selectedSlotObj.counselorId,
    });

    if (response.success || response.booking?._id) {
      setShowSuccess(true);
      toast.success(`✅ Booking confirmed for ${selectedTime}!`);
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
      countryCode: "+91",
      batchNo: currentBatch !== null ? currentBatch.toString() : "100",
      parentConfirmed: false,
    });
    setSelectedDate(null);
    setSelectedTime("");
    setShowForm(false);
  };

  const selectedDateStr = selectedDate ? format(selectedDate, "yyyy-MM-dd") : null;
  const timeSlots =
    selectedDateStr && dateSlotMap[selectedDateStr]
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
