import mongoose from 'mongoose';
const Schema = mongoose.Schema;
import passportLocalMongoose from 'passport-local-mongoose';


let User = new Schema({
    email: String,
    password: String,
    firstname:String,
    lastname:String,
});
User.plugin(passportLocalMongoose);
module.exports = mongoose.model('User', User);
