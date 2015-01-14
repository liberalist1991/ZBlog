var settings = require('../settings'),
  mongoose = require('mongoose');

module.exports = function() {
     mongoose.connect('mongodb://' + settings.host + ":" + settings.port + "/" + settings.db);
     console.log(mongoose);
     return mongoose;
}