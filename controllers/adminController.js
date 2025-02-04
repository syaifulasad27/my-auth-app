const User = require('../models/User');
const Menu = require('../models/Menu');
const SubMenu = require('../models/SubMenu');
const Role = require('../models/Role');
const Permission = require('../models/Permission');

exports.manageUsers = async (req, res) => {
    const users = await User.find().select('-password');
    res.render('admin/manageUsers', { users });
};

exports.updateUserRole = async (req, res) => {
    const { userId, role } = req.body;
    await User.findByIdAndUpdate(userId, { role });
    res.redirect('/admin/manage-users');
};

// Tampilkan daftar user
exports.getUsers = async (req, res) => {
    try {
        const loggedInUserId = req.user.id; // Ambil ID user yang sedang login
        const developerRole = await Role.findOne({ name: 'developer' });

        const users = await User.find({
            role: { $ne: developerRole._id }, // Tidak menampilkan user dengan role developer
            _id: { $ne: loggedInUserId } // Tidak menampilkan user yang sedang login
        }).populate('role');
        const roles = await Role.find({ name: { $ne: 'developer' } });
        res.render('admin/users/index', { title: 'Manage Users', users, roles });
    } catch (error) {
        console.error(error);
        res.redirect('/admin/manage-users');
    }
};

// Tambah user baru
exports.createUser = async (req, res) => {
    try {
        const { username, email, role, isActive } = req.body;
        const existingUser = await User.findOne({ $or: [{ email }, { username }] });
        if (existingUser) {
            req.flash("error_msg", "Email or username already exists.");
            return res.redirect('/admin/manage-users');
        }
        const password = username;

        const newUser = new User({ username, email, password, role, isActive });
        await newUser.save();

        req.flash('success_msg', 'User berhasil ditambahkan!');
        res.redirect('/admin/manage-users');
    } catch (error) {
        console.error(error);
        req.flash('error_msg', 'Gagal menambahkan user.');
        res.redirect('/admin/manage-users');
    }
};

// Edit user
exports.updateUser = async (req, res) => {
    try {
        if (req.user.id == req.params.id) {
            req.flash('error_msg', 'Users not found.');
            return res.redirect('/admin/manage-users');
        }
        const { isBan, role, isActive } = req.body;
        const updatedUser = await User.findByIdAndUpdate(req.params.id, { role, isActive, isBan }, { new: true });
        if (!updatedUser) {
            req.flash('error_msg', 'User not Found.');
            return res.redirect('/admin/manage-users');
        }

        req.flash('success_msg', 'User berhasil diperbarui!');
        res.redirect('/admin/manage-users');
    } catch (error) {
        console.error(error);
        req.flash('error_msg', 'Gagal memperbarui user.');
        res.redirect('/admin/manage-users');
    }
};

// Hapus user
exports.deleteUser = async (req, res) => {
    try {
        if (req.user.id == req.params.id) {
            req.flash('error_msg', 'Users not found.');
            return res.redirect('/admin/manage-users');
        }
        const user = await User.findByIdAndDelete(req.params.id);
        if (!user) {
            req.flash('error_msg', 'User not found.');
            return res.redirect('/admin/manage-users');
        }
        req.flash('success_msg', 'User berhasil dihapus!');
        res.redirect('/admin/manage-users');
    } catch (error) {
        console.error(error);
        req.flash('error_msg', 'Gagal menghapus user.');
        res.redirect('/admin/manage-users');
    }
};

// Tambah menu
exports.createMenu = async (req, res) => {
    try {
        const { name, route, icon, orderBy, status } = req.body;

        const newMenu = new Menu({ name, route, icon, orderBy, status });
        await newMenu.save();

        req.flash('success_msg', 'Menu created successfully.');
        res.redirect('/admin/manage-menus');
    } catch (error) {
        res.status(500).json({ success: false, message: 'Failed to create menu.', error: error.message });
    }
};
// Ambil semua menu
exports.getMenus = async (req, res) => {
    try {
        const menus = await Menu.find().sort({ orderBy: 1 });
        res.render('admin/menu/index', {
            menus,
            title: 'Menu Management',
        });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Failed to fetch menus.', error: error.message });
    }
};
// Update menu
exports.updateMenu = async (req, res) => {
    try {
        const { id } = req.params;
        const updates = req.body;

        const updatedMenu = await Menu.findByIdAndUpdate(id, updates, { new: true });
        if (!updatedMenu) {
            req.flash('error_msg', 'Menu not Found.');
            return res.redirect('/admin/manage-menus');
        }

        req.flash('success_msg', 'Menu updated successfully.');
        res.redirect('/admin/manage-menus');
    } catch (error) {
        res.status(500).json({ success: false, message: 'Failed to update menu.', error: error.message });
    }
};
// Hapus menu
exports.deleteMenu = async (req, res) => {
    try {
        const { id } = req.params;

        // Temukan menu berdasarkan ID
        const menu = await Menu.findById(id);
        if (!menu) {
            req.flash('error_msg', 'Menu not found.');
            return res.redirect('/admin/manage-menus');
        }
        // Hapus menu (middleware akan otomatis menghapus submenu terkait)
        await menu.remove();

        req.flash('success_msg', 'Menu deleted successfully.');
        res.redirect('/admin/manage-menus');
    } catch (error) {
        res.status(500).json({ success: false, message: 'Failed to delete menu.', error: error.message });
    }
};

// Tambah submenu berdasarkan menu_id
exports.createSubMenu = async (req, res) => {
    try {
        const { menu_id } = req.params; // Ambil menu_id dari route params
        const { name, route, orderBy, status } = req.body;

        // Validasi apakah menu_id ada di database
        const menu = await Menu.findById(menu_id);
        if (!menu) {
            req.flash('error_msg', 'Menu not found.');
            return res.redirect(`/admin/manage-menus`);
        }

        // Buat submenu baru
        const newSubMenu = new SubMenu({
            name,
            route,
            orderBy,
            status
        });
        await newSubMenu.save();

        // Tambahkan ID submenu ke array subMenus di dokumen Menu
        menu.subMenus.push(newSubMenu._id);
        await menu.save(); // Simpan perubahan di dokumen Menu

        req.flash('success_msg', 'SubMenu created successfully.');
        res.redirect(`/admin/manage-menus/submenu/${menu_id}`)
    } catch (error) {
        res.status(500).json({ success: false, message: 'Failed to create submenu.', error: error.message });
    }
};
// Ambil semua submenu berdasarkan menu_id
exports.getSubMenus = async (req, res) => {
    try {
        const { menu_id } = req.params; // Ambil menu_id dari route params

        // Validasi apakah menu_id ada di database
        const menu = await Menu.findById(menu_id).populate('subMenus');
        if (!menu) {
            req.flash('error_msg', 'Menu not Found.');
            return res.redirect('/admin/manage-menus');
        }

        const subMenus = menu.subMenus;

        res.render('admin/menu/submenu', {
            subMenus,
            menu_id,
            title: 'Sub Menu Management',
        });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Failed to fetch submenus.', error: error.message });
    }
};
// Update submenu berdasarkan menu_id dan id submenu
exports.updateSubMenu = async (req, res) => {
    try {
        const { menu_id, id } = req.params; // Ambil menu_id dan id submenu dari route params
        const updates = req.body;

        // Validasi apakah menu_id ada di database
        const menu = await Menu.findById(menu_id);
        if (!menu) {
            req.flash('error_msg', 'Menu not found.');
            return res.redirect(`/admin/manage-menus`);
        }

        // Update submenu berdasarkan id
        const updatedSubMenu = await SubMenu.findByIdAndUpdate(id, updates, { new: true });
        if (!updatedSubMenu) {
            req.flash('error_msg', 'SubMenu not found.');
            return res.redirect(`/admin/manage-menus/submenu/${menu_id}`)
        }

        req.flash('success_msg', 'SubMenu updated successfully.');
        res.redirect(`/admin/manage-menus/submenu/${menu_id}`)
    } catch (error) {
        res.status(500).json({ success: false, message: 'Failed to update submenu.', error: error.message });
    }
};
// Hapus submenu berdasarkan menu_id dan id submenu
exports.deleteSubMenu = async (req, res) => {
    try {
        const { menu_id, id } = req.params; // Ambil menu_id dan id submenu dari route params

        // Validasi apakah menu_id ada di database
        const menu = await Menu.findById(menu_id);
        if (!menu) {
            req.flash('error_msg', 'Menu not found.');
            return res.redirect(`/admin/manage-menus`)
        }

        // Hapus submenu berdasarkan id
        const subMenu = await SubMenu.findById(id);
        if (!subMenu) {
            req.flash('error_msg', 'SubMenu not found.');
            return res.redirect(`/admin/manage-menus/submenu/${menu_id}`)
        }
        // Hapus menu (middleware akan otomatis menghapus submenu terkait)
        await subMenu.remove();
        // Hapus ID submenu dari array `subMenus` di dokumen Menu
        await Menu.findByIdAndUpdate(menu_id, {
            $pull: { subMenus: id } // Hapus ID submenu dari array
        });

        req.flash('success_msg', 'SubMenu deleted successfully.');
        res.redirect(`/admin/manage-menus/submenu/${menu_id}`)
    } catch (error) {
        res.status(500).json({ success: false, message: 'Failed to delete submenu.', error: error.message });
    }
};

// Tambah role
exports.createRole = async (req, res) => {
    try {
        const { name, description } = req.body;

        const newrole = new Role({ name, description });
        await newrole.save();

        req.flash('success_msg', 'Role created successfully.');
        res.redirect('/admin/manage-roles');
    } catch (error) {
        res.status(500).json({ success: false, message: 'Failed to create role.', error: error.message });
    }
};
// Ambil semua role
exports.getRoles = async (req, res) => {
    try {
        const roles = await Role.find().sort({ _id: 1 });
        res.render('admin/role/index', {
            roles,
            title: 'Role Management',
        });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Failed to fetch roles.', error: error.message });
    }
};
// Update role
exports.updateRole = async (req, res) => {
    try {
        const { id } = req.params;
        const updates = req.body;

        const updatedrole = await Role.findByIdAndUpdate(id, updates, { new: true });
        if (!updatedrole) {
            req.flash('error_msg', 'Role not Found.');
            return res.redirect('/admin/manage-roles');
        }

        req.flash('success_msg', 'Role updated successfully.');
        res.redirect('/admin/manage-roles');
    } catch (error) {
        res.status(500).json({ success: false, message: 'Failed to update role.', error: error.message });
    }
};
// Hapus role
exports.deleteRole = async (req, res) => {
    try {
        const { id } = req.params;

        // Temukan role berdasarkan ID
        const deletedRole = await Role.findByIdAndDelete(id);
        if (!deletedRole) {
            req.flash('error_msg', 'Role not found.');
            return res.redirect('/admin/manage-roles');
        }

        req.flash('success_msg', 'role deleted successfully.');
        res.redirect('/admin/manage-roles');
    } catch (error) {
        res.status(500).json({ success: false, message: 'Failed to delete role.', error: error.message });
    }
};
// Ambil semua menu for manage access menu by role
module.exports.getRoleAccess = async (req, res) => {
    try {
        const role = await Role.findById(req.params.id).populate('menus');
        if (!role) {
            req.flash('error', 'Role tidak ditemukan.');
            return res.redirect('/admin/manage-roles');
        }

        const menus = await Menu.find().sort({ orderBy: 1 });

        res.render('admin/role/manageAccess', {
            title: 'Manage Role Access',
            role,
            menus,
        });
    } catch (err) {
        console.error(err);
        req.flash('error_msg', 'Gagal mengambil data role dan menu.');
        res.redirect('/admin/manage-roles');
    }
};

// Memperbarui akses menu berdasarkan role
module.exports.updateRoleAccess = async (req, res) => {
    try {
        const { menuId, isChecked } = req.body;
        const roleId = req.params.id;

        const role = await Role.findById(roleId);
        if (!role) return res.status(404).json({ message: 'Role tidak ditemukan.' });

        if (isChecked) {
            // Tambahkan menu ke role jika belum ada
            if (!role.menus.includes(menuId)) {
                role.menus.push(menuId);
            }
        } else {
            // Hapus menu dari role jika ada
            role.menus = role.menus.filter(id => id.toString() !== menuId);
            // Dapatkan submenu-submenu terkait dengan menu yang dihapus
            const menu = await Menu.findById(menuId).populate('subMenus'); // Populasi submenu terkait
            if (menu) {
                // Ambil ID submenu yang terkait dengan menu ini
                const submenuIds = menu.subMenus.map(subMenu => subMenu._id);

                // Cari semua permission yang memiliki subMenu yang ada dalam submenuIds
                const permissionsToDelete = await Permission.find({ subMenu: { $in: submenuIds } });

                // Hapus permission ID yang terkait dengan submenu ini dari permissions di role
                for (let permission of permissionsToDelete) {
                    if (role.permissions.includes(permission._id)) {
                        // Hapus permission dari role.permissions
                        role.permissions = role.permissions.filter(id => id.toString() !== permission._id.toString());
                    }
                }
            }
        }

        await role.save();
        res.json({ message: 'Akses menu berhasil diperbarui.' });
        // req.flash('success_msg', 'Akses menu berhasil diperbarui.');
        // res.redirect(`/admin/manage-roles/${roleId}`);
    } catch (err) {
        console.error(err);
        req.flash('error_msg', 'Gagal memperbarui akses menu.');
        res.redirect('/admin/manage-roles');
    }
};
// getManagePermission
module.exports.getManagePermission = async (req, res) => {
    try {
        // Ambil data role dengan menu terkait
        const role = await Role.findById(req.params.id).populate('menus');

        if (!role) {
            return res.status(404).json({ success: false, message: 'Role tidak ditemukan.' });
        }

        // Ambil semua menu yang dimiliki role
        const menuIds = role.menus.map(menu => menu._id);

        // Ambil semua submenu yang terkait dengan menu tersebut
        const menusWithSubMenus = await Menu.find({ _id: { $in: menuIds } }).populate('subMenus');
        // Buat pemetaan submenu ke menu
        let subMenuToMenuMap = {};
        menusWithSubMenus.forEach(menu => {
            menu.subMenus.forEach(subMenu => {
                subMenuToMenuMap[subMenu._id.toString()] = menu.name;
            });
        });

        // Ambil semua permission berdasarkan submenu yang ada dalam menu tersebut
        const subMenuIds = menusWithSubMenus.flatMap(menu => menu.subMenus.map(sub => sub._id));
        const permissions = await Permission.find({ subMenu: { $in: subMenuIds } }).populate('subMenu');

        // Tambahkan nama menu ke setiap permission menggunakan mapping
        const permissionsWithMenu = permissions.map(permission => ({
            ...permission.toObject(),
            menuName: subMenuToMenuMap[permission.subMenu?._id.toString()] || 'Unknown Menu'
        }));

        return res.json({
            success: true,
            permissions: permissionsWithMenu,
            rolePermissions: role.permissions.map(p => p.toString()) // Kirim array id permissions yang dimiliki role
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: 'Terjadi kesalahan pada server.' });
    }
};
module.exports.updatePermissionAccess = async (req, res) => {
    try {
        const { permissionId, isChecked } = req.body;
        const roleId = req.params.id;

        const role = await Role.findById(roleId);
        if (!role) {
            return res.status(404).json({ success: false, message: 'Role tidak ditemukan.' });
        }

        if (isChecked) {
            // Tambahkan permission jika belum ada
            if (!role.permissions.includes(permissionId)) {
                role.permissions.push(permissionId);
            }
        } else {
            // Hapus permission dari array
            role.permissions = role.permissions.filter(id => id.toString() !== permissionId);
        }

        await role.save();

        return res.json({ success: true, message: 'Permission berhasil diperbarui.' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: 'Terjadi kesalahan pada server.' });
    }
};

// Tambah permission
exports.createPermission = async (req, res) => {
    try {
        const { name, action, subject, subMenu } = req.body;

        if (!name || !action || !subject || !subMenu) {
            return res.status(400).json({ message: 'Semua field wajib diisi' });
        }

        // Simpan semua action & subject dalam satu permission
        for (let i = 0; i < action.length; i++) {
            const newPermission = new Permission({
                subMenu: subMenu,
                name: name,
                action: action[i],
                subject: subject[i],
            });
            await newPermission.save();
        }

        req.flash('success_msg', 'Permission created successfully.');
        res.redirect('/admin/manage-permissions');
    } catch (error) {
        res.status(500).json({ success: false, message: 'Failed to create permission.', error: error.message });
    }
};
// Ambil semua permission
exports.getPermissions = async (req, res) => {
    try {
        const menus = await Menu.find().sort({ orderBy: 1 });
        const permissions = await Permission.find().populate('subMenu').sort({ _id: 1 });
        // Hubungkan permission ke menu berdasarkan subMenu yang dimilikinya
        permissions.forEach(permission => {
            if (permission.subMenu) {
                const relatedMenu = menus.find(menu =>
                    menu.subMenus.some(subMenuId => subMenuId.equals(permission.subMenu._id))
                );
                permission.menu = relatedMenu || null; // Tambahkan menu yang sesuai atau null jika tidak ada
            }
        });
        res.render('admin/permission/index', {
            permissions,
            menus,
            title: 'Permission Management',
        });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Failed to fetch permissions.', error: error.message });
    }
};
// Update permission
exports.updatePermission = async (req, res) => {
    try {
        const { name, action, subject, subMenu } = req.body;
        if (!name || !action || !subject || !subMenu) {
            req.flash('error_msg', 'Semua field wajib diisi');
            return res.redirect('/admin/manage-permissions');
        }
        const { id } = req.params;
        const updates = req.body;

        const updatedpermission = await Permission.findByIdAndUpdate(id, updates, { new: true });
        if (!updatedpermission) {
            req.flash('error_msg', 'permission not Found.');
            return res.redirect('/admin/manage-permissions');
        }

        req.flash('success_msg', 'permission updated successfully.');
        res.redirect('/admin/manage-permissions');
    } catch (error) {
        res.status(500).json({ success: false, message: 'Failed to update permission.', error: error.message });
    }
};
// Hapus permission
exports.deletePermission = async (req, res) => {
    try {
        const { id } = req.params;

        // Temukan permission berdasarkan ID
        const deletedPermission = await Permission.findByIdAndDelete(id);
        if (!deletedPermission) {
            req.flash('error_msg', 'Permission not found.');
            return res.redirect('/admin/manage-permissions');
        }

        req.flash('success_msg', 'permission deleted successfully.');
        res.redirect('/admin/manage-permissions');
    } catch (error) {
        res.status(500).json({ success: false, message: 'Failed to delete permission.', error: error.message });
    }
};
// Ambil submenu berdasarkan menu
exports.getSubMenusByMenu = async (req, res) => {
    try {
        const menu = await Menu.findById(req.body.menuId).populate('subMenus');
        const subMenus = menu.subMenus;
        res.json(subMenus);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Gagal mengambil data submenu' });
    }
};