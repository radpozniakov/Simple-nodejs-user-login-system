var express = require('express');
var router = express.Router();
var passport = require('passport');

var multer  = require('multer')

var storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, './public/uploads/avatars/')
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + file.originalname);
  }
})

var uploadAvatar = multer({ storage: storage })


// =======================================
var LocalStrategy = require('passport-local').Strategy;

// =======  models
var Users = require('../../models/users.model');
var Portfolio = require('../../models/portfolio.model');

/* GET users listing. */
router.get('/', function(req, res, next) {
  Users.find({}).exec(function(err, data) {
    if(err){
      res.send('Ошибка чтения базы данных');
    }else{
      res.render('users_list', {title: 'Список пользователей', list: data});
    }
  })
});

router.get('/add', function (req, res, next) {
  res.render('registration', {title: 'Регистрация пользователя'});
});

router.post('/add', uploadAvatar.single('profileimage'), function(req, res, next) {

console.log(req.body);
console.log(req.file);

  if(req.file){
    var profileImage = req.file.filename;
  }else{
    var profileImage = 'noimage.png';
  }

  req.checkBody('name', 'Имя обязательно').notEmpty();
  req.checkBody('email', 'Email обязательный').notEmpty();
  req.checkBody('email', 'Email должен быть валидный').isEmail();
  req.checkBody('username', 'Логин обязательный').notEmpty();
  req.checkBody('password', 'Пароль обязательный').notEmpty();
  req.checkBody('password', 'Длина пароля от 5 до 20').len(5,20);
  req.checkBody('password2', 'Пароли должны совпадать').equals(req.body.password);

    var errors = req.validationErrors();
    if(errors){
      res.render('registration', {errors: errors});
    }else{
        var newUser = new Users({
            name: req.body.name,
            email: req.body.email,
            username: req.body.username,
            password: req.body.password,
            profileimage: profileImage
        });

      Users.createUser(newUser, function(err, data){
        if(err){
          res.send('Ошибка добавления пользователя');
        }else{
          res.redirect('/users/');
        }
      });
    }
  });

router.get('/login', function (req, res, next){
  res.render('login', {title: 'Вход в систему'});
})

router.post('/login', passport.authenticate('local', {failureRedirect: '/users/', failureFlash: 'Invalid username or password'}),
  function(req, res) {
    res.redirect('/');
    console.log('ты в системе');
  }
);

passport.serializeUser(function(user, done) {
  done(null, user.id);
});

passport.deserializeUser(function(id, done) {
  Users.getUserById(id, function(err, user) {
    done(err, user);
  });
});

passport.use(new LocalStrategy(function(username, password, done){

  Users.getUserByUsername(username, function(err, user){
    if(err) throw err ;
    if(!user){
      return done(null, false, {message: 'unknown user'});
    }

    Users.comparePassword(password, user.password, function(err, isMatch){
      if(err) return done(err);
      if(isMatch){
        return done(null, user);
        console.log('Ты в системе');
      } else {
        return done(null, false, {message: 'invalid password'});
      }
    });
  });
}));

//Logout
router.get('/logout', function(req, res){
  req.logout();
  res.redirect('/users');
  console.log('вышел с системы');
});




router.get('/:id', function(req, res){
  var username = req.params.id;

  Users.getUserByUsername(username, function(err, data) {
    if(err){
      res.send('Ошибка чтения пользователя');
    }else{
      var UserData = data;
      Portfolio.find({author: UserData.username}, function (err, data) {
        if(err){
          res.send('Ошибка чтения портфолио');
        }else{
          var userPortfolio = data;
          res.render('user_profile', {title: 'Профиль пользователя', userProfile: UserData, portfolio: userPortfolio});
        }
      });
    }
  })
});


router.get('/:id/edit', function (req, res) {
  var currentUser = req.session.passport.user;
  if(!currentUser){
    res.redirect('/');
  }else{
    Users.getUserByUsername(req.params.id, function(err, data) {
      if(err){
        res.redirect('/');
      }else{
        if(currentUser == data._id){
          res.render('user_edit', {userData: data});
        }else{
          res.redirect('/');
        }
      }
    });
  }
});

// router.post('/edit', function(req, res, next) {
//
//   req.checkBody('name', 'Имя обязательно').notEmpty();
//   req.checkBody('email', 'Email обязательный').notEmpty();
//   req.checkBody('email', 'Email должен быть валидный').isEmail();
//   req.checkBody('username', 'Логин обязательный').notEmpty();
//
//   var errors = req.validationErrors();
//   if(errors){
//     res.render('/', {errors: errors});
//   }else{
//
//   }
//
// }










module.exports = router;