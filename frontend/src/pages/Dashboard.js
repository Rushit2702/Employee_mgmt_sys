import React, { useEffect, useState, useContext } from 'react';
import { motion } from 'framer-motion';
import { AuthContext } from '../context/AuthContext';

function Dashboard() {
  const { user } = useContext(AuthContext);
  const [employees, setEmployees] = useState([]);
  const [attendance, setAttendance] = useState([]);
  const [payrolls, setPayrolls] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAll();
  }, []);

  const fetchAll = async () => {
    setLoading(true);
    try {
      const [empRes, attRes, payRes] = await Promise.all([
        fetch('/api/employees', { headers: { Authorization: 'Bearer ' + localStorage.getItem('token') } }),
        fetch('/api/attendance', { headers: { Authorization: 'Bearer ' + localStorage.getItem('token') } }),
        fetch('/api/payroll', { headers: { Authorization: 'Bearer ' + localStorage.getItem('token') } })
      ]);
      const [empData, attData, payData] = await Promise.all([
        empRes.json(), attRes.json(), payRes.json()
      ]);
      // Log to debug
      console.log('Attendance API response:', attData);
      setEmployees(empData || []);
      setAttendance(Array.isArray(attData) ? attData : attData.attendance || []);
      setPayrolls(payData || []);
    } catch (err) {
      // handle error
    }
    setLoading(false);
  };

  // Stats calculations
  const today = new Date().toISOString().slice(0, 10);
  const presentToday = attendance.filter(a => a.date && a.date.startsWith(today) && a.status === 'Present').length;
  const absentToday = attendance.filter(a => a.date && a.date.startsWith(today) && a.status === 'Absent').length;
  const totalEmployees = employees.length;
  const thisMonth = new Date().getMonth() + 1;
  const thisYear = new Date().getFullYear();
  const payrollThisMonth = payrolls
    .filter(p => p.month === thisMonth && p.year === thisYear)
    .reduce((sum, p) => sum + (p.netSalary || 0), 0);

  // Recent Activity (last 5 attendance records, newest first)
  const recentAttendance = [...attendance]
    .sort((a, b) => new Date(b.date) - new Date(a.date))
    .slice(0, 5);

  // Top Performers (most 'Present' days this month)
  const attendanceThisMonth = attendance.filter(a => {
    if (!a.date) return false;
    const d = new Date(a.date);
    return d.getMonth() + 1 === thisMonth && d.getFullYear() === thisYear && a.status === 'Present';
  });
  const presentCountByEmployee = {};
  attendanceThisMonth.forEach(a => {
    if (a.employee?._id) {
      presentCountByEmployee[a.employee._id] = (presentCountByEmployee[a.employee._id] || 0) + 1;
    }
  });
  const topPerformers = employees
    .map(emp => ({
      ...emp,
      presentDays: presentCountByEmployee[emp._id] || 0
    }))
    .sort((a, b) => b.presentDays - a.presentDays)
    .slice(0, 5);

  return (
    <div>
      <h2>Dashboard</h2>
      <div style={{ fontSize: 20, fontWeight: 500, marginBottom: 18 }}>
        Welcome{user && user.name ? `, ${user.name}` : ''}!
      </div>
      {loading ? (
        <div>Loading...</div>
      ) : (
        <>
          <div style={{ display: 'flex', gap: 24, marginBottom: 32, flexWrap: 'wrap' }}>
            {[{
              title: 'Total Employees',
              value: totalEmployees
            }, {
              title: 'Present Today',
              value: presentToday
            }, {
              title: 'Absent Today',
              value: absentToday
            }, {
              title: 'Total Payroll This Month',
              value: payrollThisMonth.toLocaleString()
            }].map((stat, idx) => (
              <motion.div
                className="card"
                key={stat.title}
                style={{ flex: 1, minWidth: 200 }}
                initial={{ opacity: 0, y: 32 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.1 * idx }}
              >
                <h3>{stat.title}</h3>
                <div style={{ fontSize: 32, fontWeight: 'bold' }}>{stat.value}</div>
              </motion.div>
            ))}
          </div>
          <div style={{ display: 'flex', gap: 24, flexWrap: 'wrap' }}>
            <motion.div
              className="card"
              style={{ flex: 1, minWidth: 320 }}
              initial={{ opacity: 0, y: 32 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.5 }}
            >
              <h3>Recent Activity</h3>
              <ul style={{ paddingLeft: 16 }}>
                {recentAttendance.length === 0 && <li>No recent attendance records.</li>}
                {recentAttendance.map(a => (
                  <li key={a._id}>
                    {a.employee?.name || 'Unknown'} - {a.status} on {a.date ? new Date(a.date).toLocaleDateString() : '-'}
                  </li>
                ))}
              </ul>
            </motion.div>
            <motion.div
              className="card"
              style={{ flex: 1, minWidth: 320 }}
              initial={{ opacity: 0, y: 32 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.6 }}
            >
              <h3>Top Performers (This Month)</h3>
              <ul style={{ paddingLeft: 16 }}>
                {topPerformers.length === 0 && <li>No data.</li>}
                {topPerformers.map(emp => (
                  <li key={emp._id}>
                    {emp.name} - {emp.presentDays} days present
                  </li>
                ))}
              </ul>
            </motion.div>
          </div>
        </>
      )}
      <p>Welcome! Here you can manage employees, attendance, and payroll.</p>
    </div>
  );
}

export default Dashboard; 