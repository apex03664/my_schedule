import { useState, useEffect } from "react";
import {
  FiMail,
  FiPhone,
  FiMapPin,
  FiCalendar,
  FiX,
  FiRefreshCw,
  FiUserCheck,
} from "react-icons/fi";
import ReactDatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { format } from "date-fns";

import { getAllBookings as fetchAllBookings } from "../../apis/apis.js";
import {
  cancelBooking as apiCancelBooking,
  rescheduleBooking as apiRescheduleBooking,
} from "../../apis/apis.js";

const counselorList = ["Om Wakhare", "Darshana", "Priyanka", "Sakshi"];

const ContactSkeleton = () => (
  <div className="flex items-center justify-between px-4 py-3 animate-pulse">
    <div>
      <div className="h-4 bg-gray-700 rounded w-24 mb-2" />
      <div className="h-3 bg-gray-600 rounded w-32" />
    </div>
    <div className="text-right">
      <div className="h-4 bg-gray-700 rounded w-16 mb-2" />
      <div className="h-3 bg-gray-600 rounded w-20" />
    </div>
  </div>
);

const ContactsPage = () => {
  const [contacts, setContacts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedContact, setSelectedContact] = useState(null);
  const [showReschedule, setShowReschedule] = useState(false);
  const [rescheduleDate, setRescheduleDate] = useState("");
  const [rescheduleTime, setRescheduleTime] = useState("");
  const [selectedCounselor, setSelectedCounselor] = useState("");

  useEffect(() => {
    const fetchData = async () => {
      try {
        const data = await fetchAllBookings();
        const mappedContacts = data.map((a) => ({
          ...a,
          location: a.location || "Unknown",
          source: "API Booking",
          initials: a.name
            .split(" ")
            .map((n) => n[0])
            .join("")
            .toUpperCase(),
        }));
        setContacts(mappedContacts);
      } catch (error) {
        console.error("Error fetching contacts:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const cancelBooking = async () => {
    try {
      const response = await apiCancelBooking(selectedContact._id); // Booking ID

      const updated = contacts.map((c) =>
        c._id === selectedContact._id ? { ...c, status: "cancelled" } : c
      );

      setContacts(updated);
    } catch (err) {
      console.error("Failed to cancel booking:", err.message || err);
      alert("Error cancelling booking");
    }
  };

  const handleReschedule = async () => {
    if (!rescheduleDate || !rescheduleTime || !selectedCounselor) return;

    try {
      const response = await apiRescheduleBooking(
        selectedContact._id,
        rescheduleDate,
        rescheduleTime
      );

      const updatedContacts = contacts.map((c) =>
        c._id === selectedContact._id
          ? {
              ...c,
              ...response.booking,
              rescheduled: true,
              // counselor: selectedCounselor,
            }
          : c
      );

      setContacts(updatedContacts);
      setSelectedContact({
        ...selectedContact,
        ...response.booking,
        rescheduled: true,
        counselor: selectedCounselor,
      });

      setShowReschedule(false);
      setRescheduleDate("");
      setRescheduleTime("");
      setSelectedCounselor("");
    } catch (err) {
      console.error("Failed to reschedule booking:", err.message || err);
      alert("Error rescheduling booking");
    }
  };

  return (
    <div className="flex bg-[#121212] min-h-screen text-white">
      {/* Left Panel */}
      <div className="flex-1 p-6 bg-[#1a1a1a]">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-2xl font-bold">Contacts</h2>
            <p className="text-sm text-gray-400">
              Manage your contacts and leads
            </p>
          </div>
          <button className="bg-white text-black px-4 py-2 rounded font-semibold">
            + Add Contact
          </button>
        </div>

        {/* Filters */}
        <div className="flex flex-wrap gap-2 mb-4 text-sm text-gray-300">
          <button className="px-3 py-1 bg-[#2a2a2a] rounded">Assign</button>
          <button className="px-3 py-1 bg-[#2a2a2a] rounded">Delete</button>
          <select className="bg-[#2a2a2a] px-2 py-1 rounded">
            <option>Assignee</option>
          </select>
          <select className="bg-[#2a2a2a] px-2 py-1 rounded">
            <option>Source</option>
          </select>
          <select className="bg-[#2a2a2a] px-2 py-1 rounded">
            <option>Tags</option>
          </select>
          <select className="bg-[#2a2a2a] px-2 py-1 rounded">
            <option>Follow-up date</option>
          </select>
          <input
            type="text"
            placeholder="Search..."
            className="px-2 py-1 bg-[#2a2a2a] rounded"
          />
        </div>
        {/* Scrollable List */}
        <div className="h-[80vh] overflow-y-auto border border-gray-700 rounded-xl divide-y divide-gray-800">
          <div className="grid grid-cols-5 gap-4 px-4 py-3 bg-[#2a2a2a] text-sm font-semibold text-gray-300 border-b border-gray-600">
            <div>Name</div>
            <div>Email</div>
            <div>Phone</div>
            <div>Location</div>
            <div>Counselor</div>
          </div>

          {loading
            ? Array.from({ length: 5 }).map((_, i) => (
                <ContactSkeleton key={i} />
              ))
            : contacts.slice(0, 20).map((c, i) => (
                <div
                  key={i}
                  className="grid grid-cols-5 gap-4 items-center px-4 py-3 hover:bg-[#2a2a2a] cursor-pointer text-sm"
                  onClick={() => setSelectedContact(c)}
                >
                  <div className="font-semibold">{c.name}</div>
                  <div className="text-gray-400">{c.email}</div>
                  <div>{c.phone}</div>
                  <div className="text-gray-400">{c.location}</div>
                  <div className="text-green-300 font-medium">
                    {c.counselor || "—"}
                  </div>
                </div>
              ))}
        </div>
      </div>

      {/* Right Panel */}
      {selectedContact && (
        <div className="w-[400px] bg-[#222] border-l border-gray-800 p-6 relative">
          <button
            onClick={() => setSelectedContact(null)}
            className="absolute top-4 right-4 text-gray-400 hover:text-white"
          >
            <FiX size={20} />
          </button>
          <h3 className="text-2xl font-bold mb-4 flex items-center gap-2">
            <FiCalendar /> Booking Details
          </h3>
          <div className="space-y-2 mb-4">
            <p className="text-lg font-semibold">{selectedContact.name}</p>
            <p className="flex items-center text-sm text-gray-400 gap-2">
              <FiMail /> {selectedContact.email}
            </p>
            <p className="flex items-center text-sm text-gray-400 gap-2">
              <FiPhone /> {selectedContact.phone}
            </p>
            <p className="flex items-center text-sm text-gray-400 gap-2">
              <FiMapPin /> {selectedContact.location}
            </p>
            {selectedContact.meetLink && (
              <p className="text-sm text-green-400 mt-2">
                📎 Meet Link:{" "}
                <a
                  href={selectedContact.meetLink}
                  className="underline"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  {selectedContact.meetLink}
                </a>
              </p>
            )}

            {selectedContact.counselor ? (
              <p className="text-sm text-yellow-400 mt-1">
                👤 Counselor: {selectedContact.counselor.name || "N/A"}
              </p>
            ) : (
              <p className="text-sm text-yellow-500 mt-1">👤 Counselor: N/A</p>
            )}

            {selectedContact.status === "cancelled" ? (
              <div className="bg-red-800 text-red-100 px-4 py-3 rounded-xl text-center font-medium">
                ❌ Booking Cancelled
              </div>
            ) : selectedContact.rescheduled ? (
              <div className="bg-green-800 text-green-100 px-4 py-3 rounded-xl text-center font-medium">
                ✅ Rescheduled to <br />
                <span className="text-lg font-bold">
                  {format(new Date(selectedContact.date), "dd-MM-yyyy")}
                </span>{" "}
                at{" "}
                <span className="text-lg font-bold">
                  {selectedContact.time}
                </span>
              </div>
            ) : (
              <div className="bg-yellow-700 text-yellow-100 px-4 py-3 rounded-xl text-center font-medium">
                ⏳ Scheduled on <br />
                <span className="text-lg font-bold">
                  {format(new Date(selectedContact.date), "dd-MM-yyyy")}
                </span>{" "}
                at{" "}
                <span className="text-lg font-bold">
                  {selectedContact.time}
                </span>
              </div>
            )}
          </div>

          <div className="space-y-3 mt-6">
            {selectedContact.status !== "cancelled" && (
              <button
                onClick={cancelBooking}
                className="w-full py-2 bg-red-600 hover:bg-red-700 rounded font-semibold"
              >
                ❌ Cancel Booking
              </button>
            )}
            <button
              onClick={() => setShowReschedule(true)}
              className="w-full py-2 bg-blue-600 hover:bg-blue-700 rounded font-semibold flex items-center justify-center gap-2"
            >
              <FiRefreshCw /> Reschedule Booking
            </button>
            <button className="w-full py-2 bg-purple-600 hover:bg-purple-700 rounded font-semibold flex items-center justify-center gap-2">
              <FiUserCheck /> Change Counselor
            </button>
          </div>
        </div>
      )}

      {/* Reschedule Modal */}
      {showReschedule && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-[#1a1a1a] p-6 rounded-lg w-[360px] text-white relative shadow-xl">
            <button
              onClick={() => setShowReschedule(false)}
              className="absolute top-4 right-4 text-gray-400 hover:text-white"
            >
              <FiX />
            </button>
            <h3 className="text-xl font-bold mb-4 text-center">
              📆 Reschedule Booking
            </h3>

            <div className="space-y-4">
              <label className="text-sm font-medium text-gray-300 mb-2 block">
                📅 Select New Date:
              </label>

              <div className="bg-[#2a2a2a] rounded-lg p-3 shadow-inner">
                <ReactDatePicker
                  selected={rescheduleDate}
                  onChange={(date) => setRescheduleDate(date)}
                  dateFormat="dd-MM-yyyy"
                  minDate={new Date()}
                  shouldCloseOnSelect={true}
                  className="w-full text-center bg-gray-900 text-white border border-gray-700 rounded px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  calendarClassName="!bg-gray-900 !text-white !rounded-lg !border-gray-700"
                  dayClassName={(date) =>
                    "text-sm hover:bg-blue-600 hover:text-white px-2 py-1 rounded-full " +
                    (date.getDate() === new Date().getDate()
                      ? "bg-blue-800 text-white"
                      : "")
                  }
                />
              </div>

              <label className="text-sm block">Select Time:</label>
              <select
                value={rescheduleTime}
                onChange={(e) => setRescheduleTime(e.target.value)}
                className="w-full bg-gray-800 rounded p-2"
              >
                <option value="">-- Select Time --</option>
                <option>2:00 PM</option>
                <option>4:00 PM</option>
                <option>6:00 PM</option>
                <option>8:00 PM</option>
              </select>

              <label className="text-sm block">Assign Counselor:</label>
              <select
                value={selectedCounselor}
                onChange={(e) => setSelectedCounselor(e.target.value)}
                className="w-full bg-gray-800 rounded p-2"
              >
                <option value="">-- Select --</option>
                {counselorList.map((c) => (
                  <option key={c}>{c}</option>
                ))}
              </select>

              <button
                className="w-full bg-green-600 hover:bg-green-700 py-2 rounded mt-4 font-semibold"
                onClick={handleReschedule}
              >
                ✅ Confirm Reschedule
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ContactsPage;
