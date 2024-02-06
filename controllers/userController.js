const model = require('../models/user');
const trades = require('../models/trades');
const Offer = require('../models/offer_trade');

exports.new = (req,res)=>{
    res.render('./user/signup');
};

//get details from login form 
exports.login = (req, res, next)=>{
        let email = req.body.email;
        let password = req.body.password;
        model.findOne({ email: email }) 
        .then(user => {
            if (!user) {
                req.flash('error', 'Not Registered with this email Id, Please Check !');  
                res.redirect('/users/login');
                } else {
                user.comparePassword(password)
                .then(result=>{
                    if(result) {
                        
                        req.session.user = user._id;
                        req.session.name = user.firstName;
                        req.session.lastName = user.lastName;
                        
                        req.flash('success', 'You have successfully logged in !');
                        res.redirect('/users/profile');
                } else {
                    req.flash('error', 'wrong password');      
                    res.redirect('/users/login');
                }
                });     
            }     
        })
        .catch(err => next(err));
};


exports.logoff = (req,res,next) => {
    req.session.destroy(err=>{
        if(err)
            return next(err);
        else{    
            res.redirect('/users/login');
        }
    });
};

exports.profile = (req, res, next) => {
    const userId = req.session.user;
  
    Promise.all([
      model.findById(userId),
      trades.find({ host_id: userId }),
      Offer.find({offer_initiated_by: userId}), Offer.find(),
    ])
      .then(([user, hostTrades, offers]) => {
        const watchedTradeIds = user.watchedTrades; // Get watched trade ids from user
        return trades.find({ _id: { $in: watchedTradeIds } }) // Query watched trades
          .then((watchedTrades) => {
            console.log(watchedTrades);
            res.render('./user/profile', { user, hostTrades, watchedTrades, offers });
          });
      })
      .catch(err => next(err));
  };
  

exports.create = (req,res,next) => {
    let user = new model(req.body); 
    user.save() 
    .then(user=> {
        req.flash('success','User Successfully registered! Please login');
        res.redirect('/users/login')
    })
    .catch(err=>{
        if (err.name === 'ValidationError'){
            req.flash('error',err.message);
            return res.redirect('/users/signup');
        }
        if(err.code === 11000) { 
            req.flash('error','Email address already used by other User! Please provide a different email address');
            return res.redirect('/users/signup');
        }
        next(err);
    });
};

exports.getUserLogin = (req, res, next) => {
    return res.render('./user/login');
}

