const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const permissionSchema = new Schema({
    name: { type: String, required: true },
    action: { type: String, required: true },
    subject: { type: String, required: true },
    subMenu: { type: Schema.Types.ObjectId, ref: 'SubMenu', required: true }, // Relasi ke submenu
});

const Permission = mongoose.model('Permission', permissionSchema);
module.exports = Permission;