const Session = require('../models/Session');

// Clean up expired sessions
const cleanupExpiredSessions = async () => {
    try {
        const result = await Session.deleteMany({
            expiresAt: { $lt: new Date() }
        });
        console.log(`Cleaned up ${result.deletedCount} expired sessions`);
    } catch (error) {
        console.error('Session cleanup error:', error);
    }
};

// Run cleanup every hour
const startSessionCleanup = () => {
    setInterval(cleanupExpiredSessions, 60 * 60 * 1000); // 1 hour
    console.log('Session cleanup scheduled');
};

module.exports = { cleanupExpiredSessions, startSessionCleanup }; 