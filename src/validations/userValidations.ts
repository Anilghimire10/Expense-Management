import Joi from 'joi';

export const registerSchema = Joi.object({
  username: Joi.string().min(3).max(30).trim().required().messages({
    'string.base': 'Username must be a string',
    'string.empty': 'Username must be required',
    'string.min': 'Username must be at least 3 characters long',
    'any.required': 'Username must be required',
  }),
  email: Joi.string()
    .email({ tlds: { allow: false } })
    .required()
    .messages({
      'string.email': 'Please enter a valid email address',
      'any.required': 'Email is required',
    }),
  password: Joi.string().min(6).required().messages({
    'string.min': 'Password must be 6 character long',
    'any.required': 'Password is required',
  }),
  phone: Joi.string()
    .pattern(/^[0-9]{7,15}$/)
    .optional()
    .messages({
      'string.pattern.base': 'Phone number must be digits only',
    }),
  role: Joi.string().valid('user', 'admin').default('user'),
  image: Joi.string().uri().optional(),
  createdBy: Joi.string().optional(),
});

export const loginSchema = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().required(),
});
