var crypto = require('crypto'),
  settings = require('../settings'),
  mongoose = require('mongoose'),
  markdown = require('markdown').markdown;

var Schema = mongoose.Schema;

var con2 = mongoose.createConnection('mongodb://' + settings.host + ":" + settings.port + "/" + settings.db);


Post = {};

var postScheme = new Schema({

  username: {
    type: String
  },
  title: {
    type: String,
    unique: true
  },
  post: {
    type: String
  },
  time: Object,
  tags: Array,
  categories: String

});

con2.model('posts', postScheme);
var posts = con2.model('posts');

Post.getPost = function get(condition, options, markd, more, callback) {

  posts.find(
    condition, null, options, function(err, docs) {
      if (err) {
        return callback(err, null, total);
      }

      if (markd) {
        docs.forEach(function(doc) {
          if (more)
            doc.post = markdown.toHTML(doc.post);
          else
            doc.post = markdown.toHTML(doc.post.split('<!-- more-->')[0]);

        });
      }

      posts.count(condition, function(e, total) {

        return callback(err, docs, total);
      });

    });
};

Post.addOne = function(post, callback) {
  var date = new Date();
  //存储各种时间格式，方便以后扩展
  var time = {
    date: date,
    year: date.getFullYear(),
    month: date.getFullYear() + "-" + (date.getMonth() + 1),
    day: date.getFullYear() + "-" + (date.getMonth() + 1) + "-" + date.getDate(),
    minute: date.getFullYear() + "-" + (date.getMonth() + 1) + "-" + date.getDate() + " " +
      date.getHours() + ":" + (date.getMinutes() < 10 ? '0' + date.getMinutes() : date.getMinutes())
  }
  post.time = time;
  console.log(post);
  posts.create(post, function(err, post) {
    if (err) {
      return callback(err, null);
    }
    if (post) {
      return callback(err, post);
    }
  });
};

Post.deleteOne = function(username, day, title, callback) {
  posts.remove({
    'username': username,
    'time.day': day,
    'title': title
  }, function(err, flag) {
    console.log('falg: ' + flag);
    if (err) {
      return callback(err, null);
    }
    callback(err, flag);
  });
}

Post.update = function(username, day, title, post, callback) {
  posts.update({
    'username': username,
    'time.day': day,
    'title': title
  }, {
    $set: {
      title: post.title,
      post: post.post,
       tags: post.tags,
       categories: post.categories
    }
  }, function(err, flag) {
    console.log('falg: ' + flag);
    if (err) {
      console.log('err: ' + err);
      return callback(err, null);
    }
    callback(err, flag);
  });
}

Post.getTags = function(callback) {
  posts.distinct('tags', {}, function(err, docs) {

    if (err)
      return callback(err, null);
    callback(err, docs);
  });
}

Post.getTag = function(tag, callback) {
  posts.find({
    tags: tag
  }, null, null, function(err, docs) {
    if (err) {
      return callback(err, null);
    }
    callback(err, docs);
  });
}

Post.getTagPosts = function(callback) {
  posts.aggregate([{
    $unwind: '$tags'
  }, {
    $group: {
      _id: '$tags',
      title: {
        $push: '$title'

      }

    }
  }], function(err, doc) {
    callback(err, doc);
  });
}

Post.getCategories = function(callback) {
  posts.distinct('categories', {}, function(err, docs) {

    if (err)
      return callback(err, null);
    callback(err, docs);
  });
}

Post.getCategoryPosts = function(callback) {
  posts.aggregate([{
    $group: {
      _id: '$categories',
      title: {
        $push: '$title'

      }

    }
  }], function(err, doc) {
    callback(err, doc);
  });
}

Post.getArchive= function(callback) {
  posts.aggregate([{
    $group: {
      _id: '$time.month',
      title: { $push:'$title' },
      day: {$push: '$time.day'}
    }
  },
  {$sort: {_id: -1}}
  ], function(err, doc) {
    callback(err, doc);
  });
}


module.exports = Post;