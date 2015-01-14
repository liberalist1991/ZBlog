var crypto = require('crypto'),
settings = require('../settings'),
  mongoose = require('mongoose');
var Schema = mongoose.Schema; 

 var con =  mongoose.createConnection('mongodb://' + settings.host + ":" + settings.port + "/" + settings.db);
User = {};

var userScheme = new Schema({
  username: {
    type: String
  },
  password: {
    type: String
  }

});

con.model('users', userScheme);
var users = con.model('users');

User.get = function get(username, callback) {
  users.findOne({
    name: username
  }, function(err, doc) {
    if (err) {
      return callback(err, null);
    }
    return callback(err, doc);
  });
};


module.exports = User;