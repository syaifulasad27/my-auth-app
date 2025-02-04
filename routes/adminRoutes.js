const express = require('express');
// const { manageUsers, updateUserRole } = require('../controllers/adminController');
const { checkAbility } = require('../middlewares/ability');
const { authenticate, onlyDeveloper } = require('../middlewares/authMiddleware');
const { getUsers, createUser, updateUser, deleteUser, createMenu, getMenus, updateMenu, deleteMenu, createSubMenu, getSubMenus, updateSubMenu, deleteSubMenu, createRole, getRoles, updateRole, deleteRole, getRoleAccess, updateRoleAccess, getManagePermission, updatePermissionAccess, createPermission, getPermissions, updatePermission, deletePermission, getSubMenusByMenu, } = require('../controllers/adminController');
const validate = require("../middlewares/validate");
const { usersSchema } = require("../schemas/userSchema");
const router = express.Router();

// router.get('/manage-users', authenticate, manageUsers);
// router.post('/update-role', authenticate, updateUserRole);
// ✅ Route daftar user
router.get('/manage-users', authenticate, checkAbility('read', 'Users'), getUsers);
router.post('/manage-users', authenticate, checkAbility('cread', 'Users'), validate(usersSchema), createUser);
router.put('/manage-users/:id', authenticate, checkAbility('update', 'Users'), updateUser);
router.delete('/manage-users/:id', authenticate, checkAbility('delete', 'Users'), deleteUser);

// Menu Routes
router.post('/manage-menus', authenticate, onlyDeveloper, createMenu); // Tambah menu
router.get('/manage-menus', authenticate, onlyDeveloper, getMenus); // Ambil semua menu
router.put('/manage-menus/:id', authenticate, onlyDeveloper, updateMenu); // Update menu
router.delete('/manage-menus/:id', authenticate, onlyDeveloper, deleteMenu); // Hapus menu

// SubMenu Routes
router.post('/manage-menus/submenu/:menu_id', authenticate, onlyDeveloper, createSubMenu); // Tambah submenu berdasarkan id menu
router.get('/manage-menus/submenu/:menu_id', authenticate, onlyDeveloper, getSubMenus); // Ambil semua submenu berdasarkan id menu
router.put('/manage-menus/submenu/:menu_id/:id', authenticate, onlyDeveloper, updateSubMenu); // Update submenu berdasarkan id menu
router.delete('/manage-menus/submenu/:menu_id/:id', authenticate, onlyDeveloper, deleteSubMenu); // Hapus submenu berdasarkan id menu

// Role Routes
router.post('/manage-roles', authenticate, onlyDeveloper, createRole); // Tambah Role
router.get('/manage-roles', authenticate, onlyDeveloper, getRoles); // Ambil semua Role
router.put('/manage-roles/:id', authenticate, onlyDeveloper, updateRole); // Update Role
router.delete('/manage-roles/:id', authenticate, onlyDeveloper, deleteRole); // Hapus Role
router.get('/manage-roles/:id', authenticate, onlyDeveloper, getRoleAccess); // Ambil semua Role
router.post('/manage-roles/:id/update', authenticate, onlyDeveloper, updateRoleAccess); // Memperbarui akses menu berdasarkan role
router.get('/manage-roles/:id/permissions', authenticate, onlyDeveloper, getManagePermission);
router.post('/manage-roles/:id/update-permission', authenticate, onlyDeveloper, updatePermissionAccess); // Memperbarui role permission

// Permission Routes
router.post('/manage-permissions', authenticate, onlyDeveloper, createPermission); // Tambah Permission
router.get('/manage-permissions', authenticate, onlyDeveloper, getPermissions); // Ambil semua Permission
router.put('/manage-permissions/:id', authenticate, onlyDeveloper, updatePermission); // Update Permission
router.delete('/manage-permissions/:id', authenticate, onlyDeveloper, deletePermission); // Hapus Permission
router.post('/manage-permissions/submenu', authenticate, onlyDeveloper, getSubMenusByMenu); // Ajax Permission

module.exports = router;