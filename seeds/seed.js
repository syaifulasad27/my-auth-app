const mongoose = require('mongoose');
const User = require('../models/User');
const Role = require('../models/Role');
const Permission = require('../models/Permission');
const Menu = require('../models/Menu');
const SubMenu = require('../models/SubMenu');
const bcrypt = require('bcrypt');

async function seedDatabase() {
    try {
        // Connect to MongoDB
        await mongoose.connect('mongodb://127.0.0.1/absensi_app')
            .then((result) => {
                console.log('connected to mongodb')
            }).catch((err) => {
                console.log(err)
            });

        // Clear existing data
        await User.deleteMany();
        await Role.deleteMany();
        await Permission.deleteMany();
        await Menu.deleteMany();
        await SubMenu.deleteMany();

        console.log('Existing data cleared');

        // Seed menus and sub-menus
        const subMenuDocs = await SubMenu.insertMany([
            { name: 'Manage Profile', route: '/users/profile' },
            { name: 'Manage Users', route: '/admin/manage-users' },
            { name: 'Manage Roles', route: '/admin/manage-roles' },
            { name: 'Manage Permissions', route: '/admin/manage-permissions' },
            { name: 'Manage Menus', route: '/admin/manage-menus' },
            { name: 'View Reports', route: '/finance/reports' },
        ]);

        const menuDocs = await Menu.insertMany([
            {
                name: 'Admin',
                route: '/admin',
                icon: 'fas fa-th',
                orderBy: '3',
                subMenus: [subMenuDocs[1]._id, subMenuDocs[2]._id, subMenuDocs[3]._id, subMenuDocs[4]._id],
            },
            {
                name: 'Finance',
                route: '/finance',
                icon: 'fas fa-pencil-ruler',
                orderBy: '4',
                subMenus: [subMenuDocs[5]._id],
            },
            {
                name: 'Dashboard',
                route: '/dashboard',
                icon: 'fas fa-fire',
                orderBy: '1',
                subMenus: [],
            },
            {
                name: 'User',
                route: '/Users',
                icon: 'far fa-user',
                orderBy: '2',
                subMenus: [subMenuDocs[0]._id],
            },
        ]);
        console.log('Menus and sub-menus seeded');

        // Seed permissions
        const permissions = [
            { name: 'manage-users', action: 'manage', subject: 'User', subMenu: subMenuDocs[1]._id, },
            { name: 'view-finance', action: 'view', subject: 'Finance', subMenu: subMenuDocs[5]._id, },
            { name: 'edit-profile', action: 'update', subject: 'Profile', subMenu: subMenuDocs[0]._id, },
            { name: 'view-profile', action: 'view', subject: 'Profile', subMenu: subMenuDocs[0]._id, },
        ];
        const permissionDocs = await Permission.insertMany(permissions);
        console.log('Permissions seeded');

        // Seed roles
        const roles = [
            {
                name: 'developer',
                menus: menuDocs.map((menu) => menu._id),
                permissions: permissionDocs.map((perm) => perm._id),
            },
            {
                name: 'admin',
                menus: [menuDocs[0]._id, menuDocs[3]._id],
                permissions: [permissionDocs[0]._id, permissionDocs[2]._id],
            },
            {
                name: 'finance',
                menus: [menuDocs[1]._id, menuDocs[3]._id],
                permissions: [permissionDocs[1]._id],
            },
            {
                name: 'owner',
                menus: [menuDocs[1]._id, menuDocs[2]._id, menuDocs[3]._id],
                permissions: [],
            },
            {
                name: 'user',
                menus: [menuDocs[3]._id],
                permissions: [permissionDocs[2]._id, permissionDocs[3]._id],
            },
        ];
        const roleDocs = await Role.insertMany(roles);
        console.log('Roles seeded');

        // Seed users
        const users = await Promise.all([
            {
                username: 'developer',
                email: 'developer@example.com',
                password: await bcrypt.hash('password123', 10), // Hash the password                
                images: {
                    url: 'public\\img\\avatar\\avatar-1.png',
                    filename: 'avatar-1.png'
                },
                role: roleDocs[0]._id,
                isActive: true,
            },
            {
                username: 'admin',
                email: 'admin@example.com',
                password: await bcrypt.hash('password123', 10), // Hash the password
                role: roleDocs[1]._id,
                isActive: true,
            },
            {
                username: 'finance',
                email: 'finance@example.com',
                password: await bcrypt.hash('password123', 10), // Hash the password
                role: roleDocs[2]._id,
                isActive: true,
            },
            {
                username: 'owner',
                email: 'owner@example.com',
                password: await bcrypt.hash('password123', 10), // Hash the password
                role: roleDocs[3]._id,
                isActive: true,
                isBan: true,
            },
        ]);
        await User.insertMany(users);
        console.log('Users seeded');

        // Close connection
        mongoose.connection.close();
        console.log('Database seeding complete and connection closed');
    } catch (error) {
        console.error('Error seeding database:', error);
        mongoose.connection.close();
    }
}

seedDatabase();