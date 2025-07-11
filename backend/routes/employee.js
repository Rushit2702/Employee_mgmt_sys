const express = require('express');
const router = express.Router();
const { createEmployee, getEmployees, getEmployee, updateEmployee, deleteEmployee } = require('../controllers/employeeController');
const auth = require('../middleware/auth');
const role = require('../middleware/role');
const { body } = require('express-validator');

router.post(
  '/',
  auth,
  role('admin'),
  [
    body('name').notEmpty().withMessage('Name is required'),
    body('email').isEmail().withMessage('Valid email is required'),
    body('position').notEmpty().withMessage('Position is required'),
    body('department').notEmpty().withMessage('Department is required'),
    body('salary').isNumeric().withMessage('Salary must be a number')
  ],
  createEmployee
);

router.get('/', auth, getEmployees);
router.get('/:id', auth, getEmployee);

router.put(
  '/:id',
  auth,
  role('admin'),
  [
    body('name').optional().notEmpty().withMessage('Name is required'),
    body('email').optional().isEmail().withMessage('Valid email is required'),
    body('position').optional().notEmpty().withMessage('Position is required'),
    body('department').optional().notEmpty().withMessage('Department is required'),
    body('salary').optional().isNumeric().withMessage('Salary must be a number')
  ],
  updateEmployee
);

router.delete('/:id', auth, role('admin'), deleteEmployee);

module.exports = router; 