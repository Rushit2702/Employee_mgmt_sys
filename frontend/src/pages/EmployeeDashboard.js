import React, { useContext, useEffect, useState } from 'react';
import { AuthContext } from '../context/AuthContext';

function EmployeeDashboard() {
  const { user } = useContext(AuthContext);
  const [employee, setEmployee] = useState(null);
  const [attendance, setAttendance] = useState([]);
  const [payroll, setPayroll] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchEmployeeData = async () => {
      setLoading(true);
      setError('');
      try {
        // 1. Get employee record for this user
        const empRes = await fetch(`/api/employees`);
        const empData = await empRes.json();
        if (!empRes.ok) throw new Error(empData.message || 'Failed to fetch employee info');
        // Find the employee record linked to this user
        const myEmployee = empData.find(e => e.user === user.id);
        if (!myEmployee) throw new Error('Employee record not found for this user');
        setEmployee(myEmployee);

        // 2. Get attendance for this employee
        const attRes = await fetch(`/api/attendance/employee/${myEmployee._id}`);
        const attData = await attRes.json();
        if (!attRes.ok) throw new Error(attData.message || 'Failed to fetch attendance');
        setAttendance(attData);

        // 3. Get payroll for this employee
        const payRes = await fetch(`/api/payroll/employee/${myEmployee._id}`);
        const payData = await payRes.json();
        if (!payRes.ok) throw new Error(payData.message || 'Failed to fetch payroll');
        setPayroll(payData);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    if (user) fetchEmployeeData();
  }, [user]);

  if (loading) return <div style={{ padding: '2rem' }}>Loading...</div>;
  if (error) return <div style={{ padding: '2rem', color: 'red' }}>{error}</div>;

  return (
    <div style={{ padding: '2rem' }}>
      <h2>Employee Dashboard</h2>
      <h3>Profile Info</h3>
      <ul>
        <li><b>Name:</b> {employee.name}</li>
        <li><b>Email:</b> {employee.email}</li>
        <li><b>Position:</b> {employee.position}</li>
        <li><b>Department:</b> {employee.department}</li>
        <li><b>Salary:</b> ₹{employee.salary}</li>
      </ul>
      <h3>Attendance Records</h3>
      {attendance.length === 0 ? <div>No attendance records found.</div> : (
        <table border="1" cellPadding="8" style={{ marginBottom: '2rem' }}>
          <thead>
            <tr>
              <th>Date</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {attendance.map(a => (
              <tr key={a._id}>
                <td>{a.date?.slice(0, 10)}</td>
                <td>{a.status}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
      <h3>Payroll Records</h3>
      {payroll.length === 0 ? <div>No payroll records found.</div> : (
        <table border="1" cellPadding="8">
          <thead>
            <tr>
              <th>Month</th>
              <th>Year</th>
              <th>Basic Salary</th>
              <th>Bonuses</th>
              <th>Deductions</th>
              <th>Net Salary</th>
            </tr>
          </thead>
          <tbody>
            {payroll.map(p => (
              <tr key={p._id}>
                <td>{p.month}</td>
                <td>{p.year}</td>
                <td>₹{p.basicSalary}</td>
                <td>₹{p.bonuses || 0}</td>
                <td>₹{p.deductions || 0}</td>
                <td>₹{p.netSalary}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}

export default EmployeeDashboard; 