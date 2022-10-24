const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');

router.get('/add-user', userController.getAddUser);
router.post('/add-user', userController.postAddUser);

router.get('/user-info', userController.getUserInfo);
router.post('/change-image', userController.postImage);

router.get('/lookup', userController.getLookup)

router.get('/lookupAjax', userController.getLookupAjax)

router.get('/test', userController.getTest);
router.get('/test1', userController.getTestSetUp);
module.exports = router;