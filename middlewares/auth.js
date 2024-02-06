const trades = require('../models/trades');

exports.isGuest = (req,res,next)=> {
    if(!req.session.user)
        return next();
    else{
          req.flash('error','You are logged in already');
          return res.redirect('/users/profile');
      } 
};

exports.isLoggedIn = (req, res, next)=>{
    if(req.session.user){
        return next();}
    else{
          req.flash('error','Please login to get the access of the website');
          return res.redirect('/users/login');
      }
};

exports.isUser = (req, res, next) => {
    let id = req.params.id;
    trades.findById(id)
    .then(trade=> {
        if(trade) {
            if(trade.host_id == req.session.user){
                next();
            } else{
                let err = new Error('Unauthorized to access the resources of website');
                err.status = 401;
                return next(err);
            }
        }
    })
  
};