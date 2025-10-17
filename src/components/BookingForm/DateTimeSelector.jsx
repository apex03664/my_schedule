import React, { useState } from "react";
import { format } from "date-fns";
import TimezoneSelect from 'react-timezone-select';

const DateTimeSelector = ({
  timezone,
  setTimezone,
  dateSlotMap,
  selectedDate,
  setSelectedDate,
  selectedTime,
  setSelectedTime,
  timeSlots,
  setShowForm,
}) => {
  const [showAllDates, setShowAllDates] = useState(false);

  const availableDates = Object.keys(dateSlotMap)
    .sort()
    .filter(dateStr => {
      const date = new Date(dateStr);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      return date >= today;
    });

  const displayedDates = showAllDates ? availableDates : availableDates.slice(0, 8);
  const selectedDateStr = selectedDate ? format(selectedDate, "yyyy-MM-dd") : null;

  return (
    <div className="min-h-screen bg-[#0A0E27] py-4 px-4 sm:py-8 sm:px-6">
      <div className="max-w-4xl mx-auto">

        {/* Header - Minimal & Elegant */}
        <div className="bg-[#131842] rounded-2xl p-6 mb-6 border border-[#1e2757]">
          <div className="flex items-center gap-4 mb-4">
            <img
              src="https://img.flexifunnels.com/images/4337/i2njq_776_WhatsAppImage20230920at17.44.38.jpeg"
              alt="Logo"
              className="w-14 h-14 rounded-full border-2 border-[#4F75FF]"
            />
            <div className="flex-1">
              <h1 className="text-xl sm:text-2xl font-bold text-white">
                Space Career Launch Pad
              </h1>
              <p className="text-sm text-gray-400 mt-1">
                Book your FREE counselling session
              </p>
            </div>
          </div>

          {/* Timezone - Clean Select */}
          <div className="flex items-center gap-3 bg-[#0A0E27] rounded-lg p-3 border border-[#1e2757]">
            <span className="text-xl">🌍</span>
            <div className="flex-1">
              <p className="text-xs text-gray-500">Timezone</p>
              <p className="text-sm text-white font-medium">{timezone.split('/')[1]}</p>
            </div>
            <TimezoneSelect
              value={timezone}
              onChange={(tz) => setTimezone(tz.value)}
              className="bg-black text-black"
            />
          </div>
        </div>

        {availableDates.length === 0 ? (
          <div className="text-center py-16 bg-[#131842] rounded-2xl border border-[#1e2757]">
            <div className="text-5xl mb-3">📅</div>
            <p className="text-white font-semibold mb-1">No Slots Available</p>
            <p className="text-sm text-gray-400">Check back later</p>
          </div>
        ) : (
          <div className="space-y-6">

            {/* Date Selection - Clean Cards */}
            <div>
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-base font-semibold text-white flex items-center gap-2">
                  📅 Select a Date
                </h3>
                <span className="text-xs px-2 py-1 bg-[#1e2757] text-gray-400 rounded-full">
                  {availableDates.length} available
                </span>
              </div>

              <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-2">
                {displayedDates.map((dateStr) => {
                  const date = new Date(dateStr);
                  const slotsCount = dateSlotMap[dateStr]?.length || 0;
                  const isSelected = selectedDateStr === dateStr;

                  return (
                    <button
                      key={dateStr}
                      onClick={() => {
                        setSelectedDate(date);
                        setSelectedTime("");
                      }}
                      className={`p-3 rounded-lg border transition-all ${isSelected
                        ? "bg-[#4F75FF] border-[#4F75FF]"
                        : "bg-[#131842] border-[#1e2757] hover:border-[#4F75FF]/50"
                        }`}
                    >
                      <div className="text-center">
                        <div className="text-[10px] text-gray-400 mb-0.5 uppercase">
                          {date.toLocaleString("en-US", { month: "short" })}
                        </div>
                        <div className={`text-xl font-bold mb-0.5 ${isSelected ? "text-white" : "text-white"}`}>
                          {date.getDate()}
                        </div>
                        <div className={`text-[10px] ${isSelected ? "text-blue-200" : "text-gray-500"}`}>
                          {date.toLocaleString("en-US", { weekday: "short" })}
                        </div>


                      </div>
                    </button>
                  );
                })}
              </div>


              {availableDates.length > 8 && (
                <button
                  onClick={() => setShowAllDates(!showAllDates)}
                  className="w-full mt-3 py-2 text-sm text-[#4F75FF] hover:text-white transition"
                >
                  {showAllDates ? "Show Less ↑" : `Show ${availableDates.length - 8} More ↓`}
                </button>
              )}
            </div>

            {/* Time Selection - Clean List */}
            <div>
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-base font-semibold text-white flex items-center gap-2">
                  🕐 Select a Time
                </h3>
                {timeSlots.length > 0 && (
                  <span className="text-xs px-2 py-1 bg-[#1e2757] text-gray-400 rounded-full">
                    {timeSlots.length} slots
                  </span>
                )}
              </div>

              {!selectedDate ? (
                <div className="text-center py-12 bg-[#131842] rounded-xl border border-[#1e2757]">
                  <div className="text-4xl mb-2">👈</div>
                  <p className="text-sm text-gray-400">Select a date first</p>
                </div>
              ) : timeSlots.length === 0 ? (
                <div className="text-center py-12 bg-[#131842] rounded-xl border border-[#1e2757]">
                  <div className="text-4xl mb-2">⏰</div>
                  <p className="text-sm text-gray-400">No slots available</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {timeSlots.map((slot) => {
                    const isSelected = selectedTime === slot;

                    return (
                      <button
                        key={slot}
                        onClick={() => setSelectedTime(slot)}
                        className={`w-full p-4 rounded-xl border transition-all text-left ${isSelected
                          ? "bg-[#4F75FF] border-[#4F75FF]"
                          : "bg-[#131842] border-[#1e2757] hover:border-[#4F75FF]/50"
                          }`}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <div className={`w-2 h-2 rounded-full ${isSelected ? "bg-white" : "bg-gray-600"
                              }`} />
                            <span className={`font-medium ${isSelected ? "text-white" : "text-white"}`}>
                              {slot}
                            </span>
                          </div>
                          {isSelected && <span className="text-white">✓</span>}
                        </div>
                      </button>
                    );
                  })}

                  {/* Continue Button - Minimal */}
                  {selectedTime && (
                    <div className="pt-4">
                      <div className="mb-4 p-4 bg-[#131842] rounded-xl border border-[#1e2757]">
                        <p className="text-xs text-gray-500 mb-1">Selected</p>
                        <p className="text-white font-medium">
                          {selectedDate.toLocaleDateString("en-GB", {
                            day: "numeric",
                            month: "long",
                            year: "numeric"
                          })}
                        </p>
                        <p className="text-[#4F75FF] font-semibold text-lg mt-1">{selectedTime}</p>
                      </div>

                      <button
                        onClick={() => setShowForm(true)}
                        className="w-full py-4 bg-[#4F75FF] hover:bg-[#6B8FFF] text-white font-semibold rounded-xl transition-all"
                      >
                        Continue to Registration →
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>

          </div>
        )}
      </div>
    </div>
  );
};

export default DateTimeSelector;
