const User = require('../models/User');
const bcrypt = require('bcrypt');
const fs = require('fs');
const path = require('path');

exports.viewProfile = async (req, res) => {
    try {
        if (!req.user) {
            return res.status(401).send('User not authenticated');
        }
        const user = await User.findById(req.user.id);
        if (!user) {
            return res.status(404).send('User not found');
        }
        res.render('profile/index', {
            user,
            title: 'My Profile',
        });
    } catch (error) {
        console.error(error);
        res.status(500).send('Internal Server Error');
    }
};
exports.viewProfileUpdate = async (req, res) => {
    try {
        if (!req.user) {
            return res.status(401).send('User not authenticated');
        }
        const user = await User.findById(req.user.id);
        if (!user) {
            return res.status(404).send('User not found');
        }
        res.render('profile/edit', {
            user,
            title: 'Edit Profile',
        });
    } catch (error) {
        console.error(error);
        res.status(500).send('Internal Server Error');
    }
};

exports.updateProfile = async (req, res) => {
    try {
        const user = await User.findById(req.user.id);

        if (!user) {
            req.flash('error_msg', 'User tidak ditemukan');
            return res.redirect('/users/profile/update');
        }

        if (req.file) {
            // Hapus gambar lama jika bukan default
            if (user.images.length > 0 && user.images[0].filename !== 'avatar-1.png') {
                const oldImagePath = path.join(__dirname, '../public/assets/img/avatar', user.images[0].filename);
                if (fs.existsSync(oldImagePath)) {
                    fs.unlinkSync(oldImagePath);
                }
            }

            // Simpan gambar baru
            user.images = [{
                url: `/assets/img/avatar/${req.file.filename}`,
                filename: req.file.filename
            }];
        }

        // Update data lainnya
        // user.name = req.body.name || user.name;

        await user.save();
        req.flash('success_msg', 'Profile berhasil diperbarui');
        res.redirect('/users/profile/update');
    } catch (error) {
        console.error(error);
        req.flash('error_msg', 'Terjadi kesalahan saat memperbarui profile');
        res.redirect('/users/profile/update');
    }
};

// Menampilkan form ubah password
exports.viewChangePassword = async (req, res) => {
    try {
        if (!req.user) {
            return res.status(401).send('User not authenticated');
        }
        const user = await User.findById(req.user.id);
        if (!user) {
            return res.status(404).send('User not found');
        }
        res.render('profile/change-password', {
            title: 'Ubah Password',
            user
        });
    } catch (error) {
        req.flash('error_msg', 'Terjadi kesalahan.');
        res.redirect('/users/profile');
    }
};

// Mengubah password user
exports.changePassword = async (req, res) => {
    try {
        const { current_password, new_password, confirm_password } = req.body;
        const user = await User.findById(req.user.id);

        // Cek password lama
        const match = await bcrypt.compare(current_password, user.password);
        if (!match) {
            req.flash('error_msg', 'Password lama salah.');
            return res.redirect('/users/profile/change-password');
        }

        if (new_password == current_password) {
            req.flash('error_msg', 'Password lama dan password baru tidak boleh sama, coba kembali.');
            return res.redirect('/users/profile/change-password');
        }
        // Cek konfirmasi password baru
        if (new_password !== confirm_password) {
            req.flash('error_msg', 'Konfirmasi password tidak cocok.');
            return res.redirect('/users/profile/change-password');
        }

        // Hash password baru
        user.password = new_password;
        await user.save();

        req.flash('success_msg', 'Password berhasil diubah.');
        res.redirect('/users/profile');
    } catch (error) {
        console.error(error);
        req.flash('error_msg', 'Terjadi kesalahan.');
        res.redirect('/users/profile/change-password');
    }
};
