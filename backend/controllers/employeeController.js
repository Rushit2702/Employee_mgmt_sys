const Employee = require('../models/Employee');
const { validationResult } = require('express-validator');

exports.createEmployee = async (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }
    try {
        const { name, email, position, department, salary } = req.body;
        const employee = new Employee({ name, email, position, department, salary, user: req.user.id });
        await employee.save();
        res.status(201).json(employee);
    } catch (err) {
        next(err);
    }
};

exports.getEmployees = async (req, res, next) => {
    try {
        let employees = await Employee.find();
        res.json(employees);
    } catch (err) {
        next(err);
    }
};

exports.getEmployee = async (req, res, next) => {
    try {
        const employee = await Employee.findById(req.params.id);
        if (!employee) return res.status(404).json({ message: 'Employee not found' });
        res.json(employee);
    } catch (err) {
        next(err);
    }
};

exports.updateEmployee = async (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }
    try {
        const employee = await Employee.findByIdAndUpdate(req.params.id, req.body, { new: true });
        if (!employee) return res.status(404).json({ message: 'Employee not found' });
        res.json(employee);
    } catch (err) {
        next(err);
    }
};

exports.deleteEmployee = async (req, res, next) => {
    try {
        const employee = await Employee.findByIdAndDelete(req.params.id);
        if (!employee) return res.status(404).json({ message: 'Employee not found' });
        res.json({ message: 'Employee deleted' });
    } catch (err) {
        next(err);
    }
}; 