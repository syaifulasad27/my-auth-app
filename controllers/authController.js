const passport = require('passport');
const { defineAbility } = require('../utils/ability');
const { getUserRoleWithMenus } = require('../services/roleService');
const crypto = require('crypto');
const User = require('../models/User');
const Role = require("../models/Role");
const { transporter } = require('../config/nodemailer');
const { defaultRole } = require("../config/auth");

module.exports.loginForm = (req, res) => {
    res.render('auth/login', { title: 'Login' });
}

module.exports.login = (req, res, next) => {
    passport.authenticate('local', async (err, user, info) => {
        if (err) return next(err);

        if (!user) {
            req.flash('error_msg', info.message);
            return res.redirect('/login');
        }

        req.logIn(user, async (err) => {
            if (err) return next(err);

            try {
                // Dapatkan role lengkap dengan menus dan permissions
                const roleWithMenus = await getUserRoleWithMenus(user.role._id);

                // Buat ability berdasarkan role
                const ability = defineAbility(roleWithMenus);

                // Simpan ability rules ke session
                req.session.abilityRules = ability.rules;

                req.flash('success_msg', 'You are now logged in');
                res.redirect('/users/profile');
            } catch (err) {
                console.error('Error during ability definition:', err);
                req.flash('error_msg', 'An error occurred while setting permissions');
                res.redirect('/login');
            }
        });
    })(req, res, next);
};

module.exports.registerForm = (req, res) => {
    res.render('auth/register', { title: 'Register' });
};

exports.register = async (req, res) => {
    try {
        const { username, email, password } = req.body;
        // Cek apakah email atau username sudah ada
        const existingUser = await User.findOne({ $or: [{ email }, { username }] });
        if (existingUser) {
            req.flash("error_msg", "Email or username already exists.");
            return res.redirect("/register");
        }

        // Cari role default
        const role = await Role.findOne({ name: defaultRole });
        if (!role) throw new Error("Default role not found. Please seed roles first.");

        // Buat user baru
        const user = new User({ username, email, password, role: role._id });

        // Generate activation token
        const token = crypto.randomBytes(32).toString("hex");
        user.activationToken = crypto.createHash("sha256").update(token).digest("hex");
        user.activationTokenExpires = Date.now() + 24 * 60 * 60 * 1000; // 24 jam

        await user.save();

        // Kirim email aktivasi
        const activationLink = `${process.env.BASE_URL}/activate-account/${token}`;
        const mailOptions = {
            from: process.env.EMAIL_FROM,
            to: user.email,
            subject: "Activate Your Account",
            html: `
                <h4>Welcome, ${user.username}!</h4>
                <p>Please activate your account by clicking the link below:</p>
                <a href="${activationLink}">Activate Account</a>
            `,
        };

        const transport = await transporter(); // Gunakan fungsi transporter
        await transport.sendMail(mailOptions);

        req.flash("success_msg", "Registration successful! Please check your email to activate your account.");
        res.redirect("/login");
    } catch (error) {
        console.error("Error in registration:", error);
        req.flash("error_msg", "Something went wrong. Please try again.");
        res.redirect("/register");
    }
};
// handler activation akun
exports.activateAccount = async (req, res) => {
    try {
        const token = crypto.createHash("sha256").update(req.params.token).digest("hex");

        const user = await User.findOne({
            activationToken: token,
            activationTokenExpires: { $gt: Date.now() },
        });

        if (!user) {
            req.flash("error_msg", "Activation token is invalid or has expired.");
            return res.redirect('/request-activation');
        }

        user.isActive = true;
        user.activationToken = undefined;
        user.activationTokenExpires = undefined;
        await user.save();

        req.flash("success_msg", "Account activated successfully! You can now login.");
        res.redirect("/login");
    } catch (error) {
        console.error("Error in account activation:", error);
        req.flash("error_msg", "Something went wrong. Please try again.");
        res.redirect("/register");
    }
};

// handler request token baru
module.exports.requestActivationToken = async (req, res) => {
    const { email } = req.body;

    try {
        const user = await User.findOne({ email });
        if (!user) {
            req.flash('error_msg', 'Email not found');
            return res.redirect('/request-activation');
        }

        if (user.isActive) {
            req.flash('error_msg', 'Your account is already activated');
            return res.redirect('/login');
        }

        // Generate new activation token
        const token = crypto.randomBytes(32).toString("hex");
        const activationToken = crypto.createHash("sha256").update(token).digest("hex");
        const activationTokenExpires = Date.now() + 1 * 60 * 60 * 1000; // 1 jam

        // Update user token
        user.activationToken = activationToken;
        user.activationTokenExpires = activationTokenExpires;
        await user.save();

        // Send email
        const activationLink = `${process.env.BASE_URL}/activate-account/${token}`;

        const mailOptions = {
            from: process.env.EMAIL_FROM,
            to: user.email,
            subject: 'Account Activation',
            html: `<p>Click <a href="${activationLink}">here</a> to activate your account. This link expires in 1 hour.</p>`,
        };

        const transport = await transporter(); // Gunakan fungsi transporter
        await transport.sendMail(mailOptions);

        req.flash('success_msg', 'Activation email sent');
        res.redirect('/login');
    } catch (err) {
        console.error(err);
        req.flash('error_msg', 'An error occurred');
        res.redirect('/request-activation');
    }
};

module.exports.renderForgotPassword = (req, res) => {
    res.render('auth/forgot-password', { title: 'Forgot Password' });
};
// Handle permintaan lupa password
module.exports.handleForgotPassword = async (req, res) => {
    const { email } = req.body;

    try {
        // Cek apakah email user ada
        const user = await User.findOne({ email });
        if (!user) {
            req.flash('error_msg', 'Email not found');
            return res.redirect('/forgot-password');
        }

        // Generate token reset password
        const token = crypto.randomBytes(32).toString('hex');
        const tokenExpiry = Date.now() + 3600000; // Token berlaku selama 1 jam

        user.resetPasswordToken = token;
        user.resetPasswordExpires = tokenExpiry;
        await user.save();

        // Kirim email
        const resetURL = `${process.env.BASE_URL}/reset-password/${token}`;
        const mailOptions = {
            from: process.env.EMAIL_FROM,
            to: email,
            subject: 'Password Reset Request',
            html: `<p>You requested a password reset. Click the link below to reset your password:</p>
                   <a href="${resetURL}">${resetURL}</a>
                   <p>If you didn't request this, please ignore this email.</p>`,
        };

        const transport = await transporter(); // Gunakan fungsi transporter
        const info = await transport.sendMail(mailOptions);

        req.flash('success_msg', 'Password reset link has been sent to your email');
        res.redirect('/login');
    } catch (error) {
        console.error('Error in handleForgotPassword:', error);
        req.flash('error_msg', 'An error occurred. Please try again.');
        res.redirect('/forgot-password');
    }
};
// Render halaman reset password
module.exports.renderResetPassword = async (req, res) => {
    const { token } = req.params;

    try {
        const user = await User.findOne({
            resetPasswordToken: token,
            resetPasswordExpires: { $gt: Date.now() }, // Pastikan token belum expired
        });

        if (!user) {
            req.flash('error_msg', 'Password reset token is invalid or has expired');
            return res.redirect('/forgot-password');
        }

        res.render('auth/reset-password', { token, title: 'Reset Password' });
    } catch (error) {
        console.error('Error in renderResetPassword:', error);
        req.flash('error_msg', 'An error occurred. Please try again.');
        res.redirect('/forgot-password');
    }
};
// Handle reset password
module.exports.handleResetPassword = async (req, res) => {
    const { token } = req.params;
    const { password, confirmPassword } = req.body;

    if (password !== confirmPassword) {
        req.flash('error_msg', 'Passwords do not match');
        return res.redirect(`/reset-password/${token}`);
    }

    try {
        const user = await User.findOne({
            resetPasswordToken: token,
            resetPasswordExpires: { $gt: Date.now() },
        });

        if (!user) {
            req.flash('error_msg', 'Password reset token is invalid or has expired');
            return res.redirect('/forgot-password');
        }

        // Update password tanpa hashing manual
        user.password = password; // Middleware `pre('save')` akan meng-hash password
        user.resetPasswordToken = undefined;
        user.resetPasswordExpires = undefined;
        await user.save();

        req.flash('success_msg', 'Your password has been updated. Please log in.');
        res.redirect('/login');
    } catch (error) {
        console.error('Error in handleResetPassword:', error);
        req.flash('error_msg', 'An error occurred. Please try again.');
        res.redirect('/forgot-password');
    }
};


module.exports.logout = (req, res) => {
    req.logout((err) => {
        if (err) {
            console.error(err);
            req.flash('error_msg', 'Logout failed');
            return res.redirect('/users/profile');
        }
        req.flash('success_msg', 'You have been logged out');
        res.redirect('/login');
    });
};