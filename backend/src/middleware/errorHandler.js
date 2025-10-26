// Global error handler middleware
export const errorHandler = (err, req, res, next) => {
  console.error('Error:', err);

  // Database errors
  if (err.code === '23505') { // Unique constraint violation
    return res.status(409).json({
      error: 'Registro duplicado',
      message: 'A record with this information already exists',
      details: err.detail
    });
  }

  if (err.code === '23503') { // Foreign key violation
    return res.status(400).json({
      error: 'Violação de referência',
      message: 'Referenced record does not exist',
      details: err.detail
    });
  }

  if (err.code === '22P02') { // Invalid text representation
    return res.status(400).json({
      error: 'Dados inválidos',
      message: 'Invalid data format',
      details: err.message
    });
  }

  // Validation errors
  if (err.name === 'ValidationError') {
    return res.status(400).json({
      error: 'Erro de validação',
      message: 'Validation failed',
      details: err.errors
    });
  }

  // JWT errors
  if (err.name === 'JsonWebTokenError') {
    return res.status(401).json({
      error: 'Token inválido',
      message: 'Invalid authentication token'
    });
  }

  if (err.name === 'TokenExpiredError') {
    return res.status(401).json({
      error: 'Token expirado',
      message: 'Authentication token has expired'
    });
  }

  // Default error
  const statusCode = err.statusCode || 500;
  res.status(statusCode).json({
    error: err.message || 'Erro interno do servidor',
    message: err.message || 'Internal server error',
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  });
};

// 404 handler
export const notFoundHandler = (req, res) => {
  res.status(404).json({
    error: 'Rota não encontrada',
    message: 'The requested endpoint does not exist',
    path: req.originalUrl
  });
};
