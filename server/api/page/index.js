'use strict';

var express = require('express');
var controller = require('./page.controller');

var router = express.Router();

router.get('/pages', controller.index);
router.get('/org/:org_id/page/:page_ref',controller.show);
router.post('/pages', controller.create);
router.put('/pages/:id', controller.update);
router.patch('/pages/:id', controller.update);
router.delete('/pages/:id', controller.destroy);

module.exports = router;
