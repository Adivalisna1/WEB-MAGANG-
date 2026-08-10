const { validationResult } = require('express-validator');

// Jalankan setelah express-validator rules
function validate(req, res, next) {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(422).json({
      success: false,
      message: 'Validasi gagal',
      errors: errors.array().map(e => ({ field: e.path, message: e.msg })),
    });
  }
  next();
}

module.exports = validate;
