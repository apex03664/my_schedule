import { useState, useEffect } from 'react';
import {
  FiMail,
  FiPhone,
  FiMapPin,
  FiCalendar,
  FiX,
  FiRefreshCw
} from 'react-icons/fi';

const counselorList = ['Om Wakhare', 'Darshana', 'Priyanka', 'Sakshi'];

const ContactRow = ({ contact, onClick }) => {
  const { name, email, phone, location, source, initials } = contact;
  return (
    <div
      className="flex items-center py-3 px-4 hover:bg-[#2a2a2a] border-b border-gray-800 cursor-pointer"
      onClick={() => onClick(contact)}
    >
      <input type="checkbox" className="mr-4" />
      <div className="w-10 h-10 bg-gray-700 text-white rounded-full flex items-center justify-center mr-4 font-semibold">
        {initials}
      </div>
      <div className="flex-1">
        <div className="font-semibold text-sm text-white">{name}</div>
        <div className="text-xs text-gray-400">{email}</div>
      </div>
      <div className="w-32 text-sm text-white">{phone}</div>
      <div className="w-32 text-sm text-white">🇮🇳 {location}</div>
      <div className="text-xs text-blue-400 truncate max-w-xs">{source}</div>
    </div>
  );
};

const ContactsPage = () => {
  const [contacts, setContacts] = useState([]);
  const [selectedContact, setSelectedContact] = useState(null);
  const [showReschedule, setShowReschedule] = useState(false);
  const [rescheduleDate, setRescheduleDate] = useState('');
  const [rescheduleTime, setRescheduleTime] = useState('');
  const [selectedCounselor, setSelectedCounselor] = useState('');

  useEffect(() => {
    const appointments = JSON.parse(localStorage.getItem('appointments')) || [];
    const mappedContacts = appointments.map((a) => ({
      ...a,
      location: a.timezone || 'Unknown',
      source: 'Local Booking',
      initials: a.name
        .split(' ')
        .map((n) => n[0])
        .join('')
        .toUpperCase(),
    }));
    setContacts(mappedContacts);
  }, []);

  const cancelBooking = () => {
    const updated = contacts.filter((c) => c.email !== selectedContact.email);
    setContacts(updated);
    localStorage.setItem('appointments', JSON.stringify(updated));
    setSelectedContact(null);
  };

  const handleReschedule = () => {
    if (!rescheduleDate || !rescheduleTime || !selectedCounselor) return;

    const updatedContacts = contacts.map((c) =>
      c.email === selectedContact.email
        ? {
            ...c,
            rescheduled: true,
            newDate: rescheduleDate,
            newTime: rescheduleTime,
            counselor: selectedCounselor,
          }
        : c
    );

    setContacts(updatedContacts);
    localStorage.setItem('appointments', JSON.stringify(updatedContacts));
    setSelectedContact({
      ...selectedContact,
      rescheduled: true,
      newDate: rescheduleDate,
      newTime: rescheduleTime,
      counselor: selectedCounselor,
    });
    setShowReschedule(false);
    setRescheduleDate('');
    setRescheduleTime('');
    setSelectedCounselor('');
  };

  const getFutureDates = (days = 10) => {
    const today = new Date();
    return Array.from({ length: days }, (_, i) => {
      const d = new Date(today);
      d.setDate(today.getDate() + i + 1);
      return d.toISOString().split('T')[0];
    });
  };

  return (
   <div className="flex bg-[#121212] min-h-screen text-white">
      {/* Left Section */}
      <div className="flex-1 p-6 bg-[#1a1a1a]">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-2xl font-bold">Contacts</h2>
            <p className="text-sm text-gray-400">Manage your contacts and leads</p>
          </div>
          <button className="bg-white text-black px-4 py-2 rounded font-semibold">+ Add Contact</button>
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
          <input type="text" placeholder="Search..." className="px-2 py-1 bg-[#2a2a2a] rounded" />
        </div>

        {/* Contact List */}
        <div className="border border-gray-700 rounded-xl overflow-hidden divide-y divide-gray-800">
          {contacts.map((c, i) => (
            <div key={i} className="flex items-center justify-between px-4 py-3 hover:bg-[#2a2a2a] cursor-pointer" onClick={() => setSelectedContact(c)}>
              <div>
                <div className="font-semibold">{c.name}</div>
                <div className="text-sm text-gray-400">{c.email}</div>
              </div>
              <div className="text-right">
                <div className="text-sm">{c.phone}</div>
                <div className="text-xs text-gray-400">{c.location}</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Right Detail Panel */}
      {selectedContact && (
        <div className="w-[400px] bg-[#222] border-l border-gray-800 p-6 relative">
          <button onClick={() => setSelectedContact(null)} className="absolute top-4 right-4 text-gray-400 hover:text-white">
            <FiX size={20} />
          </button>
          <h3 className="text-2xl font-bold mb-4 flex items-center gap-2">
            <FiCalendar /> Booking Details
          </h3>
          <div className="space-y-2 mb-4">
            <p className="text-lg font-semibold">{selectedContact.name}</p>
            <p className="flex items-center text-sm text-gray-400 gap-2"><FiMail /> {selectedContact.email}</p>
            <p className="flex items-center text-sm text-gray-400 gap-2"><FiPhone /> {selectedContact.phone}</p>
            <p className="flex items-center text-sm text-gray-400 gap-2"><FiMapPin /> {selectedContact.location}</p>

            {selectedContact.rescheduled ? (
              <div className="bg-green-800 text-green-100 px-4 py-3 rounded-xl text-center font-medium shadow-md">
                ✅ Rescheduled to <br />
                <span className="text-lg font-bold">{selectedContact.newDate}</span> at <span className="text-lg font-bold">{selectedContact.newTime}</span><br />
                with <span className="underline">{selectedContact.counselor}</span>
              </div>
            ) : (
              <div className="bg-yellow-700 text-yellow-100 px-4 py-3 rounded-xl text-center font-medium shadow-md">
                ⏳ Scheduled on <br />
                <span className="text-lg font-bold">{selectedContact.date}</span> at <span className="text-lg font-bold">{selectedContact.time}</span>
              </div>
            )}
          </div>

          <div className="space-y-3 mt-6">
            <button onClick={cancelBooking} className="w-full py-2 bg-red-600 hover:bg-red-700 rounded font-semibold">
              ❌ Cancel Booking
            </button>
            <button onClick={() => setShowReschedule(true)} className="w-full py-2 bg-blue-600 hover:bg-blue-700 rounded font-semibold flex items-center justify-center gap-2">
              <FiRefreshCw /> Reschedule Booking
            </button>
          </div>
        </div>
      )}

      {/* Reschedule Modal */}
      {showReschedule && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-[#1e1e1e] p-6 rounded-xl w-[350px] text-white relative shadow-xl">
            <button onClick={() => setShowReschedule(false)} className="absolute top-4 right-4 text-gray-400 hover:text-white">
              <FiX />
            </button>
            <h3 className="text-xl font-bold mb-4">📆 Reschedule Booking</h3>

            <div className="space-y-3">
              <label className="text-sm">Select New Date:</label>
              <select value={rescheduleDate} onChange={(e) => setRescheduleDate(e.target.value)} className="w-full bg-gray-800 rounded p-2">
                <option value="">-- Select Date --</option>
                {getFutureDates(14).map((d) => (
                  <option key={d} value={d}>{d}</option>
                ))}
              </select>

              <label className="text-sm">Select Time:</label>
              <select value={rescheduleTime} onChange={(e) => setRescheduleTime(e.target.value)} className="w-full bg-gray-800 rounded p-2">
                <option value="">-- Select Time --</option>
                <option>2:00 PM</option>
                <option>4:00 PM</option>
                <option>6:00 PM</option>
                <option>8:00 PM</option>
              </select>

              <label className="text-sm">Assign Counselor:</label>
              <select value={selectedCounselor} onChange={(e) => setSelectedCounselor(e.target.value)} className="w-full bg-gray-800 rounded p-2">
                <option value="">-- Select --</option>
                {counselorList.map((c) => (
                  <option key={c}>{c}</option>
                ))}
              </select>

              <button className="w-full bg-green-600 hover:bg-green-700 py-2 rounded mt-4 font-semibold" onClick={handleReschedule}>
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
