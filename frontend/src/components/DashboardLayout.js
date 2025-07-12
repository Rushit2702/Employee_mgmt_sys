import React from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import '../App.css';
import { AnimatePresence, motion } from 'framer-motion';

export default function DashboardLayout() {
  return (
    <div style={{ display: 'flex', minHeight: '100vh' }}>
      <div className="sidebar" style={{ minWidth: 220, minHeight: '100vh' }}>
        <Sidebar />
      </div>
      <div style={{ flex: 1, padding: '32px 0', background: 'none' }}>
        <AnimatePresence mode="wait">
          <motion.div
            key={window.location.pathname}
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -24 }}
            transition={{ duration: 0.45, ease: 'easeInOut' }}
            className="card"
            style={{ maxWidth: 1200, margin: '0 auto', minHeight: 600 }}
          >
            <Outlet />
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
} 