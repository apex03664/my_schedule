import { useState } from 'react';
import { FiUsers, FiSettings, FiCalendar, FiFileText } from 'react-icons/fi';
import ContactsPage from '../components/ContactsPage';
import PagesPage from '../components/PagesPage';
import DashboardPage from '../components/Dashboardpage';

const Sidebar = ({ activePage, setActivePage }) => (
  <aside className="fixed top-0 left-0 h-full w-64 bg-[#111] text-white p-5 shadow-lg z-50">
    <h1 className="text-2xl font-bold text-white mb-10">Esromagica</h1>
    <nav className="space-y-6 text-base">
      <button onClick={() => setActivePage('dashboard')} className={`flex items-center gap-3 ${activePage === 'dashboard' ? 'text-white' : 'text-gray-300'} hover:text-white`}> <FiCalendar /> Dashboard</button>
      <button onClick={() => setActivePage('contacts')} className={`flex items-center gap-3 ${activePage === 'contacts' ? 'text-white' : 'text-gray-300'} hover:text-white`}> <FiUsers /> Contacts</button>
      <button onClick={() => setActivePage('pages')} className={`flex items-center gap-3 ${activePage === 'pages' ? 'text-white' : 'text-gray-300'} hover:text-white`}> <FiFileText /> Pages</button>
      <button onClick={() => setActivePage('settings')} className={`flex items-center gap-3 ${activePage === 'settings' ? 'text-white' : 'text-gray-300'} hover:text-white`}> <FiSettings /> Settings</button>
      <button onClick={() => setActivePage('account')} className={`flex items-center gap-3 ${activePage === 'account' ? 'text-white' : 'text-gray-300'} hover:text-white`}> Account</button>
    </nav>
    <div className="absolute bottom-10 left-5 text-sm text-gray-400">emapex04@esromagica.com</div>
  </aside>
);

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
    <div className="bg-[#121212] min-h-screen text-white">
      <Sidebar activePage={activePage} setActivePage={setActivePage} />
      <main className="ml-64 p-6 overflow-auto min-h-screen">
        {renderPage()}
      </main>
    </div>
  );
};

export default Admin;
