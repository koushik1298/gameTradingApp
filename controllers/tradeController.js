const model = require ('../models/trades');
const User = require('../models/user');
const Offer = require('../models/offer_trade');

 exports.index = (req,res, next)=>{
    model.find()
    .then(trades=> {
        let categories = [];
        trades.forEach(element => {
            if(categories.findIndex(cat => cat === element.category) === -1)
                categories.push(element.category);
        });
        res.render('./connection/trades',{trades, categories})
    })
    .catch(err => next(err)); 
 };
 
exports.new = (req,res)=>{
    res.render('./connection/new');
};


exports.create = (req,res,next)=>{
    let trades = new model(req.body);
    trades.host_id = req.session.user;
    trades.status = "Available";
    trades.save()
    .then(trade => {req.flash('success','trade successfully created!'); res.redirect('/tradeRoutes')})
    .catch(err=> {
        if(err.name === 'ValidationError'){
            err.status = 400;
        }
        next(err);
    });
};


exports.show = (req,res,next)=>{  
    if(!(req.params.id).match(/^[0-9a-fA-F]{24}$/))
    {
        let err = new Error('id incorrect');
        err.status = 400;
        next(err);
    }
    model.findById(req.params.id)
    .then(trade => {
        if(trade)
            res.render('./connection/trade', {trade});
        else{
            let err = new Error("trade not found with id: " + req.params.id);
            err.status = 404;
            next(err);
        }
    })
    .catch(err => next(err));
};


exports.edit = (req,res,next)=>{   
    if(!(req.params.id).match(/^[0-9a-fA-F]{24}$/))
    {
        let err = new Error('id incorrect');
        err.status = 400;
        next(err);
    }
    model.findById(req.params.id)
    .then(trade => {
        if(trade)
            res.render('./connection/edit', {trade});
        else{
            let err = new Error("trade not found with id: " + req.params.id);
            err.status = 404;
            next(err);
        }
    })
    .catch(err => next(err));
};
exports.update = (req,res,next)=> {
    let trade = req.body;
    if(!(req.params.id).match(/^[0-9a-fA-F]{24}$/))
    {
        let err = new Error('id incorrect');
        err.status = 400;
        next(err);
    }

    model.findByIdAndUpdate(req.params.id, trade, {useFindAndModify: false, runValidators: true})
    .then(trade=>{
        if(trade){
            req.flash('success','updated successfully');
            res.redirect('/tradeRoutes/' + req.params.id);
        }
        else{
            let err = new Error("trade not found with id: " + req.params.id);
            err.status = 404;
            next(err);
        }
    })
    .catch(err=> {
        if(err.name === 'ValidationError'){
            err.status = 400;
        }
        next(err);
    });
};


exports.delete = (req,res,next)=> {
    if(!(req.params.id).match(/^[0-9a-fA-F]{24}$/))
    {
        let err = new Error('id incorrect');
        err.status = 400;
        next(err);
    }
    model.findByIdAndDelete(req.params.id, {useFindAndModify: false})
    .then(trade=> {
        if(trade){
            req.flash('success','deleted successfully');
            res.redirect('/tradeRoutes');
        } else{
            let err = new Error("trade not found with id" + req.params.id);
            err.status = 404;
            next(err);
        }
    })
    .catch(err => next(err));
};

exports.watch = async (req, res, next) => {
    try {
      const userId = req.session.user;
      const tradeId = req.params.id;
  
      // Add the trade ID to the user's "watchedTrades" array
      const user = await User.findByIdAndUpdate(
        userId,
        { $addToSet: { watchedTrades: tradeId } },
        { new: true }
      );
  
      Promise.all([
        User.findById(userId),
        model.find({ host_id: userId }),
        Offer.find({ OfferedBy: userId }) // Get the offers made by the user
      ])
        .then(([user, hostTrades, offers]) => {
          const watchedTradeIds = user.watchedTrades; // Get watched trade ids from user
          return model.find({ _id: { $in: watchedTradeIds } }) // Query watched trades
            .then((watchedTrades) => {
              res.render('./user/profile', { user, hostTrades, watchedTrades, offers });
            });
        })
    } catch (error) {
      next(error);
    }
  };  

  exports.removeFromWatch = async (req, res, next) => {
    try {
      const userId = req.session.user;
      const tradeId = req.params.id;
  
      // Remove the trade ID from the user's "watchedTrades" array
      const user = await User.findByIdAndUpdate(
        userId,
        { $pull: { watchedTrades: tradeId } },
        { new: true }
      );
  
      // Get the host trades and watched trades
      const [hostTrades, watchedTrades, offers] = await Promise.all([
        model.find({ host_id: userId }),
        model.find({ _id: { $in: user.watchedTrades } }),
        Offer.find({ OfferedBy: userId }),
      ]);
  
      res.render('./user/profile', { user, hostTrades, watchedTrades, offers });
    } catch (error) {
      next(error);
    }
  };
  
  exports.createoffer = (req, res, next) => {
    let id = req.params.id; //item id that you are interested in
    let user_item = req.body.item; //user's item to trade
    Promise.all([
        model.findByIdAndUpdate(id, {status: "Offer Pending", offerby: user_item, offerto: id, offered: true}, {useFindAndModify: false, runValidators: true}),
        model.findByIdAndUpdate(user_item, {status: "Offer Pending",  offerto: id, offerby: user_item, initiated: true}, {useFindAndModify: false, runValidators: true})])
    .then(results => {
        let [trade, user_trade] = results;
        let offer = new Offer();
        offer.offer_initiated_by = req.session.user;
        offer.title = trade.title;
        offer.category = trade.category;
        offer.status = trade.status;
        offer.item_to_trade = user_item;
        offer.offer_to = id;
        offer.save()
        .then(offer => {
            res.redirect('/users/profile');
        })
        .catch(err => next(err));
    })
    .catch(err => next(err));
};

exports.canceloffer = (req, res, next) => {
    let id = req.session.user;
    let item = req.params.id;
    Offer.findOneAndDelete({offer_to: item}, {useFindAndModify: false})
    .then(offer => {
        model.findByIdAndUpdate(item, {status: 'Available', offered: false, initiated: false}, {useFindAndModify: false, runValidators: true})
        .then(trade => {
            model.findByIdAndUpdate(trade.offerby, {status: 'Available', offered: false, initiated: false}, {useFindAndModify: false, runValidators: true})
            .then(trade => {
                res.redirect('/users/profile');
            })
        })
        .catch(err => next(err));
    })
    .catch(err => next(err));
};

exports.manageoffer = (req, res, next) => {
    let id = req.params.id;
    model.findById(id)
    .then(trade => {
        if(!trade.offered){
            Offer.find({item_to_trade: id})
            .then(offer => {
                if(offer.length > 0){
                    Promise.all([model.findById(offer[0].offer_to), model.findById(offer[0].item_to_trade)])
                    .then(results => {
                        let [trade, item] = results;
                        let initiated = item.initiated;
                        res.render('./user/manage_offer', {trade, item, initiated});
                    })
                    .catch(err => next(err));
                }
                else{
                    let err = new Error('Cannot find an offer');
                    err.status = 404;
                    next(err);
                }
            })
            .catch(err => next(err));
        }
        else{
            Offer.find({offer_to: id})
            .then(offer => {
                if(offer.length > 0){
                    Promise.all([model.findById(offer[0].offer_to), model.findById(offer[0].item_to_trade)])
                    .then(results => {
                        let [trade, item] = results;
                        let initiated = trade.initiated;
                        res.render('./user/manage_offer', {trade, item, initiated});
                    })
                    .catch(err => next(err));
                }
                else{
                    let err = new Error('Cannot find an offer');
                    err.status = 404;
                    next(err);
                }
            })
            .catch(err => next(err));
        }
    })
    .catch(err => next(err));

    
};

exports.acceptoffer = (req, res, next) => {
    let id = req.session.user;
    let item = req.params.id;
    Offer.find({offer_to: item, offer_initiated_by: id}, {useFindAndModify: false})
    .then(offer => {
        model.findByIdAndUpdate(item, {status: 'Traded', intitiated: false, offered: false}, {useFindAndModify: false, runValidators: true},)
        .then(trade => {
            model.findByIdAndUpdate(trade.offerby, {status: 'Traded', initiated: false, offered: false}, {useFindAndModify: false, runValidators: true})
            .then(trade => {
                Offer.findOneAndDelete({offer_to: item}, {useFindAndModify: false})
                .then(offer => {
                    res.redirect('/users/profile');
                })
                .catch(err => next(err));
            })
        })
        .catch(err => next(err));
    })
    .catch(err => next(err));
};

exports.logout = (req, res, next)=>{
    req.session.destroy(err=>{
        if(err) 
           return next(err);
       else
            res.redirect('/');  
    });
   
 };

 exports.selectitem = (req, res, next) => {
    let id = req.params.id;
    model.find({ host_id: req.session.user})
    .then(trades => {
        if(trades.length > 0)
            res.render('./user/trade', {trades, id});
        else{
            req.flash('error', 'You don\'t have any items to trade');      
            res.redirect('back');
        }
    })
    .catch(err => next(err));
};

exports.createoffer = (req, res, next) => {
    let id = req.params.id; //item id that you are interested in
    let user_item = req.body.item; //user's item to trade
    Promise.all([
        model.findByIdAndUpdate(id, {status: "Offer Pending", offerby: user_item, offerto: id, offered: true}, {useFindAndModify: false, runValidators: true}),
        model.findByIdAndUpdate(user_item, {status: "Offer Pending",  offerto: id, offerby: user_item, initiated: true}, {useFindAndModify: false, runValidators: true})])
    .then(results => {
        let [trade, user_trade] = results;
        let offer = new Offer();
        offer.offer_initiated_by = req.session.user;
        offer.title = trade.title;
        offer.category = trade.category;
        offer.status = trade.status;
        offer.item_to_trade = user_item;
        offer.offer_to = id;
        offer.save()
        .then(offer => {
            console.log("Offer:",offer);
            res.redirect('/users/profile');
        })
        .catch(err => next(err));
    })
    .catch(err => next(err));
};

  