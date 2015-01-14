var express = require('express'),
    crypto = require('crypto'),
    User = require('../models/user.js'),
    Post = require('../models/post.js');

module.exports = function(app) {
    page = 1;
    limit = 5;

    app.get('/', function(req, res) {


        page = req.query.p ? parseInt(req.query.p) : 1;
        var options = {
            skip: (page - 1) * limit,
            limit: limit,
            sort: {
                "time": -1
            }
        };

        Post.getPost('', options, 1, 0, function(err, docs, total) {
            if (err)
                docs = [];
            console.log(total);
            Post.getTags(function(err, tags) {
                if (err) {
                    req.flash('error', "失败！");
                     return  res.redirect('/');;
                }
                Post.getCategories(function(err, categories){
                     if (err) {
                      req.flash('error', "失败！");
                        return  res.redirect('/');;
                     }
                    res.render('index', {
                    title: 'blog',
                    user: req.session.user,
                    posts: docs,
                    page: page,
                    isFirstPage: (page - 1) == 0,
                    isLastPage: ((page - 1) * limit + docs.length) == total,
                    tags: tags,
                    categories: categories,
                     success:req.flash('success').toString(),
                     error: req.flash('error').toString()

                });
                })
                
            });

        });

    });
    app.get('/login', function(req, res) {
        res.render('login', {
            title: '',
            user: req.session.user,
        });
    });
    app.post('/login', function(req, res) {
        var md5 = crypto.createHash('md5'),
            password = md5.update(req.body.password).digest('hex');

        User.get(req.body.name, function(err, user) {
            if (!user) {

                return res.redirect('/login'); //用户不存在则跳转到登录页
            }
            //检查密码是否一致
            if (user.password != password) {

                return res.redirect('/login'); //密码错误则跳转到登录页
            }
            //用户名密码都匹配后，将用户信息存入 session
            req.session.user = user;
            res.redirect('/'); //登陆成功后跳转到主页
        });


    });

    app.get('/logout', function(req, res) {
        req.session.user = null;

        res.redirect('/');
    });


    app.post('/addPost', function(req, res) {

        var post = {};
        post.title = req.body.title;
        post.post = req.body.post;
        post.username = req.session.user.username;
        post.tags = req.body.tags.replace(/\s/g, '').split(',');
        post.categories = req.body.categories;

        Post.addOne(post, function(err, post) {

            if (err) {
                console.log(err);
                req.flash('error', "增加文章失败！");
                return  res.redirect('/');
            }
            if (post)
                console.log(post);
             req.flash('success', '成功!');
            res.redirect('/');
        });
    })

  
    app.get('/deletePost/:username/:day/:title', function(req, res) {

        username = req.params.username;
        day = req.params.day;
        title = req.params.title;

        Post.deleteOne(username, day, title, function(err, flag) {

            if (err) {
               req.flash('error', "删除文章失败！");
                return  res.redirect('/');;
            }
            if (flag){
                req.flash('success', "删除文章成功！");
                res.redirect('/');
            }
        });

    });

    app.get('/editPost', function(req, res) {
        console.log(req.query);
        username = req.query.username;
        day = req.query.day;
        title = req.query.title;

        Post.getPost({
            'username': username,
            'time.day': day,
            'title': title
        }, '', 0, 1, function(err, doc) {
            if (err) {
                req.flash('error', "失败！");
                return;
            }
            if (doc) {

                res.json({
                    posts: doc
                });
            }
        });

    });
    app.post('/editPost', function(req, res) {
        username = req.body.username;
        day = req.body.day;
        title = req.body.oldTitle;
        post = {
            title: req.body.title,
            post: req.body.post,
            tags: req.body.tags.replace(/\s/g, '').split(','),
            categories: req.body.categories
        };
        Post.update(username, day, title, post, function(err, flag) {

            if (err) {
                req.flash('error', "编辑文章失败！");
                return;
            }
            if (flag)
                res.json({
                    "success": 1
                });
        });

    });

//     app.get('/getTags', function(req, res) {
//         Post.getTags(function(err, tags) {
//             if (err) {
//                 console.log(err);
//                 return;
//             }
// console.log(tags);
//             res.render('tags', {
//                 title: 'tags',
//                 user: req.session.user,
//                 tags: tags
//             });
//         });

//     });

    app.get('/tag/:tag', function(req, res) {
        var tag = req.params.tag;
        Post.getTag(tag, function(err, tags) {
            if (err) {
                 req.flash('error', "失败！");
                return;
            }
            console.log(tags);
        });

    });

    app.get('/tags', function(req, res) {
       
        Post.getTagPosts(function(err, docs){
            if(err){
                req.flash('error', "失败！");
                return;
            }
          console.log(docs);
               res.render('tags', {
                    title: 'tags',
                    user: req.session.user,
                    tags: docs
                });
           
            
        });

    });

      app.get('/categories', function(req, res) {
       
        Post.getCategoryPosts(function(err, docs){
            if(err){
                req.flash('error', "失败！");
                return;
            }
          console.log(docs);
               res.render('categories', {
                    title: 'categories',
                    user: req.session.user,
                    categories: docs
                });
           
            
        });

    });

    app.get('/post/:username/:day/:title', function(req, res) {

        username = req.params.username;
        day = req.params.day;
        title = req.params.title;

       Post.getPost({
            'username': username,
            'time.day': day,
            'title': title
        }, '', 1, 1, function(err, doc) {
             if(err){
                req.flash('error', "失败！");
                return;
            }
            console.log(doc);
            res.render('post', {
                    title: 'post',
                    user: req.session.user,
                    post: doc[0]
                });
        });

    });

 app.get('/post/:title', function(req, res) {

      
        title = req.params.title;

       Post.getPost({
            
            'title': title
        }, '', 1, 1, function(err, doc) {
             if(err){
                req.flash('error', "失败！");
                return;
            }
            console.log(doc);
            res.render('post', {
                    title: 'post',
                    user: req.session.user,
                    post: doc[0]
                });
        });

    });

   app.get('/archive', function(req, res) {
       
        Post.getArchive(function(err, docs){
            if(err){
                console.log(err);
                req.flash('error', "失败！");
                return;
            }
          console.log(docs);
               res.render('archive', {
                    title: 'archive',
                    user: req.session.user,
                    tags: docs
                });
           
            
        });

    });

   app.get('/search', function(req, res) {
       var keyword = req.query.keyword;
       console.log(keyword);
       var pattern = new RegExp(keyword, "i"); //忽略大小写
         Post.getPost({'title': pattern}, {}, 1, 0, function(err, posts) {
            if (err) {
                req.flash('error', err);
                return res.redirect('/');
            }
            console.log(posts);
            res.render('search', {
                title: "SEARCH:" + req.query.keyword,
                posts: posts,
                user: req.session.user,
                success: req.flash('success').toString(),
                error: req.flash('error').toString()
            });
        });
        

    });
   app.get('/about', function(req, res){
     res.render('about', {
                title: "about",
               
                user: req.session.user,
                success: req.flash('success').toString(),
                error: req.flash('error').toString()
            });
   })
};