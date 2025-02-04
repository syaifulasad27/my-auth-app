const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const bcrypt = require('bcrypt');
const User = require('../models/User');
const { getUserRoleWithMenus } = require('../services/roleService');

// Konfigurasi LocalStrategy
passport.use(
    new LocalStrategy(
        { usernameField: 'login', passwordField: 'password' }, // 'login' adalah input untuk email/username
        async (login, password, done) => {
            try {
                // Cari user berdasarkan email atau username
                const user = await User.findOne({
                    $or: [{ email: login }, { username: login }],
                });

                if (!user) {
                    return done(null, false, { message: 'User not found' });
                }

                if (!user.isActive) {
                    return done(null, false, { message: 'Your account is not activated. Check your email or <a href="/request-activation"><strong>request a new activation link</strong></a>.' });
                }

                // Verifikasi password
                const isMatch = await bcrypt.compare(password, user.password);
                if (!isMatch) {
                    return done(null, false, { message: 'Invalid credentials' });
                }
                // Cek apakah user diban
                if (user.isBan === true) {
                    return done(null, false, { message: 'Your account has been banned. Please contact support for further assistance.' });
                }

                // Ambil role dan menu
                const roleWithMenus = await getUserRoleWithMenus(user.role._id);

                // Return user dengan data tambahan
                return done(null, {
                    id: user._id,
                    fullname: user.fullname,
                    username: user.username,
                    email: user.email,
                    role: roleWithMenus,
                });
            } catch (err) {
                return done(err);
            }
        }
    )
);

// Serialize user (simpan user ke session)
passport.serializeUser((user, done) => {
    done(null, user.id);
});

// Deserialize user (ambil user dari session)
passport.deserializeUser(async (id, done) => {
    try {
        const user = await User.findById(id).populate('role');
        if (!user) {
            return done(new Error('User not found'));
        }
        const roleWithMenus = await getUserRoleWithMenus(user.role._id);
        done(null, {
            id: user._id,
            username: user.username,
            isActive: user.isActive,
            isBan: user.isBan,
            email: user.email,
            role: roleWithMenus,
        });
    } catch (err) {
        done(err);
    }
});

module.exports = passport;
