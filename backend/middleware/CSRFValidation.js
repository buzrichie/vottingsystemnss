const validateCsrf = (req, res, next) => {
    const csrfToken = req.headers['x-csrf-token'];
    if (!csrfToken || csrfToken !== req.csrfToken()) {
      return res.status(403).json({ message: 'Invalid CSRF token' });
    }
    next();
  };
  