const express = require('express');
const router = express.Router();
const { createPayroll, getPayrolls, getEmployeePayrolls, updatePayroll, deletePayroll } = require('../controllers/payrollController');
const auth = require('../middleware/auth');
const role = require('../middleware/role');

router.post('/', auth, role('admin'), createPayroll);
router.get('/', auth, getPayrolls);
router.get('/employee/:employeeId', auth, getEmployeePayrolls);
router.put('/:id', auth, role('admin'), updatePayroll);
router.delete('/:id', auth, role('admin'), deletePayroll);

module.exports = router; 