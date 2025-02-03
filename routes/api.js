'use strict';
var expect = require('chai').expect;
const { text } = require('body-parser');
let mongodb = require('mongodb');
let mongoose = require('mongoose');

module.exports = function (app) {

  let uri = 'mongodb+srv://Schleswig:' + process.env.PW + '@cluster0.u51m4.mongodb.net/Message-Board.message-board?retryWrites=true&w=majority&appName=Cluster0'
  mongoose.connect(uri, { useNewUrlParser: true, useUnifiedTopology: true });

let replySchema = new mongoose.Schema({
  text: {type: String, required: true},
  delete_password: {type: String, required: true},
  createdon_: {type: Date, required: true},
  reported: {type: Boolean, required: true}
})
  
  app.route('/api/threads/:board');
    
  app.route('/api/replies/:board');

};
