const express = require('express');
const { viewProfile, viewProfileUpdate, updateProfile, viewChangePassword, changePassword } = require('../controllers/profileController');
const { checkAbility } = require('../middlewares/ability');
const { authenticate } = require('../middlewares/authMiddleware');
const upload = require('../config/multer');
const router = express.Router();

router.get('/profile', authenticate, checkAbility('view', 'Profile'), viewProfile);

router.get('/profile/update', authenticate, checkAbility('update', 'Profile'), viewProfileUpdate);
router.post('/profile/update', authenticate, checkAbility('update', 'Profile'), upload.single('avatar'), updateProfile);
router.get('/profile/change-password', authenticate, checkAbility('update', 'Profile'), viewChangePassword);
router.post('/profile/change-password', authenticate, checkAbility('update', 'Profile'), changePassword);


module.exports = router;