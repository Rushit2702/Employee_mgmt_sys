const User = require('../models/User');
const Session = require('../models/Session');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');

exports.registerUser = async (req, res) => {
    try {
        const { name, email, password, role } = req.body;
        const existingUser = await User.findOne({ email });
        if (existingUser) return res.status(400).json({ message: 'User already exists' });
        const hashedPassword = await bcrypt.hash(password, 10);
        const user = new User({ name, email, password: hashedPassword, role });
        await user.save();
        res.status(201).json({ message: 'User registered successfully' });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

exports.loginUser = async (req, res) => {
    try {
        const { email, password } = req.body;
        const user = await User.findOne({ email });
        if (!user) return res.status(400).json({ message: 'Invalid credentials' });
        
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) return res.status(400).json({ message: 'Invalid credentials' });

        // Generate session ID
        const sessionId = crypto.randomBytes(32).toString('hex');
        
        // Set session expiration (8 hours from now)
        const expiresAt = new Date(Date.now() + 8 * 60 * 60 * 1000);
        
        // Create session
        const session = new Session({
            userId: user._id,
            sessionId,
            expiresAt,
            userAgent: req.get('User-Agent'),
            ipAddress: req.ip || req.connection.remoteAddress
        });
        await session.save();

        // Generate JWT token with session ID
        const token = jwt.sign(
            { 
                id: user._id, 
                role: user.role, 
                sessionId 
            }, 
            process.env.JWT_SECRET, 
            { expiresIn: '8h' }
        );

        // Set session cookie
        res.cookie('sessionId', sessionId, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'strict',
            maxAge: 8 * 60 * 60 * 1000 // 8 hours
        });

        res.json({ 
            token, 
            sessionId,
            user: { 
                id: user._id, 
                name: user.name, 
                email: user.email, 
                role: user.role 
            } 
        });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

exports.logoutUser = async (req, res) => {
    try {
        const { sessionId } = req.body;
        
        if (sessionId) {
            // Invalidate session
            await Session.findOneAndUpdate(
                { sessionId },
                { isActive: false }
            );
        }

        // Clear session cookie
        res.clearCookie('sessionId');
        
        res.json({ message: 'Logged out successfully' });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

exports.validateSession = async (req, res) => {
    try {
        const { sessionId } = req.body;
        
        if (!sessionId) {
            return res.status(401).json({ message: 'No session provided' });
        }

        const session = await Session.findOne({ 
            sessionId, 
            isActive: true,
            expiresAt: { $gt: new Date() }
        });

        if (!session) {
            return res.status(401).json({ message: 'Invalid or expired session' });
        }

        const user = await User.findById(session.userId).select('-password');
        if (!user) {
            return res.status(401).json({ message: 'User not found' });
        }

        res.json({ 
            user: { 
                id: user._id, 
                name: user.name, 
                email: user.email, 
                role: user.role 
            },
            sessionId 
        });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
}; 