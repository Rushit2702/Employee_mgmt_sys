import React, { useEffect, useState } from 'react';
//import Employees from './Employees';
//import Attendance from './Attendance';
//import Payroll from './pages/Payroll';
import ModalForm from '../components/ModalForm';
import { motion } from 'framer-motion';

function Payroll() {
  const [payrolls, setPayrolls] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Add Payroll form state
  const [form, setForm] = useState({
    employee: '',
    month: '',
    year: '',
    basicSalary: '',
    specialAllowance: '',
    bonuses: '',
    deductions: '',
    incomeTax: ''
  });
  const [formError, setFormError] = useState('');

  // Edit state
  const [editId, setEditId] = useState(null);
  const [editForm, setEditForm] = useState({
    month: '',
    year: '',
    basicSalary: '',
    specialAllowance: '',
    bonuses: '',
    deductions: '',
    incomeTax: ''
  });
  const [editError, setEditError] = useState('');

  // For employee dropdown
  const [employees, setEmployees] = useState([]);

  // Search/filter state
  const [filterEmployee, setFilterEmployee] = useState('');
  const [filterMonth, setFilterMonth] = useState('');
  const [filterYear, setFilterYear] = useState('');

  const [showAddModal, setShowAddModal] = useState(false);

  // In Payroll component state
  const [deductions, setDeductions] = useState([{ amount: '', reason: '' }]);

  useEffect(() => {
    fetchPayrolls();
    fetchEmployees();
  }, []);

  const fetchPayrolls = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await fetch('/api/payroll', {
        headers: {
          Authorization: 'Bearer ' + localStorage.getItem('token'),
        },
      });
      const data = await res.json();
      if (res.ok) {
        setPayrolls(data);
      } else {
        setError(data.message || 'Failed to fetch payrolls');
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
  const startEdit = (p) => {
    setEditId(p._id);
    setEditForm({
      month: p.month,
      year: p.year,
      basicSalary: p.basicSalary,
      specialAllowance: p.specialAllowance,
      bonuses: p.bonuses,
      deductions: p.deductions,
      incomeTax: p.incomeTax
    });
    setEditError('');
  };

  const handleEditChange = e => {
    setEditForm({ ...editForm, [e.target.name]: e.target.value });
  };

  const handleEditSave = async (id) => {
    setEditError('');
    setLoading(true);
    try {
      const res = await fetch(`/api/payroll/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: 'Bearer ' + localStorage.getItem('token'),
        },
        body: JSON.stringify({
          ...editForm,
          month: Number(editForm.month),
          year: Number(editForm.year),
          basicSalary: Number(editForm.basicSalary),
          specialAllowance: Number(editForm.specialAllowance),
          bonuses: Number(editForm.bonuses),
          deductions: Number(editForm.deductions),
          incomeTax: Number(editForm.incomeTax)
        })
      });
      const data = await res.json();
      if (res.ok) {
        setEditId(null);
        fetchPayrolls();
      } else {
        setEditError(data.message || (data.errors && data.errors[0]?.msg) || 'Failed to update payroll');
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

  // Filtered payrolls
  const filteredPayrolls = payrolls.filter(p => {
    const matchesEmployee = filterEmployee ? (p.employee?._id === filterEmployee) : true;
    const matchesMonth = filterMonth ? (String(p.month) === filterMonth) : true;
    const matchesYear = filterYear ? (String(p.year) === filterYear) : true;
    const s = filterEmployee.toLowerCase();
    const matchesSearch =
      (p.employee?.name?.toLowerCase().includes(s) || '') ||
      (String(p.basicSalary).includes(s) || '') ||
      (String(p.netSalary).includes(s) || '');
    return matchesEmployee && matchesMonth && matchesYear && matchesSearch;
  });

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this payroll record?')) return;
    setLoading(true);
    try {
      const res = await fetch(`/api/payroll/${id}`, {
        method: 'DELETE',
        headers: {
          Authorization: 'Bearer ' + localStorage.getItem('token'),
        },
      });
      const data = await res.json();
      if (res.ok) {
        fetchPayrolls();
      } else {
        alert(data.message || 'Failed to delete payroll');
      }
    } catch (err) {
      alert('Network error');
    }
    setLoading(false);
  };

  // Auto-save Add Payroll form draft
  useEffect(() => {
    if (showAddModal) {
      const draft = localStorage.getItem('payrollFormDraft');
      if (draft) {
        try {
          const parsed = JSON.parse(draft);
          setForm(f => parsed.form || f);
          setDeductions(parsed.deductions || [{ amount: '', reason: '' }]);
        } catch {}
      }
    }
  }, [showAddModal]);

  useEffect(() => {
    if (showAddModal) {
      localStorage.setItem('payrollFormDraft', JSON.stringify({ form, deductions }));
    }
  }, [form, deductions, showAddModal]);

  return (
    <div>
      <h2 style={{ textAlign: 'center', marginTop: 24 }}>Payroll</h2>
      <motion.div
        className="card"
        style={{ maxWidth: 1300, margin: '24px auto', padding: 32, borderRadius: 12, boxShadow: '0 2px 16px rgba(0,0,0,0.08)', background: '#fff' }}
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
            <select value={filterMonth} onChange={e => setFilterMonth(e.target.value)} style={{ minWidth: 100, marginLeft: 8 }}>
              <option value="">All Months</option>
              {[...Array(12)].map((_, i) => <option key={i+1} value={i+1}>{i+1}</option>)}
            </select>
            <input type="number" value={filterYear} onChange={e => setFilterYear(e.target.value)} placeholder="Year" style={{ minWidth: 80, marginLeft: 8 }} />
          </div>
          <button onClick={() => { setShowAddModal(true); setDeductions([{ amount: '', reason: '' }]); }} className="action-btn add-btn">+ Add Payroll</button>
        </div>
        <ModalForm
          open={showAddModal}
          onClose={() => setShowAddModal(false)}
          title="Add Payroll"
          initialState={{ employee: '', month: '', year: '', basicSalary: '', specialAllowance: '', bonuses: '', incomeTax: '' }}
          onSubmit={async (form, reset) => {
            setFormError('');
            setLoading(true);
            try {
              const payload = {
                ...form,
                deductions: deductions.filter(d => d.amount && d.reason),
                month: Number(form.month),
                year: Number(form.year),
                basicSalary: Number(form.basicSalary),
                specialAllowance: Number(form.specialAllowance),
                bonuses: Number(form.bonuses),
                incomeTax: Number(form.incomeTax)
              };
              const res = await fetch('/api/payroll', {
                method: 'POST',
                headers: {
                  'Content-Type': 'application/json',
                  Authorization: 'Bearer ' + localStorage.getItem('token'),
                },
                body: JSON.stringify(payload)
              });
              const data = await res.json();
              if (res.ok) {
                fetchPayrolls();
                reset();
                localStorage.removeItem('payrollFormDraft');
                return true;
              } else {
                setFormError(data.message || (data.errors && data.errors[0]?.msg) || 'Failed to add payroll');
                return false;
              }
            } catch (err) {
              setFormError('Network error');
              return false;
            } finally {
              setLoading(false);
            }
          }}
          renderFields={(form, handleChange) => {
            // Calculate auto fields
            const basic = Number(form.basicSalary) || 0;
            const specialAllowance = Number(form.specialAllowance) || 0;
            const bonuses = Number(form.bonuses) || 0;
            const deductions = Number(form.deductions) || 0;
            const incomeTax = Number(form.incomeTax) || 0;
            const hra = 0.4 * basic;
            const pf = 0.12 * basic;
            const gross = basic + hra + specialAllowance + bonuses;
            const esi = 0.0075 * gross;
            const professionalTax = 200;
            const netSalary = basic + hra + specialAllowance + bonuses - (pf + esi + professionalTax + incomeTax + deductions);
            const safeDeductions = Array.isArray(deductions) ? deductions : [{ amount: '', reason: '' }];
            return (
              <>
                <select name="employee" value={form.employee} onChange={handleChange} required style={{ width: '100%', marginBottom: 10, padding: 8, borderRadius: 4, border: '1px solid #ccc' }}>
                  <option value="">Select Employee</option>
                  {employees.map(emp => (
                    <option key={emp._id} value={emp._id}>{emp.name}</option>
                  ))}
                </select>
                <input name="month" value={form.month} onChange={handleChange} placeholder="Month (1-12)" type="number" min="1" max="12" required style={{ width: '100%', marginBottom: 10, padding: 8, borderRadius: 4, border: '1px solid #ccc' }} />
                <input name="year" value={form.year} onChange={handleChange} placeholder="Year" type="number" required style={{ width: '100%', marginBottom: 10, padding: 8, borderRadius: 4, border: '1px solid #ccc' }} />
                <input name="basicSalary" value={form.basicSalary} onChange={handleChange} placeholder="Basic Salary" type="number" required style={{ width: '100%', marginBottom: 10, padding: 8, borderRadius: 4, border: '1px solid #ccc' }} />
                <input name="specialAllowance" value={form.specialAllowance} onChange={handleChange} placeholder="Special Allowance" type="number" style={{ width: '100%', marginBottom: 10, padding: 8, borderRadius: 4, border: '1px solid #ccc' }} />
                <input name="bonuses" value={form.bonuses} onChange={handleChange} placeholder="Bonuses" type="number" style={{ width: '100%', marginBottom: 10, padding: 8, borderRadius: 4, border: '1px solid #ccc' }} />
                <div style={{ marginBottom: 10 }}>
                  <div style={{ fontWeight: 600, marginBottom: 4 }}>Other Deductions</div>
                  {safeDeductions.map((ded, idx) => (
                    <div key={idx} style={{ display: 'flex', gap: 8, marginBottom: 4 }}>
                      <input
                        type="number"
                        placeholder="Amount"
                        value={ded.amount}
                        onChange={e => {
                          const newDeds = [...safeDeductions];
                          newDeds[idx].amount = e.target.value;
                          setDeductions(newDeds);
                        }}
                        style={{ flex: 1, padding: 8, borderRadius: 4, border: '1px solid #ccc' }}
                        min="0"
                        required
                      />
                      <input
                        type="text"
                        placeholder="Reason"
                        value={ded.reason}
                        onChange={e => {
                          const newDeds = [...safeDeductions];
                          newDeds[idx].reason = e.target.value;
                          setDeductions(newDeds);
                        }}
                        style={{ flex: 2, padding: 8, borderRadius: 4, border: '1px solid #ccc' }}
                        required
                      />
                      <button type="button" onClick={() => setDeductions(safeDeductions.filter((_, i) => i !== idx))} style={{ background: '#eee', border: 'none', borderRadius: 4, padding: '0 8px', cursor: 'pointer', color: '#c00' }} disabled={safeDeductions.length === 1}>-</button>
                    </div>
                  ))}
                  <button type="button" onClick={() => setDeductions([...safeDeductions, { amount: '', reason: '' }])} 
                    className="animated-btn"
                    style={{ marginTop: 4 }}>
                    + Add Deduction
                  </button>
                </div>
                <input name="incomeTax" value={form.incomeTax} onChange={handleChange} placeholder="Income Tax (TDS)" type="number" style={{ width: '100%', marginBottom: 10, padding: 8, borderRadius: 4, border: '1px solid #ccc' }} />
                <input value={hra} readOnly placeholder="HRA (auto)" style={{ width: '100%', marginBottom: 10, padding: 8, borderRadius: 4, border: '1px solid #eee', background: '#f8fafd' }} />
                <input value={pf} readOnly placeholder="PF (auto)" style={{ width: '100%', marginBottom: 10, padding: 8, borderRadius: 4, border: '1px solid #eee', background: '#f8fafd' }} />
                <input value={esi} readOnly placeholder="ESI (auto)" style={{ width: '100%', marginBottom: 10, padding: 8, borderRadius: 4, border: '1px solid #eee', background: '#f8fafd' }} />
                <input value={professionalTax} readOnly placeholder="Professional Tax (auto)" style={{ width: '100%', marginBottom: 10, padding: 8, borderRadius: 4, border: '1px solid #eee', background: '#f8fafd' }} />
                <input value={netSalary} readOnly placeholder="Net Salary (auto)" style={{ width: '100%', marginBottom: 10, padding: 8, borderRadius: 4, border: '1px solid #eee', background: '#f8fafd', fontWeight: 600 }} />
                {formError && <div style={{ color: 'red', marginBottom: 8 }}>{formError}</div>}
              </>
            );
          }}
        />
        {/* Table or Empty State */}
        {loading ? (
          <div style={{ textAlign: 'center', margin: '32px 0' }}>
            <div className="spinner" style={{ width: 40, height: 40, border: '4px solid #eee', borderTop: '4px solid #007bff', borderRadius: '50%', animation: 'spin 1s linear infinite', margin: '0 auto' }} />
            <style>{`@keyframes spin { 0% { transform: rotate(0deg);} 100% { transform: rotate(360deg);} }`}</style>
          </div>
        ) : error ? (
          <div className="error" style={{ textAlign: 'center' }}>{error}</div>
        ) : filteredPayrolls.length === 0 ? (
          <div style={{ textAlign: 'center', color: '#888', margin: '32px 0' }}>
            No payroll records found.
          </div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', background: '#fff', borderRadius: 8, boxShadow: '0 2px 8px rgba(0,0,0,0.06)', marginTop: 0, borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ background: '#f4f6f8' }}>
                  <th style={{ padding: 12, textAlign: 'left' }}>Employee</th>
                  <th style={{ padding: 12, textAlign: 'left' }}>Month</th>
                  <th style={{ padding: 12, textAlign: 'left' }}>Year</th>
                  <th style={{ padding: 12, textAlign: 'left' }}>Basic</th>
                  <th style={{ padding: 12, textAlign: 'left' }}>HRA</th>
                  <th style={{ padding: 12, textAlign: 'left' }}>Special Allow.</th>
                  <th style={{ padding: 12, textAlign: 'left' }}>Bonuses</th>
                  <th style={{ padding: 12, textAlign: 'left' }}>PF</th>
                  <th style={{ padding: 12, textAlign: 'left' }}>ESI</th>
                  <th style={{ padding: 12, textAlign: 'left' }}>Prof. Tax</th>
                  <th style={{ padding: 12, textAlign: 'left' }}>Income Tax</th>
                  <th style={{ padding: 12, textAlign: 'left' }}>Other Deduct.</th>
                  <th style={{ padding: 12, textAlign: 'left' }}>Net Salary</th>
                  <th style={{ padding: 12 }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredPayrolls.map((p, idx) => (
                  <tr key={p._id} style={{ background: idx % 2 === 0 ? '#fff' : '#f8fafd', transition: 'background 0.2s' }}>
                    <td style={{ padding: 10 }}>{p.employee?.name || '-'}</td>
                    {editId === p._id ? (
                      <>
                        <td style={{ padding: 10 }}><input name="month" type="number" min="1" max="12" value={editForm.month} onChange={handleEditChange} required disabled={loading} /></td>
                        <td style={{ padding: 10 }}><input name="year" type="number" min="2000" max="2100" value={editForm.year} onChange={handleEditChange} required disabled={loading} /></td>
                        <td style={{ padding: 10 }}><input name="basicSalary" type="number" min="0" value={editForm.basicSalary} onChange={handleEditChange} required disabled={loading} /></td>
                        <td style={{ padding: 10 }}><input name="specialAllowance" type="number" min="0" value={editForm.specialAllowance} onChange={handleEditChange} disabled={loading} /></td>
                        <td style={{ padding: 10 }}><input name="bonuses" type="number" min="0" value={editForm.bonuses} onChange={handleEditChange} disabled={loading} /></td>
                        <td style={{ padding: 10 }}>
                          {(Array.isArray(p.deductions) && p.deductions.length > 0) ? (
                            <ul style={{ margin: 0, padding: 0, listStyle: 'none' }}>
                              {p.deductions.map((d, i) => (
                                <li key={i}>{d.amount} - {d.reason}</li>
                              ))}
                            </ul>
                          ) : '—'}
                        </td>
                        <td style={{ padding: 10 }}>{p.pf}</td>
                        <td style={{ padding: 10 }}>{p.esi}</td>
                        <td style={{ padding: 10 }}>{p.professionalTax}</td>
                        <td style={{ padding: 10 }}>{p.incomeTax}</td>
                        <td style={{ padding: 10 }}>
                          <div style={{ display: 'flex', gap: 10 }}>
                            <button onClick={() => handleEditSave(p._id)} style={{ marginRight: 8 }} disabled={loading}>Save</button>
                            <button onClick={handleEditCancel} disabled={loading}>Cancel</button>
                          </div>
                          {editError && <div className="error" style={{ marginTop: 4 }}>{editError}</div>}
                        </td>
                      </>
                    ) : (
                      <>
                        <td style={{ padding: 10 }}>{p.month}</td>
                        <td style={{ padding: 10 }}>{p.year}</td>
                        <td style={{ padding: 10 }}>{p.basicSalary}</td>
                        <td style={{ padding: 10 }}>{p.hra}</td>
                        <td style={{ padding: 10 }}>{p.specialAllowance}</td>
                        <td style={{ padding: 10 }}>{p.bonuses}</td>
                        <td style={{ padding: 10 }}>{p.pf}</td>
                        <td style={{ padding: 10 }}>{p.esi}</td>
                        <td style={{ padding: 10 }}>{p.professionalTax}</td>
                        <td style={{ padding: 10 }}>{p.incomeTax}</td>
                        <td style={{ padding: 10 }}>
                          {(Array.isArray(p.deductions) && p.deductions.length > 0) ? (
                            <ul style={{ margin: 0, padding: 0, listStyle: 'none' }}>
                              {p.deductions.map((d, i) => (
                                <li key={i}>{d.amount} - {d.reason}</li>
                              ))}
                            </ul>
                          ) : '—'}
                        </td>
                        <td style={{ padding: 10 }}>{p.netSalary}</td>
                        <td style={{ padding: 10 }}>
                          <div style={{ display: 'flex', gap: 10 }}>
                            <button onClick={() => startEdit(p)} className="action-btn edit-btn" disabled={loading}>Edit</button>
                            <button onClick={() => handleDelete(p._id)} className="action-btn delete-btn" disabled={loading}>Delete</button>
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

export default Payroll; 