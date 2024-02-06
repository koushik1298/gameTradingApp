const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const bcrypt = require('bcrypt');
const Trade = require('./trades')

const userSchema = new Schema({
    firstName: {type: String, required: [true, 'first name is mandatory']},
    lastName: {type: String, required: [true, 'last name is mandatory']},
    email: {type: String, required: [true, 'email address is mandatory'], unique: true },
    password: {type: String, required: [true, 'password is mandatory']},
    watchedTrades: [{ type: Schema.Types.ObjectId }],
});

userSchema.pre('save', function(next){
    let user = this; 
    if(!user.isModified('password'))
        return next();
    bcrypt.hash(user.password, 10)
    .then(hash => {
        user.password = hash;
        next();
    })
    .catch(err => next(err));
});

userSchema.methods.comparePassword = function(inputPassword){
    let user = this;
    return bcrypt.compare(inputPassword, user.password);
}

module.exports = mongoose.model('User', userSchema);

