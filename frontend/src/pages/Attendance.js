import React, { useEffect, useState } from 'react';
import ModalForm from '../components/ModalForm';
import { motion } from 'framer-motion';

function Attendance() {
  const [attendance, setAttendance] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Add Attendance form state
  const [form, setForm] = useState({
    employee: '',
    date: '',
    status: 'Present'
  });
  const [formError, setFormError] = useState('');

  // Edit state
  const [editId, setEditId] = useState(null);
  const [editForm, setEditForm] = useState({
    status: 'Present'
  });
  const [editError, setEditError] = useState('');

  // For employee dropdown
  const [employees, setEmployees] = useState([]);

  // Filter state
  const [filterEmployee, setFilterEmployee] = useState('');
  const [filterDate, setFilterDate] = useState('');

  const [showAddModal, setShowAddModal] = useState(false);

  useEffect(() => {
    fetchAttendance();
    fetchEmployees();
  }, []);

  useEffect(() => {
    if (showAddModal) {
      const draft = localStorage.getItem('attendanceFormDraft');
      if (draft) {
        try {
          setForm(JSON.parse(draft));
        } catch {}
      }
    }
  }, [showAddModal]);

  useEffect(() => {
    if (showAddModal) {
      localStorage.setItem('attendanceFormDraft', JSON.stringify(form));
    }
  }, [form, showAddModal]);

  const fetchAttendance = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await fetch('/api/attendance', {
        headers: {
          Authorization: 'Bearer ' + localStorage.getItem('token'),
        },
      });
      const data = await res.json();
      if (res.ok) {
        setAttendance(data);
      } else {
        setError(data.message || 'Failed to fetch attendance');
      }
    } catch (err) {
      setError('Network error');
    }
    setLoading(false);
  };

  const fetchEmployees = async () => {
    try {
      const res = await fetch('/api/employees', {
        headers: {
          Authorization: 'Bearer ' + localStorage.getItem('token'),
        },
      });
      const data = await res.json();
      if (res.ok) {
        setEmployees(data);
      }
    } catch (err) {}
  };

  // Edit handlers
  const startEdit = (a) => {
    setEditId(a._id);
    setEditForm({ status: a.status });
    setEditError('');
  };

  const handleEditChange = e => {
    setEditForm({ ...editForm, [e.target.name]: e.target.value });
  };

  const handleEditSave = async (id) => {
    setEditError('');
    setLoading(true);
    try {
      const res = await fetch(`/api/attendance/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: 'Bearer ' + localStorage.getItem('token'),
        },
        body: JSON.stringify(editForm)
      });
      const data = await res.json();
      if (res.ok) {
        setEditId(null);
        fetchAttendance();
      } else {
        setEditError(data.message || (data.errors && data.errors[0]?.msg) || 'Failed to update attendance');
      }
    } catch (err) {
      setEditError('Network error');
    }
    setLoading(false);
  };

  const handleEditCancel = () => {
    setEditId(null);
    setEditError('');
  };

  // Delete handler
  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this attendance record?')) return;
    setLoading(true);
    try {
      const res = await fetch(`/api/attendance/${id}`, {
        method: 'DELETE',
        headers: {
          Authorization: 'Bearer ' + localStorage.getItem('token'),
        },
      });
      const data = await res.json();
      if (res.ok) {
        fetchAttendance();
      } else {
        alert(data.message || 'Failed to delete attendance');
      }
    } catch (err) {
      alert('Network error');
    }
    setLoading(false);
  };

  // Filtered attendance
  const filteredAttendance = attendance.filter(a => {
    const matchesEmployee = filterEmployee ? (a.employee?._id === filterEmployee) : true;
    const matchesDate = filterDate ? (a.date && a.date.startsWith(filterDate)) : true;
    const s = '';
    const matchesSearch =
      (a.employee?.name?.toLowerCase().includes(s) || '') ||
      (a.status?.toLowerCase().includes(s) || '');
    return matchesEmployee && matchesDate && matchesSearch;
  });

  return (
    <div>
      <h2 style={{ textAlign: 'center', marginTop: 24 }}>Attendance</h2>
      <motion.div
        className="card"
        style={{ maxWidth: 1100, margin: '24px auto', padding: 24, borderRadius: 12, boxShadow: '0 2px 16px rgba(0,0,0,0.08)', background: '#fff' }}
        initial={{ opacity: 0, y: 32, scale: 0.96 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.55, ease: 'easeOut' }}
        whileHover={{ scale: 1.025, boxShadow: '0 8px 32px rgba(52,152,219,0.18)' }}
      >
        {/* Filters */}
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 16 }}>
          <div>
            <select value={filterEmployee} onChange={e => setFilterEmployee(e.target.value)} style={{ minWidth: 120 }}>
              <option value="">All Employees</option>
              {employees.map(emp => (
                <option key={emp._id} value={emp._id}>{emp.name}</option>
              ))}
            </select>
            <input type="date" value={filterDate} onChange={e => setFilterDate(e.target.value)} style={{ minWidth: 120, marginLeft: 8 }} />
          </div>
          <button onClick={() => setShowAddModal(true)} className="action-btn add-btn">+ Add Attendance</button>
        </div>
        <ModalForm
          open={showAddModal}
          onClose={() => setShowAddModal(false)}
          title="Add Attendance"
          initialState={{ employee: '', date: '', status: 'Present' }}
          onSubmit={async (form, reset) => {
            setFormError('');
            setLoading(true);
            try {
              const res = await fetch('/api/attendance', {
                method: 'POST',
                headers: {
                  'Content-Type': 'application/json',
                  Authorization: 'Bearer ' + localStorage.getItem('token'),
                },
                body: JSON.stringify(form)
              });
              const data = await res.json();
              if (res.ok) {
                fetchAttendance();
                reset();
                return true;
              } else {
                setFormError(data.message || (data.errors && data.errors[0]?.msg) || 'Failed to mark attendance');
                return false;
              }
            } catch (err) {
              setFormError('Network error');
              return false;
            } finally {
              setLoading(false);
            }
          }}
          renderFields={(form, handleChange) => (
            <>
              <select name="employee" value={form.employee} onChange={handleChange} required style={{ width: '100%', marginBottom: 10, padding: 8, borderRadius: 4, border: '1px solid #ccc' }}>
                <option value="">Select Employee</option>
                {employees.map(emp => (
                  <option key={emp._id} value={emp._id}>{emp.name}</option>
                ))}
              </select>
              <input name="date" value={form.date} onChange={handleChange} placeholder="Date" type="date" required style={{ width: '100%', marginBottom: 10, padding: 8, borderRadius: 4, border: '1px solid #ccc' }} />
              <select name="status" value={form.status} onChange={handleChange} required style={{ width: '100%', marginBottom: 10, padding: 8, borderRadius: 4, border: '1px solid #ccc' }}>
                <option value="Present">Present</option>
                <option value="Absent">Absent</option>
                <option value="Leave">Leave</option>
              </select>
              {formError && <div style={{ color: 'red', marginBottom: 8 }}>{formError}</div>}
            </>
          )}
        />
        {/* Table or Empty State */}
        {loading ? (
          <div style={{ textAlign: 'center', margin: '32px 0' }}>
            <div className="spinner" style={{ width: 40, height: 40, border: '4px solid #eee', borderTop: '4px solid #007bff', borderRadius: '50%', animation: 'spin 1s linear infinite', margin: '0 auto' }} />
            <style>{`@keyframes spin { 0% { transform: rotate(0deg);} 100% { transform: rotate(360deg);} }`}</style>
          </div>
        ) : error ? (
          <div className="error" style={{ textAlign: 'center' }}>{error}</div>
        ) : filteredAttendance.length === 0 ? (
          <div style={{ textAlign: 'center', color: '#888', margin: '32px 0' }}>
            No attendance records found.
          </div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', background: '#fff', borderRadius: 8, boxShadow: '0 2px 8px rgba(0,0,0,0.06)', marginTop: 0, borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ background: '#f4f6f8' }}>
                  <th style={{ padding: 12, textAlign: 'left' }}>Employee</th>
                  <th style={{ padding: 12, textAlign: 'left' }}>Date</th>
                  <th style={{ padding: 12, textAlign: 'left' }}>Status</th>
                  <th style={{ padding: 12 }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredAttendance.map((a, idx) => (
                  <tr key={a._id} style={{ background: idx % 2 === 0 ? '#fff' : '#f8fafd', transition: 'background 0.2s' }}>
                    <td style={{ padding: 10 }}>{a.employee?.name || '-'}</td>
                    <td style={{ padding: 10 }}>{a.date ? new Date(a.date).toLocaleDateString() : '-'}</td>
                    {editId === a._id ? (
                      <>
                        <td style={{ padding: 10 }}>
                          <select name="status" value={editForm.status} onChange={handleEditChange} disabled={loading}>
                            <option value="Present">Present</option>
                            <option value="Absent">Absent</option>
                          </select>
                        </td>
                        <td style={{ padding: 10 }}>
                          <button onClick={() => handleEditSave(a._id)} style={{ marginRight: 8 }} disabled={loading}>Save</button>
                          <button onClick={handleEditCancel} disabled={loading}>Cancel</button>
                          {editError && <div className="error" style={{ marginTop: 4 }}>{editError}</div>}
                        </td>
                      </>
                    ) : (
                      <>
                        <td style={{ padding: 10 }}>{a.status}</td>
                        <td style={{ padding: 10 }}>
                          <div style={{ display: 'flex', gap: 10 }}>
                            <button onClick={() => startEdit(a)} className="action-btn edit-btn" disabled={loading}>Edit</button>
                            <button onClick={() => handleDelete(a._id)} className="action-btn delete-btn" disabled={loading}>Delete</button>
                          </div>
                        </td>
                      </>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </motion.div>
    </div>
  );
}

export default Attendance; 