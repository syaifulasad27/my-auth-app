function authenticate(req, res, next) {
    if (req.isAuthenticated()) {
        // Cek apakah user diban
        if (req.user.isBan) {
            return res.status(403).send('Your account has been banned. Please contact support for further assistance.'); // Hentikan dengan status 403
        }
        return next();
    }
    req.flash('error_msg', 'Anda harus login terlebih dahulu!');
    return res.redirect('/login');
}

function redirectIfAuthenticated(req, res, next) {
    if (req.isAuthenticated()) {
        req.flash('info_msg', 'Anda sudah login!');
        return res.redirect('/users/profile');
    }
    next();
}

function onlyDeveloper(req, res, next) {
    if (req.user && req.user.role.name === 'developer') {
        return next(); // Developer diizinkan lanjut
    }
    return res.redirect('/forbidden');
}

module.exports = { authenticate, redirectIfAuthenticated, onlyDeveloper };