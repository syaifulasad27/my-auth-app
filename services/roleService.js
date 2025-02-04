const Role = require('../models/Role');
const Menu = require('../models/Menu');
const Permission = require('../models/Permission');
const SubMenu = require('../models/SubMenu');

async function getUserRoleWithMenus(userId) {
    try {
        const role = await Role.findById(userId)
            .populate({
                path: 'menus', // Populate menus dari schema Role
                options: { sort: { orderBy: 1 } }, // Sort berdasarkan orderBy
                populate: { // Populate subMenus dari schema Menu
                    path: 'subMenus',
                    options: { sort: { orderBy: 1 } },
                },
            })
            .populate('permissions'); // Populate permissions jika ada

        if (!role) return null;

        // **Jika role "developer", tampilkan semua menu & submenu tanpa filter**
        if (role.name === 'developer') {
            return role.toObject(); // Kembalikan semua data tanpa filtering
        }


        // Ambil daftar permissions user
        const userPermissions = role.permissions.map((perm) => perm.subMenu.toString());

        // **Filter menu berdasarkan permissions**
        const filteredMenus = role.menus.map((menu) => {
            // Filter submenu berdasarkan permissions user
            const filteredSubMenus = menu.subMenus.filter((subMenu) =>
                userPermissions.includes(subMenu._id.toString())
            );

            return filteredSubMenus.length > 0
                ? { ...menu.toObject(), subMenus: filteredSubMenus } // Simpan hanya yang valid
                : null; // Hapus menu jika tidak ada submenu yang cocok
        }).filter(menu => menu !== null); // Hapus menu kosong

        return {
            ...role.toObject(),
            menus: filteredMenus, // Simpan hanya menu yang memiliki submenu sesuai permission
        };
    } catch (error) {
        console.error('Error in getUserRoleWithMenus:', error);
        throw new Error('Failed to retrieve user role with menus.');
    }
}

module.exports = { getUserRoleWithMenus };
