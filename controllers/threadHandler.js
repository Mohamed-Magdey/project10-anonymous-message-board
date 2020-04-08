let Board  = require('../models/board'),
    Thread = require('../models/thread');

let threadHandler = {};

threadHandler.get = function(req, res) {
  let board = req.params.board;
  
  Board.findOne({ board })
    .populate({
      path: "threads",
      options: { 
        sort: { bumped_on: -1 },
        limit: 10
      }
    })
    .exec((err, foundThreads) => {
      if (err || !foundThreads) {
        res.json({ failure: "There are no threads" });
      } else {
        res.json(foundThreads.threads.map(thread => ({
          _id: thread._id,
          text: thread.text,
          created_on: thread.created_on,
          bumped_on: thread.bumped_on,
          replies: thread.replies.length > 3 ? thread.replies.slice(-3).map(val => ({
              _id: val._id,
              text: val.text,
              created_on: val.created_on
            })) : thread.replies.map(val => ({
              _id: val._id,
              text: val.text,
              created_on: val.created_on
            })),
          replycount: thread.replies.length 
        })));
      }
    });
};

function createThread(modelB, board, data,varCallback,res) {
  modelB.create(data, (err, thread) => {
    if (err) return console.log(err);

    varCallback.threads.push(thread);
    varCallback.save((err, thread) => {
      if (err) return console.log(err);
    });
    
    res.redirect('/b/' + board + '/');
  });
}

threadHandler.post = function(req, res) {
  let board = req.params.board;
  const {text, delete_password} = req.body;

  if (!text || !delete_password) {
    return res.json({ failure: "Missing required fields" });
  }

  let data = {text, delete_password};

  Board.findOne({ board }, (err, foundBoard) => {
    if (err) return console.log(err);
    // check if there is a board if not create one then create thread
    if (foundBoard) {
      createThread(Thread, board, data, foundBoard, res);
    } else {
      Board.create({ board }, (err, newBoard) => {
        if (err) return console.log(err);

        createThread(Thread, board, data, newBoard, res);
      });
    }
  });
};


threadHandler.put = function(req, res) {
  const {thread_id} = req.body;
  
  Thread.findByIdAndUpdate({_id: thread_id}, {reported: true}, (err, updatedThread) => {
    if(err) return console.log(err);
    
    res.send('reported');
  });
};
threadHandler.delete = function(req, res) {

  let board = req.params.board;  
const {thread_id, delete_password} = req.body;
  
  Thread.findById({_id: thread_id}, (err, foundThread) => {
    if(err) return console.log(err);
    
    if (foundThread.delete_password === delete_password) {
      foundThread.deleteOne({thread_id}, (err, deletedThread) => {
        if(err) return console.log(err);

        Board.findOneAndUpdate(
          { board },
          { $pull: { threads: thread_id } },
          { new: true },
          (err, updatedBoard) => {
            if (err) return console.log(err);

            res.send("success");
          }
        );
      })
    } else {
      res.send('incorrect password');
    }
  })}


module.exports = threadHandler;
 