fs = require('fs');
aTools = require('arfost-ntools')

const Base = require('./base.js')

module.exports.newBase = function(params){
    return new Base(params);
}