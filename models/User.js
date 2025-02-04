const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const bcrypt = require('bcrypt');


const userSchema = new mongoose.Schema({
    username: { type: String, required: true, unique: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    images: [
        {
            url: String,
            filename: String
        }
    ],
    role: { type: Schema.Types.ObjectId, ref: 'Role', required: true },
    isActive: { type: Boolean, default: false }, // Status aktivasi email
    isBan: { type: Boolean, default: false }, // Status banned
    activationToken: String, // Token untuk aktivasi
    activationTokenExpires: Date, // Masa berlaku token aktivasi
    resetPasswordToken: String, // Token untuk reset password
    resetPasswordExpires: Date, // Masa berlaku token reset
});

userSchema.pre('save', async function (next) {
    if (!this.isModified('password')) return next();
    this.password = await bcrypt.hash(this.password, 10);
    next();
});

module.exports = mongoose.model('User', userSchema);