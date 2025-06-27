import { useState } from 'react';

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
    countryCode: '+91',
  });

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

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log({ ...form, date: selectedDate, time: selectedTime, timezone });
    setForm({ name: '', email: '', phone: '' });
    setSelectedDate(null);
    setSelectedTime('');
    setShowForm(false);
    setShowSuccess(true);
    setTimeout(() => setShowSuccess(false), 3000);
  };

  const currentMonthDays = getMonthDays(currentYear, currentMonth);
  const timeSlots = ['2:00 PM', '4:00 PM', '6:00 PM', '8:00 PM'];

  return (
    <div className="flex items-center justify-center min-h-screen bg-white text-black px-4">
      <div className="w-full max-w-6xl grid grid-cols-1 md:grid-cols-4 gap-6">
        {/* Left Panel */}
        <div className="hidden md:flex flex-col border-r pr-6 col-span-1">
          <img
            src="https://upload.wikimedia.org/wikipedia/commons/thumb/0/0f/Esro_magica_logo.png/240px-Esro_magica_logo.png"
            alt="Logo"
            className="w-20 h-20 mx-auto mb-4"
          />
          <h2 className="text-xl font-bold text-center">Space Career Launch Pad - UPI PAID</h2>
          <p className="text-sm mt-4 text-center">
            Set your Counselling appointment to be part of the SUPER1000 Jr Space Scientist Program. How
            your child can become a scientist, astronaut & researcher in space science & tech. Both parents are encouraged to join.
          </p>
          <p className="mt-6 text-center text-gray-600">⏱ 1 hour</p>
        </div>

        {/* Main Panel */}
        {!showForm ? (
          <div className="col-span-3">
            <div className="text-center mb-4">
              <h3 className="text-xl font-semibold">Select a Date</h3>
              <p className="text-sm text-gray-500">Choose your preferred date and time</p>
            </div>
            <div className="flex flex-col md:flex-row gap-6 items-start">
              {/* Calendar */}
              <div className="w-full md:w-2/3 bg-gray-50 border border-gray-300 rounded-xl p-4">
                <div className="flex justify-between items-center mb-4">
                  <button
                    className="px-3 py-1 bg-gray-200 rounded hover:bg-gray-300 transition"
                    onClick={() => {
                      if (currentMonth === 0) {
                        setCurrentMonth(11);
                        setCurrentYear((prev) => prev - 1);
                      } else {
                        setCurrentMonth((prev) => prev - 1);
                      }
                    }}
                  >
                    ←
                  </button>
                  <h4 className="text-lg font-semibold">
                    {new Date(currentYear, currentMonth).toLocaleString('default', {
                      month: 'long',
                    })}{' '}
                    {currentYear}
                  </h4>
                  <button
                    className="px-3 py-1 bg-gray-200 rounded hover:bg-gray-300 transition"
                    onClick={() => {
                      if (currentMonth === 11) {
                        setCurrentMonth(0);
                        setCurrentYear((prev) => prev + 1);
                      } else {
                        setCurrentMonth((prev) => prev + 1);
                      }
                    }}
                  >
                    →
                  </button>
                </div>
                <div className="grid grid-cols-7 gap-2">
                  {currentMonthDays.map((day) => {
                    const isSelected =
                      selectedDate &&
                      day.getDate() === selectedDate.getDate() &&
                      day.getMonth() === selectedDate.getMonth() &&
                      day.getFullYear() === selectedDate.getFullYear();
                    return (
                      <button
                        key={day.toISOString()}
                        disabled={day < today}
                        className={`text-sm font-medium px-4 py-2 rounded-lg border transition-all duration-200 ${day < today
                            ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                            : isSelected
                              ? 'bg-black text-white font-semibold border-black shadow-md'
                              : 'bg-white text-gray-800 hover:bg-black hover:text-white hover:border-black cursor-pointer'
                          }`}
                        onClick={() => {
                          if (day >= today) {
                            setSelectedDate(day);
                          }
                        }}
                      >
                        {day.getDate()}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Time Slots */}
              <div className="w-full md:w-1/3 grid grid-cols-2 md:grid-cols-1 gap-2">
                <div className="text-sm font-medium text-center">Time Slots</div>
                {timeSlots.map((slot) => (
                  <button
                    key={slot}
                    onClick={() => {
                      if (selectedDate) {
                        setSelectedTime(slot);
                        setShowForm(true);
                      }
                    }}
                    className={`border border-gray-300 text-center py-2 rounded-lg transition-all duration-200 ${selectedDate
                        ? 'bg-white hover:bg-blue-600 hover:text-white cursor-pointer'
                        : 'cursor-not-allowed opacity-50'
                      } ${selectedTime === slot ? 'bg-blue-600 text-white font-semibold' : ''}`}
                  >
                    {slot}
                  </button>
                ))}
              </div>
            </div>
            <div className="mt-4 text-right">
              <label className="mr-2 text-sm">Timezone:</label>
              <select
                className="px-2 py-1 border border-gray-300 rounded"
                value={timezone}
                onChange={(e) => setTimezone(e.target.value)}
              >
                <option value="Asia/Kolkata">GMT+05:30 India</option>
                <option value="America/New_York">GMT-04:00 USA</option>
                <option value="Europe/London">GMT+01:00 UK</option>
                <option value="Asia/Dubai">GMT+04:00 Dubai</option>
              </select>
            </div>
          </div>
        ) : (
          <form
            onSubmit={handleSubmit}
            className="col-span-3 bg-white border rounded-xl p-6 shadow-lg space-y-4"
          >
            <h2 className="text-2xl font-bold text-center mb-2">
              Book for{' '}
              <span className="text-blue-600">
                {selectedDate?.toDateString()} at {selectedTime}
              </span>
            </h2>

            {/* Name */}
            <input
              type="text"
              name="name"
              placeholder="Full Name"
              value={form.name}
              onChange={handleChange}
              required
              className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-400 transition"
            />

            {/* Email */}
            <input
              type="email"
              name="email"
              placeholder="Email Address"
              value={form.email}
              onChange={handleChange}
              required
              className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-400 transition"
            />

            {/* Location */}
            <input
              type="text"
              name="location"
              placeholder="Your City / Location"
              value={form.location || ''}
              onChange={(e) => setForm({ ...form, location: e.target.value })}
              required
              className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-400 transition"
            />

            {/* Phone with Country Code */}
            <div className="flex gap-2">
              <select
                required
                className="w-1/3 px-3 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-400 transition"
                value={form.countryCode || '+91'}
                onChange={(e) => setForm({ ...form, countryCode: e.target.value })}
              >
                <option value="+91">🇮🇳 +91</option>
                <option value="+1">🇺🇸 +1</option>
                <option value="+44">🇬🇧 +44</option>
                <option value="+971">🇦🇪 +971</option>
              </select>
              <input
                type="tel"
                name="phone"
                placeholder="Phone Number"
                value={form.phone}
                onChange={handleChange}
                required
                className="w-2/3 px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-400 transition"
              />
            </div>

            {/* Buttons */}
            <div className="flex justify-between items-center pt-2">
              <button
                type="button"
                onClick={() => setShowForm(false)}
                className="px-5 py-2 bg-gray-200 hover:bg-gray-300 text-gray-800 text-sm font-semibold rounded-xl transition shadow-sm"
              >
                ⬅ Back
              </button>

              <button
                type="submit"
                disabled={
                  !form.name || !form.email || !form.phone || !form.location || !form.countryCode
                }
                className={`px-6 py-2 text-sm font-semibold rounded-xl transition transform shadow-md hover:scale-105 
        ${!form.name || !form.email || !form.phone || !form.location || !form.countryCode
                    ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                    : 'bg-blue-600 text-white hover:bg-blue-700'
                  }`}
              >
                🚀 Book Appointment
              </button>
            </div>
          </form>

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
