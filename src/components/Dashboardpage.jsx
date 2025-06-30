import { useEffect, useState } from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer } from 'recharts';

const DashboardPage = () => {
  const [counsellorCount, setCounsellorCount] = useState(0);
  const [scheduledCount, setScheduledCount] = useState(0);
  const [doneCount, setDoneCount] = useState(0);

  useEffect(() => {
    const counsellors = JSON.parse(localStorage.getItem('counsellors')) || [];
    setCounsellorCount(counsellors.length);

    const appointments = JSON.parse(localStorage.getItem('appointments')) || [];
    const now = new Date();

    let upcoming = 0;
    let past = 0;

    appointments.forEach((appt) => {
      const apptTime = new Date(`${appt.date} ${appt.time}`);
      if (apptTime >= now) upcoming++;
      else past++;
    });

    setScheduledCount(upcoming);
    setDoneCount(past);
  }, []);

  const chartData = [
    { name: 'Scheduled', value: scheduledCount },
    { name: 'Completed', value: doneCount },
  ];
  const chartColors = ['#38bdf8', '#22c55e'];

  return (
    <div className="p-6 min-h-screen bg-[#121212] text-white">
      <h1 className="text-3xl font-bold mb-6">📊 Dashboard</h1>

      {/* Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-10">
        <div className="bg-[#1e1e30] rounded-xl p-6 border border-gray-700 shadow-md">
          <h2 className="text-sm text-gray-400 mb-2">Total Counsellors</h2>
          <p className="text-3xl font-bold text-blue-400">{counsellorCount}</p>
        </div>
        <div className="bg-[#1e1e30] rounded-xl p-6 border border-gray-700 shadow-md">
          <h2 className="text-sm text-gray-400 mb-2">Scheduled Sessions</h2>
          <p className="text-3xl font-bold text-yellow-400">{scheduledCount}</p>
        </div>
        <div className="bg-[#1e1e30] rounded-xl p-6 border border-gray-700 shadow-md">
          <h2 className="text-sm text-gray-400 mb-2">Completed Sessions</h2>
          <p className="text-3xl font-bold text-green-400">{doneCount}</p>
        </div>
      </div>

      {/* Pie Chart */}
      <div className="bg-[#1e1e30] rounded-xl p-6 border border-gray-700 shadow-md max-w-xl mx-auto">
        <h3 className="text-lg font-semibold mb-4">📈 Sessions Distribution</h3>
        <ResponsiveContainer width="100%" height={300}>
          <PieChart>
            <Pie
              data={chartData}
              cx="50%"
              cy="50%"
              outerRadius={100}
              labelLine={false}
              label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
              dataKey="value"
            >
              {chartData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={chartColors[index % chartColors.length]} />
              ))}
            </Pie>
          </PieChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default DashboardPage;