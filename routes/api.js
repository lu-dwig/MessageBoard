'use strict';
var expect = require('chai').expect;
const { text } = require('body-parser');
const mongodb = require('mongodb');
const mongoose = require('mongoose');

module.exports = function (app) {

  const uri = 'mongodb+srv://Schleswig:' + process.env.PW + '@cluster0.u51m4.mongodb.net/Message-Board?retryWrites=true&w=majority&appName=Cluster0'
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

  app.post('/api/replies/:board', (req, res) => {
    let newReply = new Reply(req.body)
    newReply.createdon_ = new Date().toUTCString()
    newReply.reported = false
    // console.log(newReply)
    Thread.findByIdAndUpdate(
      req.body.thread_id,
      { $push: { replies: newReply }, bumpedon_: new Date().toUTCString() }, 
      { new: true },
      (err , updatedThread) => {
        if (!err && updatedThread){
          res.redirect('/b/' + updatedThread.board + '/' + updatedThread.id + '/' + '?new_reply_id=' + newReply.id)
        }
      }
    )
  })

  app.get('/api/threads/:board/', ( req,res) => {
    Thread.find({board: req.params.board})
      .sort({bumpedon_: 'desc'})
      .limit(10)
      .select('-delete_password -reported') 
      .lean()
      .exec((err, arrayOfThreads) => {
        if (!err && arrayOfThreads){

          arrayOfThreads.forEach((thread) =>{
            
            thread['replycount']= thread.replies.length
            /* Sorting of the replies */
            thread.replies.sort((thread1, thread2) =>{
              return thread2.createdon_ - thread1.createdon_
            })

            /*Limit Replies To 3*/
            thread.replies = thread.replies.slice(0, 3)

            /* Remove Delete Pass from Replies */
            thread.replies.forEach((reply) =>{
              reply.delete_password = undefined
              reply.reported = undefined
            })
          })   
          return res.json(arrayOfThreads)
        }
      })
  });
  // app.get('/api/threads/:board/', async (req, res) => {
  //   try {
  //     const arrayOfThreads = await Thread.find({ board: req.params.board })
  //       .sort({ bumpedon_: 'desc' })
  //       .limit(10)
  //       .select('-delete_password -reported')
  //       .lean();
  
  //     if (arrayOfThreads) {
  //       arrayOfThreads.forEach((thread) => {
  //         // Sort replies by createdon_ (newest first)
  //         thread.replies.sort((a, b) => b.createdon_ - a.createdon_);
  
  //         // Limit replies to 3
  //         thread.replies = thread.replies.slice(0, 3);
  
  //         // Remove sensitive fields from replies
  //         thread.replies.forEach((reply) => {
  //           delete reply.delete_password;
  //           delete reply.reported;
  //         });
  //       });
  //     }
  
  //     return res.json(arrayOfThreads);
  //   } catch (err) {
  //     console.error(err);
  //     return res.status(500).json({ error: 'Internal Server Error' });
  //   }
  // });

  app.get('/api/replies/:board', (req, res) => {
    
    Thread.findById(
      req.query.thread_id,
      (err, thread) => {

        if (!err && thread) {
          thread.delete_password = undefined
          thread.reported = undefined; 
          // thread['replycount']= thread.replies.length
          
          /* Sorting of the replies */
          thread.replies.sort((thread1, thread2) =>{
            return thread2.createdon_ - thread1.createdon_
          })

          /* Remove Delete Pass from Replies */
          thread.replies.forEach((reply) =>{
            reply.delete_password = undefined
            reply.reported = undefined
          }) 
          return res.json(thread)
        }
      }
    )
  })

  app.delete('/api/threads/:board', (req, res) =>{
    
    Thread.findById(
      req.body.thread_id,
      (err, threadToDelete) =>{

        if(!err && threadToDelete){

          if(threadToDelete.delete_password === req.body.delete_password){

            Thread.findByIdAndRemove(
              req.body.thread_id,
              (err, deletedThread) => {
                if (!err && deletedThread){
                  return res.json('success')
                }
              }
            )
          }else{
            return res.json('Incorrect Password')
          }
        }else{
          return res.json('Thread Not Found')
        }
      }
    )
  })

  app.delete('/api/replies/:board', (req, res) =>{

    Thread.findById(
      req.body.thread_id,
      (err, threadToUpdate) =>{

        if(!err && threadToUpdate){

          let i
          for ( i = 0; i < threadToUpdate.replies.length; i++ ) {
            if(threadToUpdate.replies[i].id === req.body.reply_id){  
              if(threadToUpdate.replies[i].delete_password === req.body.delete_password){
                threadToUpdate.replies[i].texts ='[deleted]'
              }else {
                return res.json('Incorrect Password')
              }
            }
          }

          threadToUpdate.save((err, updatedThread) => {
            if (!err && updatedThread){
              return res.json('success')
            }
          })

        }else{
          return res.json('Thread Not Found')
        }
      }
    )
  })

  app.put('/api/threads/:board', (req, res) => {
    
    Thread.findByIdAndUpdate(
      req.body.thread_id,

      { reported: true }, 
      { new: true },
      (err, updatedThread) => {
        
        if (!err && updatedThread){
          return res.json('success')
        }
      }
    )
  })

  app.put('/api/replies/:board', (req, res) => {
    
    Thread.findById(
      req.body.thread_id,
      (err, threadToUpdate) =>{
        if(!err && threadToUpdate){

          let i;
          for ( i = 0; i < threadToUpdate.replies.length; i++ ) {
            if(threadToUpdate.replies[i].id === req.body.reply_id){  
              threadToUpdate.replies[i].reported = true
            } 
          }

          threadToUpdate.save((err, updatedThread) => {
            if (!err && updatedThread){
              return res.json('success')
            }
          })
        }else{
          return res.json('Thread Not Found')
        }
      }
    )
  })

  // app.route('/api/threads/:board');
        // threadToUpdate.replies.forEach((reply, index) => {
        //   if(reply._id.toString() === req.body.reply_id && reply.delete_password === req.body.delete_password){
        //     threadToUpdate.replies.splice(index, 1)
        //     threadToUpdate.save((err, updatedThread) => {
        //       if (!err && updatedThread){
        //         return res.json('success')
        //       }
        //     })
        //   }
        // })
  // app.route('/api/replies/:board');

};
