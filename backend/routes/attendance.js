const express = require('express');
const router = express.Router();
const { markAttendance, getAttendance, getEmployeeAttendance, updateAttendance, deleteAttendance } = require('../controllers/attendanceController');
const auth = require('../middleware/auth');

router.post('/', auth, markAttendance);
router.get('/', auth, getAttendance);
router.get('/employee/:employeeId', auth, getEmployeeAttendance);
router.put('/:id', auth, updateAttendance);
router.delete('/:id', auth, deleteAttendance);

module.exports = router; 