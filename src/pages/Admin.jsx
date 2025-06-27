import { useState } from 'react';
import { FiUsers, FiSettings, FiCalendar, FiFileText } from 'react-icons/fi';

const Sidebar = ({ activePage, setActivePage }) => (
  <aside className="bg-[#111] text-white w-64 min-h-screen p-5">
    <h1 className="text-2xl font-bold text-white mb-10">Esromagica</h1>
    <nav className="space-y-6 text-base">
      <button onClick={() => setActivePage('dashboard')} className={`flex items-center gap-3 ${activePage === 'dashboard' ? 'text-white' : 'text-gray-300'} hover:text-white`}><FiCalendar /> Dashboard</button>
      <button onClick={() => setActivePage('contacts')} className={`flex items-center gap-3 ${activePage === 'contacts' ? 'text-white' : 'text-gray-300'} hover:text-white`}><FiUsers /> Contacts</button>
      <button onClick={() => setActivePage('pages')} className={`flex items-center gap-3 ${activePage === 'pages' ? 'text-white' : 'text-gray-300'} hover:text-white`}><FiFileText /> Pages</button>
      <button onClick={() => setActivePage('settings')} className={`flex items-center gap-3 ${activePage === 'settings' ? 'text-white' : 'text-gray-300'} hover:text-white`}><FiSettings /> Settings</button>
      <button onClick={() => setActivePage('account')} className={`flex items-center gap-3 ${activePage === 'account' ? 'text-white' : 'text-gray-300'} hover:text-white`}>Account</button>
    </nav>
    <div className="absolute bottom-10 left-5 text-sm text-gray-400">emapex04@esromagica.com</div>
  </aside>
);

const ContactRow = ({ name, email, phone, location, source, initials }) => (
  <div className="flex items-center py-3 px-4 hover:bg-[#1a1a1a] border-b border-gray-800">
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

const ContactsPage = () => {
  const contacts = [
    { name: 'E A Riona Akasapu', email: 'akasapuriona@gmail.com', phone: '+91 8179491911', location: 'Pune, IN', source: 'https://esromagica.dayschedule.com/space-career-launch-pad-upi-paid', initials: 'EA' },
    { name: 'Aarush', email: 'aparnashavukaru.as@gmail.com', phone: '+91 6304401931', location: 'Pune, IN', source: 'https://esromagica.dayschedule.com/space-career-launch-pad-upi-paid', initials: 'A' },
    { name: 'Batharaju Bhanu Rudhra', email: 'bshivramcharanbatharaju@gmail.com', phone: '+91 8464829694', location: 'Pune, IN', source: 'https://esromagica.dayschedule.com/space-career-launch-pad-upi-paid', initials: 'BB' },
    { name: 'HARDIK NANDKUMAR KHANVILKAR', email: 'priyakhanvilkar26@gmail.com', phone: '+91 9930542328', location: 'Pune, IN', source: 'https://esromagica.dayschedule.com/space-career-launch-pad-upi-paid', initials: 'HN' },
    { name: 'Shlok More', email: 'pramodmore198@gmail.com', phone: '+91 9975269923', location: 'Pune, IN', source: 'https://esromagica.dayschedule.com/space-career-launch-pad-upi-paid', initials: 'SM' },
  ];

  return (
    <div className="p-6 bg-[#1a1a1a] shadow rounded-xl text-white">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-2xl font-bold">Contacts</h2>
        <button className="bg-blue-600 text-white text-sm px-4 py-2 rounded hover:bg-blue-700">+ Add Contact</button>
      </div>
      <div className="flex flex-wrap gap-2 mb-4 text-sm">
        <button className="bg-gray-800 text-white px-3 py-1 rounded">Assign (0)</button>
        <button className="bg-gray-800 text-white px-3 py-1 rounded">Delete (0)</button>
        <select className="bg-gray-800 text-white px-3 py-1 rounded">
          <option>Assignee</option>
        </select>
        <select className="bg-gray-800 text-white px-3 py-1 rounded">
          <option>Source</option>
        </select>
        <select className="bg-gray-800 text-white px-3 py-1 rounded">
          <option>Tags</option>
        </select>
        <input type="text" placeholder="Search..." className="bg-gray-800 text-white px-3 py-1 rounded" />
      </div>
      <div className="border border-gray-700 rounded-xl overflow-hidden">
        {contacts.map((c, i) => (
          <ContactRow key={i} {...c} />
        ))}
      </div>
    </div>
  );
};

const DashboardPage = () => <div className="p-6 text-white">📊 <strong>Dashboard:</strong> Overview, stats, charts here...</div>;
const PagesPage = () => <div className="p-6 text-white">📄 <strong>Pages:</strong> Manage landing pages, blogs, info content...</div>;
const SettingsPage = () => <div className="p-6 text-white">⚙️ <strong>Settings:</strong> App preferences, integrations, etc.</div>;
const AccountPage = () => <div className="p-6 text-white">👤 <strong>Account:</strong> Profile info, password change, logout...</div>;

const Admin = () => {
  const [activePage, setActivePage] = useState('contacts');

  const renderPage = () => {
    switch (activePage) {
      case 'dashboard': return <DashboardPage />;
      case 'contacts': return <ContactsPage />;
      case 'pages': return <PagesPage />;
      case 'settings': return <SettingsPage />;
      case 'account': return <AccountPage />;
      default: return <ContactsPage />;
    }
  };

  return (
    <div className="flex bg-[#121212] text-white min-h-screen">
      <Sidebar activePage={activePage} setActivePage={setActivePage} />
      <main className="flex-1 p-6 overflow-auto">
        {renderPage()}
      </main>
    </div>
  );
};

export default Admin;
