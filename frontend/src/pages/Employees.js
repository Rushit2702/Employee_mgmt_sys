import React, { useEffect, useState } from 'react';
import ModalForm from '../components/ModalForm';
import { motion } from 'framer-motion';

function Employees() {
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Add Employee form state
  const [form, setForm] = useState({
    name: '',
    email: '',
    position: '',
    department: '',
    salary: ''
  });
  const [formError, setFormError] = useState('');

  // Edit state
  const [editId, setEditId] = useState(null);
  const [editForm, setEditForm] = useState({
    name: '',
    email: '',
    position: '',
    department: '',
    salary: ''
  });
  const [editError, setEditError] = useState('');

  // Search state
  const [search, setSearch] = useState('');

  const [showAddModal, setShowAddModal] = useState(false);

  useEffect(() => {
    fetchEmployees();
  }, []);

  useEffect(() => {
    console.log('Employees state:', employees);
  }, [employees]);

  // Auto-save Add Employee form draft
  useEffect(() => {
    if (showAddModal) {
      const draft = localStorage.getItem('employeeFormDraft');
      if (draft) {
        try {
          setForm(JSON.parse(draft));
        } catch {}
      }
    }
  }, [showAddModal]);

  useEffect(() => {
    if (showAddModal) {
      localStorage.setItem('employeeFormDraft', JSON.stringify(form));
    }
  }, [form, showAddModal]);

  const fetchEmployees = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await fetch('/api/employees', {
        headers: { Authorization: 'Bearer ' + localStorage.getItem('token') }
      });
      const data = await res.json();
      if (res.ok) {
        setEmployees(data);
      } else {
        setError(data.message || 'Failed to fetch employees');
      }
    } catch (err) {
      setError('Network error');
    }
    setLoading(false);
  };

  // Edit handlers
  const startEdit = (emp) => {
    setEditId(emp._id);
    setEditForm({
      name: emp.name,
      email: emp.email,
      position: emp.position,
      department: emp.department,
      salary: emp.salary
    });
    setEditError('');
  };

  const handleEditChange = e => {
    setEditForm({ ...editForm, [e.target.name]: e.target.value });
  };

  // Delete handler
  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this employee?')) return;
    setLoading(true);
    try {
      const res = await fetch(`/api/employees/${id}`, {
        method: 'DELETE',
        headers: {
          Authorization: 'Bearer ' + localStorage.getItem('token'),
        },
      });
      const data = await res.json();
      if (res.ok) {
        fetchEmployees();
      } else {
        alert(data.message || 'Failed to delete employee');
      }
    } catch (err) {
      alert('Network error');
    }
    setLoading(false);
  };

  // Filtered employees by search
  const filteredEmployees = employees.filter(emp => {
    const s = search.toLowerCase();
    return (
      emp.name.toLowerCase().includes(s) ||
      emp.email.toLowerCase().includes(s) ||
      emp.position.toLowerCase().includes(s) ||
      emp.department.toLowerCase().includes(s)
    );
  });

  if (error) {
    // navigate("/dashboard");
  }

  return (
    <div>
      <h2 style={{ textAlign: 'center', marginTop: 24 }}>Employees</h2>
      <motion.div
        className="card"
        style={{ maxWidth: 1100, margin: '24px auto', padding: 24, borderRadius: 12, boxShadow: '0 2px 16px rgba(0,0,0,0.08)', background: '#fff' }}
        initial={{ opacity: 0, y: 32, scale: 0.96 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.55, ease: 'easeOut' }}
        whileHover={{ scale: 1.025, boxShadow: '0 8px 32px rgba(52,152,219,0.18)' }}
      >
        {/* Search Bar */}
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 16 }}>
          <input
            type="text"
            placeholder="Search by name, email, position, department..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            style={{ padding: 8, borderRadius: 4, border: '1px solid #ccc', minWidth: 260 }}
          />
          <button onClick={() => setShowAddModal(true)} className="action-btn add-btn">+ Add Employee</button>
        </div>
        <ModalForm
          open={showAddModal}
          onClose={() => setShowAddModal(false)}
          title="Add Employee"
          initialState={{ name: '', email: '', position: '', department: '', salary: '' }}
          onSubmit={async (form, reset) => {
            setFormError('');
            setLoading(true);
            try {
              const res = await fetch('/api/employee', {
                method: 'POST',
                headers: {
                  'Content-Type': 'application/json',
                  Authorization: 'Bearer ' + localStorage.getItem('token'),
                },
                body: JSON.stringify({ ...form, salary: Number(form.salary) })
              });
              const data = await res.json();
              if (res.ok) {
                fetchEmployees();
                reset();
                return true;
              } else {
                setFormError(data.message || (data.errors && data.errors[0]?.msg) || 'Failed to add employee');
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
              <input name="name" value={form.name} onChange={handleChange} placeholder="Name" required style={{ width: '100%', marginBottom: 10, padding: 8, borderRadius: 4, border: '1px solid #ccc' }} />
              <input name="email" value={form.email} onChange={handleChange} placeholder="Email" type="email" required style={{ width: '100%', marginBottom: 10, padding: 8, borderRadius: 4, border: '1px solid #ccc' }} />
              <input name="position" value={form.position} onChange={handleChange} placeholder="Position" required style={{ width: '100%', marginBottom: 10, padding: 8, borderRadius: 4, border: '1px solid #ccc' }} />
              <input name="department" value={form.department} onChange={handleChange} placeholder="Department" required style={{ width: '100%', marginBottom: 10, padding: 8, borderRadius: 4, border: '1px solid #ccc' }} />
              <input name="salary" value={form.salary} onChange={handleChange} placeholder="Salary" type="number" required style={{ width: '100%', marginBottom: 10, padding: 8, borderRadius: 4, border: '1px solid #ccc' }} />
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
        ) : filteredEmployees.length === 0 ? (
          <div style={{ textAlign: 'center', color: '#888', margin: '32px 0' }}>
            No employees found.
          </div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', background: '#fff', borderRadius: 8, boxShadow: '0 2px 8px rgba(0,0,0,0.06)', marginTop: 0, borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ background: '#f4f6f8' }}>
                  <th style={{ padding: 12, textAlign: 'left' }}>Name</th>
                  <th style={{ padding: 12, textAlign: 'left' }}>Email</th>
                  <th style={{ padding: 12, textAlign: 'left' }}>Position</th>
                  <th style={{ padding: 12, textAlign: 'left' }}>Department</th>
                  <th style={{ padding: 12, textAlign: 'left' }}>Salary</th>
                  <th style={{ padding: 12 }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredEmployees.map((emp, idx) => (
                  <tr key={emp._id} style={{ background: idx % 2 === 0 ? '#fff' : '#f8fafd', transition: 'background 0.2s' }}>
                    {editId === emp._id ? (
                      <>
                        <td style={{ padding: 10 }}><input name="name" value={editForm.name} onChange={handleEditChange} required disabled={loading} /></td>
                        <td style={{ padding: 10 }}><input name="email" value={editForm.email} onChange={handleEditChange} required type="email" disabled={loading} /></td>
                        <td style={{ padding: 10 }}><input name="position" value={editForm.position} onChange={handleEditChange} required disabled={loading} /></td>
                        <td style={{ padding: 10 }}><input name="department" value={editForm.department} onChange={handleEditChange} required disabled={loading} /></td>
                        <td style={{ padding: 10 }}><input name="salary" value={editForm.salary} onChange={handleEditChange} required type="number" min="0" disabled={loading} /></td>
                        <td style={{ padding: 10 }}>
                        <div style={{ display: 'flex', gap: 10 }}>
                          <button
                            className="action-btn edit-btn"
                            onClick={() => startEdit(emp)}
                            disabled={loading}
                          >
                            Edit
                          </button>
                          <button
                            className="action-btn delete-btn"
                            onClick={() => handleDelete(emp._id)}
                            disabled={loading}
                          >
                            Delete
                          </button>
                        </div>
                          {editError && <div className="error" style={{ marginTop: 4 }}>{editError}</div>}
                        </td>
                      </>
                    ) : (
                      <>
                        <td style={{ padding: 10 }}>{emp.name}</td>
                        <td style={{ padding: 10 }}>{emp.email}</td>
                        <td style={{ padding: 10 }}>{emp.position}</td>
                        <td style={{ padding: 10 }}>{emp.department}</td>
                        <td style={{ padding: 10 }}>{emp.salary}</td>
                        <td style={{ padding: 10 }}>
                          <div style={{ display: 'flex', gap: 10 }}>
                            <button onClick={() => startEdit(emp)} className="action-btn edit-btn" disabled={loading}>Edit</button>
                            <button onClick={() => handleDelete(emp._id)} className="action-btn delete-btn" disabled={loading}>Delete</button>
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

export default Employees; 