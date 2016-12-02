var mongoose = require('mongoose');
var user = require('../models/User');
var data = require('../models/Data');

var data = new mongoose.Schema({
    user_id: {
        type: mongoose.Schema.ObjectId,
        ref: 'user',
        default: null
    },
    pid: {
        type: mongoose.Schema.ObjectId,
        ref: 'data',
        default: null
    },
    //文件夹或文件的名称
    name: String,
    type: {
        type: String,
        default: 'folder'
    },
    createDate: {
        type: Date,
        default: Date.now()
    },
    isRemove: {
        type: Boolean,
        default: false
    },
    isRemoveElem:{
        type: Boolean,
        default: false
    },
    originalname: {
        type: String,
        default: ''
    },
    encoding: {
        type: String,
        default: ''
    },
    mimetype: {
        type: String,
        default: ''
    },
    path: {
        type: String,
        default: ''
    },
    size: {
        type: Number,
        default: 0
    },
    suffix: {
        type: String,
        default: ''
    }
});



module.exports = data;