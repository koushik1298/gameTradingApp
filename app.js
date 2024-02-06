const express = require('express');
const morgan = require('morgan');
const methodOverride = require('method-override');
const mongoose = require('mongoose');
const session = require('express-session');
const MongoStore = require('connect-mongo');
const flash = require('connect-flash');
const mainRoute = require('./routes/mainRoute.js');
const tradeRoute = require('./routes/tradeRoute.js');
const userRoutes = require('./routes/userRoutes.js');
//create app 
const app = express();

//configure app 
let port=3010;
let host='localhost';
app.set('view engine','ejs');  

mongoose.connect('mongodb://127.0.0.1:27017/nbadproject', {useNewUrlParser:true, useUnifiedTopology:true})
.then(()=>{
    //starting the server
    app.listen(port, host, () => {
        console.log("Server is running on port :: " + port);
    })
})
.catch(err=>console.log(err));

//mount middleware
app.use(express.static('public'));//to use css and html and images using static function
app.use(express.urlencoded({extended: true}));//pass data in the middleware
app.use(morgan('tiny'));
app.use(methodOverride('_method'));

//middleware for session and cookies
app.use(session({
    secret: 'qyxjotvcdfbuhgnawzpsiemlrkax', 
    resave: false,
    saveUninitialized: true, 
    cookie:{maxAge: 60*60*1000}, 
    store: new MongoStore({mongoUrl: 'mongodb://127.0.0.1:27017/nbadproject'}),

}));
app.use(flash());
app.use((req,res, next)=>{ 
    res.locals.user = req.session.user||null;
    res.locals.successMessages = req.flash('success'); 
    res.locals.errorMessages = req.flash('error'); 
    res.locals.firstName = req.session.name;
    res.locals.lastName = req.session.lastName;
    next();
});

//setup routes
app.use('/', mainRoute); 
app.use('/about', mainRoute); 
app.use('/login', mainRoute); 
app.use('/signup', mainRoute); 

app.use('/tradeRoutes', tradeRoute); 
app.use('/users', userRoutes);


//404 error handler
app.use((req,res, next) => {
    let err = new Error('The Server Cannot locate' + req.url);
    err.status=404;
    next(err);
});


// 500 error handler
app.use((err, req, res, next)=> {
    console.log(err.stack);
    if (!err.status){
        err.status = 500;
        err.message=("Internal server error");
    }
    res.status(err.status);
    res.render('error', {error:err});
});


