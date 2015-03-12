'use strict';

var express = require('express');
var controller = require('./organization.controller');
var auth = require('../../auth/auth.service');

var router = express.Router();

router.get('/', controller.index);
router.post('/feed',auth.isAuthenticated(),controller.getFeed);
router.get('/:id', auth.isAuthenticated(),controller.show);
router.get('/code/:id', controller.findByCode);
router.post('/', auth.isAuthenticated(),controller.create);
router.put('/:id', controller.update);
router.patch('/:id', controller.update);
router.delete('/:id', controller.destroy);

module.exports = router;
