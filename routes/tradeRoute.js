const express = require('express');
const controller = require('../controllers/tradeController');
const {isLoggedIn, isUser} = require('../middlewares/auth');
const {validateId} = require('../middlewares/validation');

const router = express.Router();

router.get('/', controller.index);

router.get('/new', isLoggedIn,controller.new);

router.post('/', isLoggedIn,controller.create)

router.get('/:id', controller.show)

router.get('/:id/edit', isUser,validateId,controller.edit)

router.put('/:id', isLoggedIn,isUser,validateId,controller.update)

router.delete('/:id', isLoggedIn,isUser,validateId,controller.delete)

router.get('/watchRoutes/:id', controller.watch);

router.get('/removeWatch/:id', controller.removeFromWatch);

router.post('/canceloffer/:id', isLoggedIn, controller.canceloffer);

router.post('/manageoffer/:id', isLoggedIn, controller.manageoffer);


router.post('/acceptoffer/:id', isLoggedIn, controller.acceptoffer);


router.get('/trade/:id', isLoggedIn,controller.selectitem);


router.post('/trade/offer/:id', validateId, controller.createoffer);

module.exports = router;