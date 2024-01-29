const mongoose = require('mongoose');


const materialSchema = new mongoose.Schema({
    name: {type:String, trim:true, require:true},
    count: {type:Number, trim:true, require:true, min:0}
});


const userSchema = new mongoose.Schema({
        username: {type: String, require: true, unique: true, trim: true, minlength: 3, maxLength:15},
        password: {type: String, require: true, minlength: 4, maxLength:255},
        nameSurname: {type: String, require: true, trim: true, minlength: 3, maxLength:30},
        stock:[materialSchema]
    },
    {timestamps: true}
);

const User = mongoose.model('User', userSchema);

module.exports = User;