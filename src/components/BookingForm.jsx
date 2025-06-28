import { useState } from 'react';
import { useEffect } from 'react';
import { gapi } from 'gapi-script';

const CLIENT_ID = '827753309559-8221tcmudchmjlbnl8da2qmoo2dqlp5j.apps.googleusercontent.com';
const SCOPES = 'https://www.googleapis.com/auth/calendar.events';

const BookingForm = () => {
  const today = new Date();
  const [selectedDate, setSelectedDate] = useState(null);
  const [selectedTime, setSelectedTime] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({
    name: '',
    email: '',
    phone: '',
    location: '',
    grade: '',
    countryCode: '+91',
    parentConfirmed: false,
  });


  useEffect(() => {
    const initClient = () => {
      gapi.client.init({
        clientId: CLIENT_ID,
        scope: SCOPES,
      });
    };

    gapi.load('client:auth2', initClient);
  }, []);

  const [currentMonth, setCurrentMonth] = useState(today.getMonth());
  const [currentYear, setCurrentYear] = useState(today.getFullYear());
  const [timezone, setTimezone] = useState('Asia/Kolkata');
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

  const handleSubmit = async (e) => {
    e.preventDefault();

    const newAppointment = {
      ...form,
      date: selectedDate,
      time: selectedTime,
      timezone,
      createdAt: new Date().toISOString(),
    };

    // Generate GMeet link via Calendar
    const meetLink = await createCalendarEvent(newAppointment);
    newAppointment.meetLink = meetLink;
    console.log(meetLink);

    const storedAppointments = JSON.parse(localStorage.getItem('appointments')) || [];
    storedAppointments.push(newAppointment);
    localStorage.setItem('appointments', JSON.stringify(storedAppointments));

    console.log('Saved appointment:', newAppointment);

    setForm({ name: '', email: '', phone: '' });
    setSelectedDate(null);
    setSelectedTime('');
    setShowForm(false);
    setShowSuccess(true);
    setTimeout(() => setShowSuccess(false), 3000);
  };
  const createCalendarEvent = async (appointment) => {
    try {
      const isSignedIn = gapi.auth2.getAuthInstance().isSignedIn.get();

      if (!isSignedIn) {
        await gapi.auth2.getAuthInstance().signIn();
      }

      const event = {
        summary: `Counselling: ${appointment.name}`,
        location: appointment.location,
        description: `Counselling session with ${appointment.name}`,
        start: {
          dateTime: new Date(`${appointment.date.toDateString()} ${appointment.time}`).toISOString(),
          timeZone: appointment.timezone,
        },
        end: {
          dateTime: new Date(
            new Date(`${appointment.date.toDateString()} ${appointment.time}`).getTime() + 60 * 60 * 1000
          ).toISOString(),
          timeZone: appointment.timezone,
        },
        attendees: [{ email: appointment.email }],
        conferenceData: {
          createRequest: {
            requestId: `esro-${Date.now()}`,
            conferenceSolutionKey: {
              type: 'hangoutsMeet',
            },
          },
        },
      };

      const request = gapi.client.calendar.events.insert({
        calendarId: 'primary',
        resource: event,
        conferenceDataVersion: 1,
      });

      const response = await request.execute();
      console.log('📅 Google Meet Created:', response?.hangoutLink || response?.htmlLink);
      return response?.hangoutLink || '';
    } catch (err) {
      console.error('Google Calendar error:', err);
      return '';
    }
  };


  const currentMonthDays = getMonthDays(currentYear, currentMonth);
  const timeSlots = ['2:00 PM', '4:00 PM', '6:00 PM', '8:00 PM'];

  return (
    <div className="flex items-center justify-center min-h-screen bg-white text-black px-4">
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

          <h2 className="text-lg font-semibold text-white">Space Career Launch Pad – UPI PAID</h2>

          <p className="text-sm text-gray-400">
            Set your Counselling appointment to be the part of
            <span className="font-semibold text-white"> SUPER1000 Jr Space Scientist Program</span>. How your child
            can become the scientist, astronaut & research person in the field of Space Science and technology.
          </p>

          <button className="text-sm text-blue-400 mt-2 hover:underline">+ Show more</button>

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

                <select
                  className="bg-black border border-gray-700 px-3 py-1 rounded-md text-sm"
                  disabled
                >
                  <option>60m</option>
                </select>
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
                    {new Date(currentYear, currentMonth).toLocaleString('default', {
                      month: 'long',
                    })}{" "}
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
                    <div key={d} className="text-sm text-gray-400 font-semibold">
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
                <div className="text-sm font-semibold text-gray-300 mb-3">
                  {selectedDate ? selectedDate.toDateString() : "Pick a Date"}
                </div>

                {/* 12h/24h toggle placeholder */}
                <div className="flex justify-between mb-3 text-xs text-gray-400">
                  <span className="bg-gray-800 px-3 py-1 rounded-full">12h</span>
                  <span className="bg-gray-800 px-3 py-1 rounded-full">24h</span>
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
                <button className="text-sm text-gray-400 mb-4 hover:text-white">← Back</button>

                <img
                  src="https://upload.wikimedia.org/wikipedia/commons/thumb/0/0f/Esro_magica_logo.png/240px-Esro_magica_logo.png"
                  alt="EsroMagica Logo"
                  className="w-16 h-16 rounded-full mb-4"
                />

                <h2 className="text-lg font-bold mb-2 text-white">Space Career Launch Pad – UPI PAID</h2>

                <p className="text-sm text-gray-400 leading-relaxed mb-2">
                  Set your Counselling appointment to be the part of <strong>SUPER1000 Jr Space Scientist Program</strong>. How your child can become the scientist, astronaut & research person in the field of Space Science and technology.
                </p>

                <button className="text-sm text-blue-400 hover:underline mb-2">+ Show more</button>

                <span className="flex items-center text-sm text-gray-400 gap-1 mt-2">
                  ⏱ <span className="bg-gray-700 text-white px-2 py-0.5 rounded-full text-xs">1 hour</span>
                </span>
              </div>

              {/* FORM PANEL */}
              <form
                onSubmit={handleSubmit}
                className="col-span-3 bg-black text-white rounded-none md:rounded-r-2xl p-6 space-y-6 transition-all"
              >
                <h3 className="text-xl font-bold mb-4">Registration</h3>

                <div className="mb-4">
                  <div className="flex items-center gap-4">
                    <div className="bg-white text-black font-bold px-3 py-2 rounded-lg text-center">
                      <div className="text-sm leading-none">JUN</div>
                      <div className="text-2xl">30</div>
                    </div>
                    <div>
                      <div className="font-medium">Monday, 30 June</div>
                      <div className="text-sm text-gray-400">8:30 PM – 9:30 PM (GMT+5:30)</div>
                    </div>
                  </div>
                </div>

                {/* Name */}
                <div>
                  <label className="block font-semibold mb-1">Name <span className="text-red-500">*</span></label>
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
                  <label className="block font-semibold mb-1">Email address <span className="text-red-500">*</span></label>
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
                  <label className="block font-semibold mb-1">Mobile number <span className="text-red-500">*</span></label>
                  <div className="flex gap-2">
                    <select
                      required
                      className="w-1/3 px-3 py-2 border border-gray-700 bg-transparent text-white rounded-lg focus:ring-2 focus:ring-blue-500"
                      value={form.countryCode || "+91"}
                      onChange={(e) => setForm({ ...form, countryCode: e.target.value })}
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
                  <label className="block font-semibold mb-1">What is your City & State Name? <span className="text-red-500">*</span></label>
                  <input
                    type="text"
                    name="location"
                    placeholder="City & State"
                    value={form.location || ""}
                    onChange={(e) => setForm({ ...form, location: e.target.value })}
                    required
                    className="w-full px-4 py-2 bg-transparent border border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                {/* Grade */}
                <div>
                  <label className="block font-semibold mb-2">GRADE of Student <span className="text-red-500">*</span></label>
                  <div className="space-y-1">
                    {["GRADE 3-4", "GRADE 5-7", "GRADE 8-10", "GRADE 11-12"].map((g) => (
                      <label key={g} className="flex items-center gap-2">
                        <input
                          type="radio"
                          name="grade"
                          value={g}
                          checked={form.grade === g}
                          onChange={(e) => setForm({ ...form, grade: e.target.value })}
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
                    Please confirm that both parents are available with student for this Family Counselling session! <span className="text-red-500">*</span>
                  </label>
                  <label className="flex items-center gap-2 mt-1">
                    <input
                      type="checkbox"
                      required
                      checked={form.parentConfirmed || false}
                      onChange={(e) => setForm({ ...form, parentConfirmed: e.target.checked })}
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
                      !form.email ||
                      !form.phone ||
                      !form.location ||
                      !form.grade ||
                      !form.parentConfirmed
                    }
                    className={`px-6 py-2 rounded-lg transition font-semibold ${!form.name ||
                      !form.email ||
                      !form.phone ||
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
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 transition">
          <div className="bg-white rounded-xl p-6 shadow-xl text-center">
            <h3 className="text-xl font-bold text-green-600 mb-2">✅ Appointment Scheduled!</h3>
            <p className="text-gray-700">Your counselling session has been booked successfully.</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default BookingForm;
