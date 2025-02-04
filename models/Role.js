const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const roleSchema = new Schema({
    name: { type: String, required: true, unique: true },
    description: { type: String },
    menus: [{ type: Schema.Types.ObjectId, ref: 'Menu' }], // Relasi ke Menu
    permissions: [{ type: Schema.Types.ObjectId, ref: 'Permission' }], // Relasi ke Permission
}, { timestamps: true });

const Role = mongoose.model('Role', roleSchema);
module.exports = Role;