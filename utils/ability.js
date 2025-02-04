const { AbilityBuilder, createMongoAbility } = require('@casl/ability');

// Fungsi untuk membuat Ability berdasarkan data user
function defineAbility(user) {
    const { can, cannot, build } = new AbilityBuilder(createMongoAbility);

    // Tambahkan permission dari user
    user.permissions.forEach((permission) => {
        can(permission.action, permission.subject);
    });

    // Tambahkan akses ke menu berdasarkan route
    // user.menus.forEach((menu) => {
    //     can('view', menu.route);
    //     if (menu.subMenus && menu.subMenus.length > 0) {
    //         menu.subMenus.forEach((subMenu) => {
    //             can('view', subMenu.route);
    //         });
    //     }
    // });

    return build();
}

module.exports = { defineAbility };