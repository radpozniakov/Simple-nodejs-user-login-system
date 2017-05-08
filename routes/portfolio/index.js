var express = require('express');
var router = express.Router();
var multer  = require('multer');

var portfolio = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, './public/uploads/portfolio/')
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + file.originalname);
  }
})
var uploadPortfolioImg = multer({ storage: portfolio })

var Portfolio = require('../../models/portfolio.model');


router.get('/', function(req, res, next) {
  Portfolio.find({}).exec(function(err, data) {
    if(err){
      res.send('Ошибка чтения из базы портфолио');
    }else{
      res.render('./portfolio/portfolio_list', {title: "Полный список работ участников", portfoliolist: data});
    }
  })
});


router.get('/single/:id', function (req, res, next) {
  Portfolio.findById(req.params.id, function (err, data) {
    if(err){
      res.render('error', {message:"Портфолио не найдено", error: err});
    }else{
      var mainPortfolioItem = data;
      console.log(mainPortfolioItem);

      Portfolio.find({author:mainPortfolioItem.author, _id:{$ne:mainPortfolioItem._id}}, function(err, data){
        if(err){
          res.render('error', {message:"Портфолио не найдено", error: err});
        }else{
          res.render('./portfolio/single_portfolio', {mainItem: mainPortfolioItem, otherPortfolio: data});
        }
      });
    }
  });
});






router.get('/add', function(req, res, next) {
  if(req.isAuthenticated()){
    res.render('./portfolio/add_portfolio', {title: "Добавление работы"});
  }else{
    res.redirect('/users/login');
  }
});

/////////////
router.post('/add', uploadPortfolioImg.single('portfolioimage'), function(req, res, next) {

  if(req.file){
    var portfolioImage = req.file.filename;
  }else{
    var portfolioImage = 'noimage.png';
  }

  req.checkBody('title', 'Заголовок обязательно').notEmpty();
  req.checkBody('shorttext', 'Описание обязательно').notEmpty();

  var errors = req.validationErrors();
  if(errors){
    res.render('./portfolio/add_portfolio', {errors: errors});
  }else{
    var newPortfolio = new Portfolio({
      title: req.body.title,
      author: req.body.author,
      shorttext: req.body.shorttext,
      portfolioimage: portfolioImage,
    });


    newPortfolio.save(function(err, data) {
      if(err){
        res.send('Ошибка добавления портфолио в базу');
      }else{
        res.redirect('/portfolio/');
      }
    })


  }
});



module.exports = router;