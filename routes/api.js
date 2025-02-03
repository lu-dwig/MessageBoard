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
  })

  const threadSchema = new mongoose.Schema({
    text : {type: String, required: true},
    delete_password: {type: String, required: true},
    board: {type: String, required: true},
    createdon_: {type: Date, required: true},
    bumpedon_: {type: Date, required: true},
    reported: {type: Boolean, required: true},
    replies: [replySchema]
  })

  const Reply = mongoose.model('Reply', replySchema);
  const Thread = mongoose.model('Thread', threadSchema);

  app.post('/api/threads/:board', (req, res) => {
    console.log(req.body)
    const newThread = new Thread(req.body)
    if(!newThread.board || newThread.board === '') {
      newThread.board = req.params.board
    }
    newThread.createdon_ = new Date().toUTCString()
    newThread.bumpedon_ = new Date().toUTCString()
    newThread.reported = false
    newThread.replies = []
    newThread.save((err, savedThread) => {
      if (!err && savedThread){
        return res.redirect('/b/' + savedThread.board + '/' + savedThread._id )
      }
    })
})

  
  app.route('/api/threads/:board');
    
  app.route('/api/replies/:board');

};
