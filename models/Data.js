var mongoose = require('mongoose');
var userSchema = require('../schema/data');

module.exports = mongoose.model('Data', userSchema);