var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var PortfolioSchema = new Schema({
  title: {
    type: String,
    required: true
  },
  author: {
    type: String,
    required: true
  },
  shorttext: {
    type: String
  },
  portfolioimage: {
    type: String
  }
},{timestamps: true});

var Portfolio = module.exports = mongoose.model('Portfolio', PortfolioSchema);

