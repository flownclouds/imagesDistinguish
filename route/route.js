var express = require('express');
var router = express.Router();
var indexController = require('./../controller/indexController');

router.get('/', indexController.index);
router.get('/index', indexController.getAllDrive);
router.get('/imgSort', indexController.imgSort);
router.get('/imgSortByH', indexController.imgSortByH);
router.get('/getProgress', indexController.getProgress);
router.get('/getProgresssort', indexController.getProgresssort);
router.get('/imgSearch', indexController.imgSearch);

module.exports = router;