const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const menuSchema = new Schema({
    name: { type: String, required: true },
    route: { type: String, required: true },
    icon: { type: String, required: true },
    orderBy: { type: Number, required: true },
    subMenus: [{ type: Schema.Types.ObjectId, ref: 'SubMenu' }], // Relasi ke SubMenu
});

// Middleware untuk menghapus semua SubMenu terkait sebelum menu dihapus
menuSchema.pre('remove', async function (next) {
    try {
        const SubMenu = mongoose.model('SubMenu');
        const Permission = mongoose.model('Permission');
        // Hapus semua submenu berdasarkan array subMenus
        await SubMenu.deleteMany({ _id: { $in: this.subMenus } });
        // Hapus semua permission yang terkait dengan submenu yang dihapus
        await Permission.deleteMany({ subMenu: { $in: this.subMenus } });
        next();
    } catch (error) {
        next(error);
    }
});

const Menu = mongoose.model('Menu', menuSchema);
module.exports = Menu;
