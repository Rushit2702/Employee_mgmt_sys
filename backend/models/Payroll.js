const mongoose = require('mongoose');

const payrollSchema = new mongoose.Schema({
    employee: { type: mongoose.Schema.Types.ObjectId, ref: 'Employee', required: true },
    month: { type: Number, required: true }, // 1-12
    year: { type: Number, required: true },
    basicSalary: { type: Number, required: true },
    bonuses: { type: Number, default: 0 },
    deductions: [{ amount: { type: Number, required: true }, reason: { type: String, required: true } }],
    hra: { type: Number, default: 0 },
    specialAllowance: { type: Number, default: 0 },
    pf: { type: Number, default: 0 },
    esi: { type: Number, default: 0 },
    professionalTax: { type: Number, default: 0 },
    incomeTax: { type: Number, default: 0 },
    netSalary: { type: Number, required: true }
}, { timestamps: true });

module.exports = mongoose.model('Payroll', payrollSchema); 