import { useState, useEffect } from 'react';
import { Trash2 } from 'lucide-react'; // optional: install lucide-react icons

const PagesPage = () => {
  const [counsellors, setCounsellors] = useState([]);
  const [form, setForm] = useState({ name: '', phone: '', email: '' });

  // Load counsellors from localStorage on mount
  useEffect(() => {
    const stored = JSON.parse(localStorage.getItem('counsellors')) || [];
    setCounsellors(stored);
  }, []);

  // Save counsellors to localStorage when updated
  useEffect(() => {
    localStorage.setItem('counsellors', JSON.stringify(counsellors));
  }, [counsellors]);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleAdd = (e) => {
    e.preventDefault();
    if (!form.name || !form.phone || !form.email) return;
    const newEntry = { ...form };
    setCounsellors([...counsellors, newEntry]);
    setForm({ name: '', phone: '', email: '' });
  };

  const handleDelete = (index) => {
    const updated = counsellors.filter((_, i) => i !== index);
    setCounsellors(updated);
  };

  return (
    <div className="p-6 text-white min-h-screen bg-gradient-to-br from-[#1e1e2f] to-[#0d0d17]">
      <h2 className="text-2xl font-bold mb-6">📄 Manage Counsellor Pages</h2>

      {/* Form */}
      <form
        onSubmit={handleAdd}
        className="bg-[#2a2a3d] rounded-xl p-4 md:p-6 grid grid-cols-1 md:grid-cols-3 gap-4 mb-8 shadow-lg"
      >
        <input
          type="text"
          name="name"
          value={form.name}
          onChange={handleChange}
          placeholder="Counsellor Name"
          className="px-4 py-2 rounded-lg bg-[#1f1f2e] border border-gray-600 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <input
          type="tel"
          name="phone"
          value={form.phone}
          onChange={handleChange}
          placeholder="Phone Number"
          className="px-4 py-2 rounded-lg bg-[#1f1f2e] border border-gray-600 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <input
          type="email"
          name="email"
          value={form.email}
          onChange={handleChange}
          placeholder="Email Address"
          className="px-4 py-2 rounded-lg bg-[#1f1f2e] border border-gray-600 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <button
          type="submit"
          className="md:col-span-3 bg-blue-600 hover:bg-blue-700 text-white py-2 rounded-lg font-semibold transition mt-2"
        >
          ➕ Add Counsellor
        </button>
      </form>

      {/* List */}
      {counsellors.length === 0 ? (
        <p className="text-gray-400">No counsellors added yet.</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {counsellors.map((c, idx) => (
            <div
              key={idx}
              className="bg-[#202030] p-5 rounded-xl border border-gray-700 shadow-md hover:shadow-blue-500/20 transition group relative"
            >
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="text-lg font-bold text-white">{c.name}</h3>
                  <p className="text-sm text-gray-300 mt-1">📞 {c.phone}</p>
                  <p className="text-sm text-gray-300">📧 {c.email}</p>
                </div>
                <button
                  onClick={() => handleDelete(idx)}
                  className="text-red-400 hover:text-red-600 transition p-1"
                  title="Delete"
                >
                  <Trash2 size={18} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default PagesPage;
