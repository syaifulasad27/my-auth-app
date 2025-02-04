const validate = (schema) => {
    return (req, res, next) => {
        const { error } = schema.validate(req.body, { abortEarly: false }); // Validasi body request
        if (error) {
            const errors = error.details.map((err) => err.message); // Ambil pesan error
            req.flash("error_msg", errors.join(", ")); // Kirim pesan error ke flash message
            return res.redirect("back"); // Redirect kembali ke halaman sebelumnya
        }
        next(); // Lanjutkan jika tidak ada error
    };
};

module.exports = validate;
