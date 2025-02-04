const Joi = require("joi");

const registerSchema = Joi.object({
    username: Joi.string().alphanum().min(3).max(30).required().messages({
        "string.empty": "Username is required.",
        "string.min": "Username must be at least 3 characters.",
        "string.max": "Username must not exceed 30 characters.",
        "any.required": "Username is required.",
    }),
    email: Joi.string().email().required().messages({
        "string.email": "Please enter a valid email address.",
        "any.required": "Email is required.",
    }),
    password: Joi.string().min(6).required().messages({
        "string.min": "Password must be at least 6 characters.",
        "any.required": "Password is required.",
    }),
    passwordConfirm: Joi.any().valid(Joi.ref("password")).required().messages({
        "any.only": "Password confirmation does not match.",
        "any.required": "Password confirmation is required.",
    }),
});

const usersSchema = Joi.object({
    username: Joi.string().alphanum().min(3).max(30).required().messages({
        "string.empty": "Username is required.",
        "string.min": "Username must be at least 3 characters.",
        "string.max": "Username must not exceed 30 characters.",
        "any.required": "Username is required.",
    }),
    email: Joi.string().email().required().messages({
        "string.email": "Please enter a valid email address.",
        "any.required": "Email is required.",
    }),
    role: Joi.string().required().messages({
        "any.required": "Role is required.",
    }),
    isActive: Joi.string().required().messages({
        "any.required": "IsActive is required.",
    }),
});

module.exports = { registerSchema, usersSchema };
