const { logger } = require('../utils/logger');

const authenticateUser = (req, res, next) => {
  try {
    // For now, we'll use a simple session-based approach
    // In production, you'd want to implement JWT or session-based auth
    const { role, userId } = req.headers;
    
    if (!role || !userId) {
      return res.status(401).json({
        success: false,
        error: 'Authentication required'
      });
    }

    // Validate role
    if (!['teacher', 'student'].includes(role)) {
      return res.status(403).json({
        success: false,
        error: 'Invalid role'
      });
    }

    // Add user info to request
    req.user = { role, userId };
    next();
  } catch (error) {
    logger.error(`Authentication error: ${error.message}`);
    res.status(500).json({
      success: false,
      error: 'Authentication failed'
    });
  }
};

const requireTeacher = (req, res, next) => {
  if (req.user && req.user.role === 'teacher') {
    next();
  } else {
    res.status(403).json({
      success: false,
      error: 'Teacher access required'
    });
  }
};

const requireStudent = (req, res, next) => {
  if (req.user && req.user.role === 'student') {
    next();
  } else {
    res.status(403).json({
      success: false,
      error: 'Student access required'
    });
  }
};

module.exports = {
  authenticateUser,
  requireTeacher,
  requireStudent
};
