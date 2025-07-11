const Attendance = require('../models/Attendance');

exports.markAttendance = async (req, res) => {
    try {
        const { employee, date, status } = req.body;
        // Prevent duplicate attendance for same employee and date
        const existing = await Attendance.findOne({ employee, date });
        if (existing) return res.status(400).json({ message: 'Attendance already marked for this date' });
        const attendance = new Attendance({ employee, date, status });
        await attendance.save();
        res.status(201).json(attendance);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

exports.getAttendance = async (req, res) => {
    try {
        let attendance;
        if (req.user.role === 'admin') {
            attendance = await Attendance.find().populate('employee');
        } else {
            // Find attendance for the employee linked to this user
            attendance = await Attendance.find().populate({
                path: 'employee',
                match: { user: req.user.id }
            });
            // Filter out nulls (attendance not belonging to this user)
            attendance = attendance.filter(a => a.employee);
        }
        res.json(attendance);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

exports.getEmployeeAttendance = async (req, res) => {
    try {
        const { employeeId } = req.params;
        if (req.user.role !== 'admin' && req.user.id !== employeeId) {
            return res.status(403).json({ message: 'Forbidden: You can only view your own attendance' });
        }
        const attendance = await Attendance.find({ employee: employeeId });
        res.json(attendance);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

exports.updateAttendance = async (req, res) => {
    try {
        const attendance = await Attendance.findByIdAndUpdate(req.params.id, req.body, { new: true });
        if (!attendance) return res.status(404).json({ message: 'Attendance not found' });
        res.json(attendance);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
}; 

exports.deleteAttendance = async (req, res) => {
    try {
        const attendance = await Attendance.findByIdAndDelete(req.params.id, req.body, { new: true });
        if (!attendance) return res.status(404).json({ message: 'Attendance not found' });
        res.json(attendance);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
}; 