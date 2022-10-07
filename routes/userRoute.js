const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');


router.get('/', userController.getIndex);

router.get('/add-user', userController.getAddUser);
router.post('/add-user', userController.postAddUser);

router.get('/user-info', userController.getUserInfo);
router.post('/change-image', userController.postImage);

router.get('/lookup', userController.getLookup)
module.exports = router;