'use strict';
var expect = require('chai').expect;
const { text } = require('body-parser');
const mongodb = require('mongodb');
const mongoose = require('mongoose');

module.exports = function (app) {

  const uri = 'mongodb+srv://Schleswig:' + process.env.PW + '@cluster0.u51m4.mongodb.net/Message-Board.message-board?retryWrites=true&w=majority&appName=Cluster0'
  mongoose.connect(uri, { useNewUrlParser: true, useUnifiedTopology: true });

  const replySchema = new mongoose.Schema({
    text: {type: String, required: true},
    delete_password: {type: String, required: true},
    createdon_: {type: Date, required: true},
    reported: {type: Boolean, required: true}
  });

  const threadSchema = new mongoose.Schema({
    text : {type: String, required: true},
    delete_password: {type: String, required: true},
    createdon_: {type: Date, required: true},
    bumpedon_: {type: Date, required: true},
    reported: {type: Boolean, required: true},
    replies: [replySchema]
  })
  
  app.route('/api/threads/:board');
    
  app.route('/api/replies/:board');

};
