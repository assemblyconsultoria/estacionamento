import { body, param, validationResult } from 'express-validator';

// Middleware to check validation results
export const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      error: 'Erro de validação',
      message: 'Validation failed',
      errors: errors.array()
    });
  }
  next();
};

// Login validation rules
export const loginValidation = [
  body('username')
    .trim()
    .notEmpty()
    .withMessage('Usuário é obrigatório'),
  body('password')
    .isLength({ min: 6 })
    .withMessage('Senha deve ter no mínimo 6 caracteres'),
  validate
];

// Register validation rules
export const registerValidation = [
  body('username')
    .trim()
    .isLength({ min: 3 })
    .withMessage('Usuário deve ter no mínimo 3 caracteres')
    .matches(/^[a-zA-Z0-9_]+$/)
    .withMessage('Usuário deve conter apenas letras, números e underscore'),
  body('password')
    .isLength({ min: 6 })
    .withMessage('Senha deve ter no mínimo 6 caracteres'),
  validate
];

// Vehicle validation rules
export const vehicleValidation = [
  body('marca')
    .trim()
    .notEmpty()
    .withMessage('Marca é obrigatória'),
  body('modelo')
    .trim()
    .notEmpty()
    .withMessage('Modelo é obrigatório'),
  body('placa')
    .trim()
    .notEmpty()
    .withMessage('Placa é obrigatória')
    .matches(/^[A-Z]{3}-?[0-9][A-Z0-9][0-9]{2}$/i)
    .withMessage('Placa deve estar no formato ABC-1234 ou ABC1D23'),
  validate
];

// UUID validation rule
export const uuidValidation = [
  param('id')
    .isUUID()
    .withMessage('ID inválido'),
  validate
];
