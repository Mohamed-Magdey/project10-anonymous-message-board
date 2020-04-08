/*
*
*
*       Complete the API routing below
*
*
*/

'use strict';

const expect = require('chai').expect;

let threadHandler = require('../controllers/threadHandler'),
    replyHandler  = require('../controllers/replyHandler');


module.exports = function (app) {
  
  app
    .route('/api/threads/:board')
    .get(threadHandler.get)
    .post(threadHandler.post)
    .put(threadHandler.put)
    .delete(threadHandler.delete)
    
  app
    .route('/api/replies/:board')
    .get(replyHandler.get)
    .post(replyHandler.post)
    .put(replyHandler.put)
    .delete(replyHandler.delete);

};
