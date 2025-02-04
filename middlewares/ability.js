const { createMongoAbility } = require('@casl/ability');

function checkAbility(action, subject) {
    return (req, res, next) => {
        if (req.user && req.user.role.name === 'developer') {
            return next();
        }

        const rules = req.session.abilityRules;
        if (!rules) {
            return res.redirect('/forbidden');
        }

        const ability = createMongoAbility(rules);

        if (ability.can(action, subject)) {
            return next(); // Lanjutkan ke route berikutnya jika diizinkan
        } else {
            return res.redirect('/forbidden');
        }
    };
}

module.exports = { checkAbility };