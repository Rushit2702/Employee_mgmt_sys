import React, { useState } from 'react';

const modalBackdropStyle = {
  position: 'fixed',
  top: 0,
  left: 0,
  width: '100vw',
  height: '100vh',
  background: 'rgba(0,0,0,0.35)',
  zIndex: 1000,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  transition: 'opacity 0.3s',
};

const modalContentStyle = {
  background: '#fff',
  borderRadius: 12,
  boxShadow: '0 4px 32px rgba(0,0,0,0.18)',
  padding: 32,
  minWidth: 420,
  maxWidth: 540,
  position: 'relative',
  animation: 'modalPopIn 0.3s',
};

const closeBtnStyle = {
  position: 'absolute',
  top: 12,
  right: 16,
  fontSize: 22,
  background: 'none',
  border: 'none',
  cursor: 'pointer',
  color: '#888',
};

const spinnerStyle = {
  display: 'inline-block',
  width: 32,
  height: 32,
  border: '4px solid #eee',
  borderTop: '4px solid #3498db',
  borderRadius: '50%',
  animation: 'spin 1s linear infinite',
  margin: '0 auto',
};

const checkmarkStyle = {
  display: 'block',
  margin: '0 auto',
  width: 40,
  height: 40,
  color: '#27ae60',
};

// Keyframes for animation
const styleSheet = document.createElement('style');
styleSheet.innerHTML = `
@keyframes modalPopIn {
  0% { transform: scale(0.8); opacity: 0; }
  100% { transform: scale(1); opacity: 1; }
}
@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}
`;
document.head.appendChild(styleSheet);

export default function ModalForm({ open, onClose, title, onSubmit, initialState, renderFields, submitLabel = 'Submit', resetLabel = 'Reset' }) {
  const [form, setForm] = useState(initialState || {});
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  if (!open) return null;

  const handleChange = e => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleReset = () => {
    setForm(initialState || {});
  };

  const handleSubmit = async e => {
    e.preventDefault();
    setSubmitting(true);
    setSubmitted(false);
    const result = await onSubmit(form, handleReset);
    setSubmitting(false);
    setSubmitted(true);
    setTimeout(() => {
      setSubmitted(false);
      if (result !== false) onClose();
    }, 1200);
  };

  return (
    <div style={modalBackdropStyle} onClick={onClose}>
      <div style={modalContentStyle} onClick={e => e.stopPropagation()}>
        <button style={closeBtnStyle} onClick={onClose} aria-label="Close">&times;</button>
        <h2 style={{ marginTop: 0, marginBottom: 18, textAlign: 'center' }}>{title}</h2>
        <form onSubmit={handleSubmit}>
          {renderFields(form, handleChange)}
          <div style={{ display: 'flex', gap: 12, marginTop: 24, justifyContent: 'center' }}>
            <button type="submit" disabled={submitting} style={{ padding: '8px 24px', borderRadius: 6, background: '#3498db', color: '#fff', border: 'none', fontWeight: 600, fontSize: 16, cursor: 'pointer' }}>{submitLabel}</button>
            <button type="button" onClick={handleReset} disabled={submitting} style={{ padding: '8px 24px', borderRadius: 6, background: '#eee', color: '#333', border: 'none', fontWeight: 600, fontSize: 16, cursor: 'pointer' }}>{resetLabel}</button>
          </div>
        </form>
        {submitting && <div style={{ marginTop: 24, textAlign: 'center' }}><span style={spinnerStyle}></span></div>}
        {submitted && !submitting && (
          <div style={{ marginTop: 24, textAlign: 'center' }}>
            <svg style={checkmarkStyle} viewBox="0 0 52 52"><circle cx="26" cy="26" r="25" fill="none" stroke="#27ae60" strokeWidth="3"/><path fill="none" stroke="#27ae60" strokeWidth="4" d="M14 27l7 7 16-16"/></svg>
            <div style={{ color: '#27ae60', fontWeight: 600, marginTop: 8 }}>Success!</div>
          </div>
        )}
      </div>
    </div>
  );
} 