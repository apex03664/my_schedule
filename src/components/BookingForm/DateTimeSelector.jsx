import React from "react";

const DateTimeSelector = ({
  timezone,
  setTimezone,
  currentMonth,
  setCurrentMonth,
  currentYear,
  setCurrentYear,
  currentMonthDays,
  today,
  selectedDate,
  setSelectedDate,
  selectedTime,
  setSelectedTime,
  timeSlots,
  setShowForm,
}) => {
  
  return (
    <div className="bg-black text-white rounded-3xl p-6 shadow-xl datetime-container  border border-gray-700 rounded-2xl transition-all   ">
      {/* Side Panel */}
      <div className="w-full md:w-1/3 flex b-2 b flex-col gap-4">
        <img src="https://img.flexifunnels.com/images/4337/i2njq_776_WhatsAppImage20230920at17.44.38.jpeg" alt="Logo" className="w-20 h-20 rounded-full" />
        <div>
          <h2 className="text-xl font-bold">Space Career Launch Pad- UPI PAID</h2>
          <p className="text-gray-400 text-sm mt-2">
            Set your Counselling appointment to be the part of SUPER1000 Jr Space Scientist Program. How your child can become the scientist, astronaut & research person in the field of Space Science and technology. Both...
          </p>
        </div>
        <div className="bg-gray-800 px-3 py-1 rounded-full text-sm w-fit">1 hour</div>
      </div>

      {/* Calendar Section */}
      <div className="w-full w-full md:w-1/3 ">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-sm font-bold">Select a Date & Time</h3>
          <div className="flex items-center gap-2">
            <select
              value={timezone}
              onChange={(e) => setTimezone(e.target.value)}
              className="bg-black border border-gray-700 px-1 py-1 rounded-md text-xs"
            >
              <option value="Asia/Kolkata">GMT+05:30 🇮🇳</option>
              <option value="America/New_York">GMT-04:00 🇺🇸</option>
              <option value="Europe/London">GMT+01:00 🇬🇧</option>
              <option value="Asia/Dubai">GMT+04:00 🇦🇪</option>
            </select>
            <div className="bg-black border border-gray-700 px-3 py-1 rounded-md text-sm">60m</div>
          </div>
        </div>

        <div className="flex justify-between items-center mb-3">
          <button
            onClick={() => {
              if (currentMonth === 0) {
                setCurrentMonth(11);
                setCurrentYear((prev) => prev - 1);
              } else {
                setCurrentMonth((prev) => prev - 1);
              }
            }}
            className="text-xl px-3 py-1 rounded bg-gray-800 hover:bg-gray-700"
          >
            ←
          </button>
          <div className="text-lg font-semibold">
            {new Date(currentYear, currentMonth).toLocaleString("default", { month: "long" })} {currentYear}
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
            className="text-xl px-3 py-1 rounded bg-gray-800 hover:bg-gray-700"
          >
            →
          </button>
        </div>

        <div className="grid grid-cols-7 gap-2 text-center">
          {["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"].map((d) => (
            <div key={d} className="text-sm text-gray-400 font-semibold">{d}</div>
          ))}
         {currentMonthDays.map((day, index) => {
  if (day === null) {
    return <div key={index} className="py-2" />; // empty cell for padding
  }

  const isPast = day < today.setHours(0, 0, 0, 0);
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
            : "bg-gray-800 text-white hover:bg-white hover:text-black"}`}
    >
      {day.getDate()}
    </button>
  );
})}

        </div>
      </div>

      {/* Time Slots Section */}
      <div className="w-full  md:w-1/3">
        <div className="mb-4 text-base  text-gray-400">
          Selected:
          <span className="text-white font-semibold">
            {selectedDate?.toLocaleDateString("en-GB")} at {selectedTime}
          </span>
        </div>

        <div className="flex justify-between mb-3 text-xs text-gray-400">
          <span className="bg-gray-800 px-3 py-1 rounded-full">12h</span>
          <span className="bg-gray-800 px-3 py-1 rounded-full">24h</span>
        </div>

        <div className="space-y-2 flex  items-center flex-col">
          {timeSlots.length > 0 ? (
            timeSlots.map((slot) => (
              <button
                key={slot}
                onClick={() => {
                  if (selectedDate) {
                    setSelectedTime(slot);
                    setShowForm(true);
                  }
                }}
                className={` py-2 w-full  text-sm rounded-md border border-gray-700 transition-all flex justify-center items-center gap-2
          ${selectedDate
                    ? selectedTime === slot
                      ? "bg-blue-600 text-white"
                      : "bg-black text-white hover:bg-blue-700"
                    : "opacity-50 cursor-not-allowed"}`}
              >
                <span className="w-2 h-2 bg-green-400 rounded-full inline-block"></span>
                {slot}
              </button>
            ))
          ) : (
            <div className="border border-red-600 text-red-500 px-4 py-6 rounded text-center text-sm">
              <p>
                No slots available on{" "}
                {selectedDate?.toLocaleString("default", { month: "short" })},{" "}
                {selectedDate?.getFullYear()}
              </p>
              <button
                onClick={() => {
                  if (currentMonth === 11) {
                    setCurrentMonth(0);
                    setCurrentYear((prev) => prev + 1);
                  } else {
                    setCurrentMonth((prev) => prev + 1);
                  }
                }}
                className="mt-2 px-3 py-1 bg-red-600 text-white rounded hover:bg-red-700 text-sm"
              >
                Next month
              </button>
            </div>
          )}
        </div>

      </div>
    </div>
  );
};

export default DateTimeSelector;
