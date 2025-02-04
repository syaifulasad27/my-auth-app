const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const subMenuSchema = new Schema({
    name: { type: String, required: true }, // Nama submenu
    route: { type: String, required: true }, // Path URL untuk submenu
    menu: { type: Schema.Types.ObjectId, ref: 'Menu', required: true }, // Relasi ke menu
    orderBy: { type: Number }, // Urutan submenu dalam menu
    status: { type: Boolean, default: true }, // Status aktif/tidak
}, { timestamps: true });

// Middleware untuk menghapus permissions sebelum submenu dihapus
subMenuSchema.pre('remove', async function (next) {
    try {
        const Permission = mongoose.model('Permission');
        // Hapus semua permission yang terkait dengan submenu ini
        await Permission.deleteMany({ subMenu: this._id });
        next();
    } catch (error) {
        next(error);
    }
});

const SubMenu = mongoose.model('SubMenu', subMenuSchema);
module.exports = SubMenu;