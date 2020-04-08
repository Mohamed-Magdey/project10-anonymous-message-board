/*
*
*
*       FILL IN EACH FUNCTIONAL TEST BELOW COMPLETELY
*       -----[Keep the tests in the same order!]-----
*       (if additional are added, keep them at the very end!)
*/

var chaiHttp = require('chai-http');
var chai = require('chai');
var assert = chai.assert;
var server = require('../server');

chai.use(chaiHttp);

suite('Functional Tests', function() {
  let testId; //_id of thread 1 created
  let testId1; //_id of thread 2 exist in DB
  let testId2; //_id of reply 1
  
  suite('API ROUTING FOR /api/threads/:board', function() {
    
    suite('POST', function() {
      
      test('create new thread', function(done) {
        chai.request(server)
        .post('/api/threads/test')
        .send({text: 'hello', delete_password:'pass'})
        .end(function(err, res){
          assert.equal(res.status, 200);
          done();
        });
      });
      
    });
    
    suite('GET', function() {
      
      test('the most recent 10 threads with th most recent 3 replies each', function(done) {
        chai.request(server)
        .get('/api/threads/test')
        .end(function(err, res){
          assert.equal(res.status, 200);
          assert.isArray(res.body);
          assert.isBelow(res.body.length, 11);
          assert.property(res.body[0], '_id');
          assert.property(res.body[0], 'created_on');
          assert.property(res.body[0], 'bumped_on');
          assert.property(res.body[0], 'text');
          assert.property(res.body[0], 'replies');
          assert.isArray(res.body[0].replies);
          assert.isBelow(res.body[0].replies.length, 4);
          testId = res.body[0]._id;
          testId1 = res.body[1]._id;
          done();
        });
      });
      
    });
    
    suite('DELETE', function() {
      
      test('delete thread with correct password', function(done) {
        chai.request(server)
          .delete('/api/threads/test')
          .send({thread_id: testId, delete_password:'pass'})
          .end(function(err, res){
            assert.equal(res.status, 200);
            assert.equal(res.text, 'success');
            done();
          });  
       });
      
      test('delete thread with wrong password', function(done) {
        chai.request(server)
          .delete('/api/threads/test')
          .send({thread_id: testId1, delete_password: 'wrong'})
          .end(function(err, res){
            assert.equal(res.status, 200);
            assert.equal(res.text, 'incorrect password');
            done();
          });
       });
      
    });
    
    suite('PUT', function() {
      
      test('report thread', function(done) {
        chai.request(server)
          .put('/api/threads/test')
          .send({thread_id: testId1})
          .end(function(err, res){
            assert.equal(res.status, 200);
            assert.equal(res.text, 'reported');
            done();
          });
       });
      
    });
    

  });
  
  suite('API ROUTING FOR /api/replies/:board', function() {
    
    suite('POST', function() {
      
      test('reply to thread', function(done) {
        chai.request(server)
          .post('/api/replies/test')
          .send({thread_id: testId1, text:'this is a reply', delete_password:'pass'})
          .end(function(err, res){
            assert.equal(res.status, 200);
            done();
          });
      });
      
    });
    
    suite('GET', function() {
      
      test('entire thread with all replies of it', function(done) {
        chai.request(server)
          .get('/api/replies/test')
          .query({thread_id: testId1})
          .end(function(err, res){
            assert.equal(res.status, 200);
            assert.property(res.body, '_id');
            assert.property(res.body, 'created_on');
            assert.property(res.body, 'bumped_on');
            assert.property(res.body, 'text');
            assert.property(res.body, 'replies');
            assert.isArray(res.body.replies);
            testId2 = res.body.replies[0]._id;
            done();
          });
       });
      
    });
    
    suite('PUT', function() {
      
      test('report reply', function(done) {
        chai.request(server)
          .put('/api/replies/test')
          .send({thread_id: testId1 ,reply_id:testId2})
          .end(function(err, res){
            assert.equal(res.status, 200);
            assert.equal(res.text, 'reported');
            done();
          });
       });
      
    });
    
    suite('DELETE', function() {
      
        test('delete reply with correct password', function(done) {
          chai.request(server)
            .delete('/api/replies/test')
            .send({thread_id: testId1 ,reply_id: testId2, delete_password: 'pass'})
            .end(function(err, res){
              assert.equal(res.status, 200);
              assert.equal(res.text, 'success');
              done();
            });
         });
      
        test('delete reply with wrong password', function(done) {
          chai.request(server)
            .delete('/api/replies/test')
            .send({thread_id: testId1 ,reply_id: testId2, delete_password: 'wrong'})
            .end(function(err, res){
              assert.equal(res.status, 200);
              assert.equal(res.text, 'incorrect password');
              done();
          });
        });
      
      
    });
    
  });
});