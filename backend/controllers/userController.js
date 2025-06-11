const User = require('../models/User');
const ErrorResponse = require('../utils/errorResponse');

// Get all teachers
exports.getTeachers = async (req, res, next) => {
    try {
        const teachers = await User.find({ role: 'teacher', isActive: true })
            .select('username firstName lastName department')
            .sort('firstName');

        res.status(200).json({
            success: true,
            count: teachers.length,
            data: teachers,
        });
    } catch (err) {
        next(err);
    }
}; 