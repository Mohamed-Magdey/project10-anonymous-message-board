let Board  = require('../models/board'),
    Thread = require('../models/thread');

let replyHandler = {};

replyHandler.get = function(req, res) {
  let board = req.params.board;
  
  let thread_id = req.query.thread_id;
  
  if(!thread_id) {
    res.send();
  } else {
    Board.findOne({ board })
      .populate({
        path: "threads",
        match: { _id: thread_id }
      })
      .exec((err, foundThread) => {
        if (err || !foundThread) {
          res.json({ failure: "There is no thread" });
        } else {
          let thread = foundThread.threads[0];

          res.json({
            _id: thread._id,
            text: thread.text,
            created_on: thread.created_on,
            bumped_on: thread.bumped_on,
            replies: thread.replies.map(val => ({
              _id: val._id,
              text: val.text,
              created_on: val.created_on
            }))
          });
        }
      });
  }
}

replyHandler.post = function(req, res) {
  let board = req.params.board;
  const {text, delete_password, thread_id} = req.body;
  
  if (!text || !delete_password || !thread_id) {
    return res.json({ failure: "Missing required fields" });
  }
  
  Board.findOne({board}, (err, foundBoard) => {
    if(err || !foundBoard.threads.includes(thread_id)) {
      res.json({ failure: "OPPS!!! There is no such thread here!!!" });
    } else {
      Thread.findById(thread_id, (err, foundThread) => {
        if(err) return console.log(err);

        foundThread.replies.push({text, delete_password});
        foundThread.bumped_on = foundThread.replies[foundThread.replies.length - 1].created_on
        foundThread.save();

        res.redirect(`/b/${board}/${thread_id}`);
      });
    }
  });
};

replyHandler.put = function(req, res) {
  const {thread_id, reply_id} = req.body;
  
  Thread.findById({_id: thread_id}, (err, foundThread) => {
    if(err) return console.log(err);
    
    let foundReply = foundThread.replies.filter(val => val._id.equals(reply_id))[0];
    
    foundReply.reported = true;
    foundThread.save();
    res.send('reported');
  })
}

replyHandler.delete = function(req, res) {
  let board = req.params.board;
  const {thread_id, reply_id, delete_password} = req.body;
  
  Board.findOne({ board })
    .populate({
      path: "threads",
      match: { _id: thread_id }
    })
    .exec((err, foundThread) => {
      if (err || !foundThread) {
        res.json({ failure: "There is no thread" });
      } else {
        let thread = foundThread.threads[0];

        let foundReply = thread.replies.filter(val => val._id.equals(reply_id))[0];

        if (foundReply.delete_password === delete_password) {
          foundReply.text = "[deleted]";
          thread.save();
          res.send("success");
        } else {
          res.send("incorrect password");
        }
      }
    });
}

module.exports = replyHandler;