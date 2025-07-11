const Payroll = require('../models/Payroll');
const role = require('../middleware/role');
const { body, validationResult } = require('express-validator');
const errorHandler = require('../middleware/errorHandler');

exports.createPayroll = async (req, res) => {
    try {
        const { employee, month, year, basicSalary, bonuses = 0, deductions = [], specialAllowance = 0, incomeTax = 0 } = req.body;
        // Validate deductions
        const totalDeductions = Array.isArray(deductions) ? deductions.reduce((sum, d) => sum + Number(d.amount || 0), 0) : 0;
        // Professional calculations
        const hra = 0.4 * basicSalary;
        const pf = 0.12 * basicSalary;
        const gross = Number(basicSalary) + Number(hra) + Number(specialAllowance) + Number(bonuses);
        const esi = 0.0075 * gross;
        const professionalTax = 200;
        // Net salary calculation
        const netSalary = Number(basicSalary) + Number(hra) + Number(specialAllowance) + Number(bonuses)
            - (pf + esi + professionalTax + Number(incomeTax) + totalDeductions);
        const payroll = new Payroll({
            employee, month, year, basicSalary, bonuses, deductions,
            hra, specialAllowance, pf, esi, professionalTax, incomeTax,
            netSalary
        });
        await payroll.save();
        res.status(201).json(payroll);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

exports.getPayrolls = async (req, res) => {
    try {
        let payrolls;
        if (req.user.role === 'admin') {
            payrolls = await Payroll.find().populate('employee');
        } else {
            // Find payrolls for the employee linked to this user
            payrolls = await Payroll.find().populate({
                path: 'employee',
                match: { user: req.user.id }
            });
            payrolls = payrolls.filter(p => p.employee);
        }
        res.json(payrolls);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

exports.getEmployeePayrolls = async (req, res) => {
    try {
        const { employeeId } = req.params;
        if (req.user.role !== 'admin' && req.user.id !== employeeId) {
            return res.status(403).json({ message: 'Forbidden: You can only view your own payroll' });
        }
        const payrolls = await Payroll.find({ employee: employeeId });
        res.json(payrolls);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

exports.updatePayroll = async (req, res) => {
    try {
        let payroll = await Payroll.findById(req.params.id);
        if (!payroll) return res.status(404).json({ message: 'Payroll not found' });
        if (req.body.basicSalary !== undefined) payroll.basicSalary = req.body.basicSalary;
        if (req.body.bonuses !== undefined) payroll.bonuses = req.body.bonuses;
        if (req.body.deductions !== undefined) payroll.deductions = req.body.deductions;
        if (req.body.month !== undefined) payroll.month = req.body.month;
        if (req.body.year !== undefined) payroll.year = req.body.year;
        if (req.body.employee !== undefined) payroll.employee = req.body.employee;
        if (req.body.specialAllowance !== undefined) payroll.specialAllowance = req.body.specialAllowance;
        if (req.body.incomeTax !== undefined) payroll.incomeTax = req.body.incomeTax;
        // Recalculate
        const totalDeductions = Array.isArray(payroll.deductions) ? payroll.deductions.reduce((sum, d) => sum + Number(d.amount || 0), 0) : 0;
        payroll.hra = 0.4 * payroll.basicSalary;
        payroll.pf = 0.12 * payroll.basicSalary;
        const gross = Number(payroll.basicSalary) + Number(payroll.hra) + Number(payroll.specialAllowance) + Number(payroll.bonuses);
        payroll.esi = 0.0075 * gross;
        payroll.professionalTax = 200;
        payroll.netSalary = Number(payroll.basicSalary) + Number(payroll.hra) + Number(payroll.specialAllowance) + Number(payroll.bonuses)
            - (payroll.pf + payroll.esi + payroll.professionalTax + Number(payroll.incomeTax) + totalDeductions);
        await payroll.save();
        res.json(payroll);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

// backend/controllers/payrollController.js
exports.deletePayroll = async (req, res) => {
    try {
      const payroll = await Payroll.findByIdAndDelete(req.params.id);
      if (!payroll) return res.status(404).json({ message: 'Payroll not found' });
      res.json({ message: 'Payroll deleted' });
    } catch (err) {
      res.status(500).json({ message: err.message });
    }
  };

exports.createEmployee = async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }
    // ...rest of your code...
}; 