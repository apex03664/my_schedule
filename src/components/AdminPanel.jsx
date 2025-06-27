import { useState, useEffect } from 'react';

const mockBookings = [
  { id: 1, name: 'Alice', date: '2025-06-28', time: '10:00', status: 'Confirmed' },
  { id: 2, name: 'Bob', date: '2025-06-28', time: '11:00', status: 'Confirmed' },
];

const AdminPanel = () => {
  const [bookings, setBookings] = useState([]);

  useEffect(() => {
    // TODO: Replace with real fetch from database
    setBookings(mockBookings);
  }, []);

  const handleCancel = (id) => {
    const updated = bookings.map((b) => b.id === id ? { ...b, status: 'Cancelled' } : b);
    setBookings(updated);
  };

  const handleReschedule = (id) => {
    const updated = bookings.map((b) =>
      b.id === id ? { ...b, date: prompt('New date (YYYY-MM-DD):'), time: prompt('New time (HH:MM):') } : b
    );
    setBookings(updated);
  };

  return (
    <div style={{ maxWidth: '600px', margin: 'auto' }}>
      <h3>Upcoming Bookings</h3>
      {bookings.length === 0 ? <p>No bookings found.</p> : (
        <ul>
          {bookings.map(({ id, name, date, time, status }) => (
            <li key={id} style={{ marginBottom: '10px' }}>
              <strong>{name}</strong> — {date} at {time} [{status}]
              <br />
              <button onClick={() => handleCancel(id)}>Cancel</button>{' '}
              <button onClick={() => handleReschedule(id)}>Reschedule</button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default AdminPanel;
