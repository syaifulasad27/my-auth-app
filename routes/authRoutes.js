const express = require('express');
const { registerForm, register, activateAccount, requestActivationToken, login, loginForm, logout, renderForgotPassword, handleForgotPassword, renderResetPassword, handleResetPassword } = require('../controllers/authController');
const { authenticate, redirectIfAuthenticated } = require('../middlewares/authMiddleware');
const validate = require("../middlewares/validate");
const { registerSchema } = require("../schemas/userSchema");
const router = express.Router();

// Render form login
router.get('/login', redirectIfAuthenticated, loginForm);

// Render form register
router.get('/register', redirectIfAuthenticated, registerForm);
router.post("/register", validate(registerSchema), redirectIfAuthenticated, register);
// Route Aktivasi Akun
router.get("/activate-account/:token", redirectIfAuthenticated, activateAccount);
router.post('/request-activation', redirectIfAuthenticated, requestActivationToken);
router.get('/request-activation', redirectIfAuthenticated, (req, res) => res.render('auth/request-activation', { title: 'Request Token' })); // Form

// Proses login menggunakan Passport.js
router.post('/login', redirectIfAuthenticated, login);
router.post('/logout', authenticate, logout);

// Rute untuk render form lupa password
router.get('/forgot-password', redirectIfAuthenticated, renderForgotPassword);
// Rute untuk handle form lupa password
router.post('/forgot-password', redirectIfAuthenticated, handleForgotPassword);
// Rute untuk render form reset password
router.get('/reset-password/:token', redirectIfAuthenticated, renderResetPassword);
// Rute untuk handle reset password
router.post('/reset-password/:token', redirectIfAuthenticated, handleResetPassword);

router.get('/forbidden', (req, res) => { res.render('errors/forbidden', { status: 403, title: 'Forbidden', message: 'You do not have access to this page.' }) });

module.exports = router;