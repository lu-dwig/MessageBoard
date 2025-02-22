const chaiHttp = require('chai-http');
const chai = require('chai');
const assert = chai.assert;
const server = require('../server');

chai.use(chaiHttp);

suite('Functional Tests', function() {
    this.timeout(10000);

    let testThreadId
    let testReplyId 
    let testThreadPass = 'testpass'

    test(' Create a new Thread', (done) => {
        chai
            .request(server)
            .post('/api/threads/test')
            .send({
                board: 'test',
                text: 'Functional Test Thread',
                delete_password: testThreadPass
            })
            .end((err, res) => {
                assert.equal(res.status, 200);
                let createdThreadId = res.redirects[0].split('/')[res.redirects[0].split('/').length - 1];
                testThreadId = createdThreadId
                done();
            });
    })

    test('Post a reply on an existing thread', (done) => {
        chai
            .request(server)
            .post('/api/replies/test')
            .send({
                thread_id: testThreadId,
                text: 'Test Reply from Functional Test',
                delete_password: testThreadPass
            })
            .end((err, res) => {
                assert.equal(res.status, 200);
                let createdReplyId = res.redirects[0].split('/')[res.redirects[0].split('/').length - 1];
                testReplyId = createdReplyId
                done();
            });
    })
    
    test('Get Threads from a Board', (done) => {
        chai
            .request(server)
            .get('/api/threads/test')
            .send()
            .end((err, res) => {
                assert.isArray(res.body)
                // assert.isAtMost(res.body, 10)
                let firstThread = res.body[0]
                assert.isUndefined(firstThread.delete_password)
                assert.isAtMost(firstThread.replies.length, 3)
                done();
            })
    })

    test('Get Replies on a Thread', (done) => {
        chai
            .request(server)
            .get('/api/replies/test')
            .query({ thread_id: testThreadId })
            .send()
            .end((err, res) => {
                let thread = res.body
                assert.equal(thread._id, testThreadId)
                assert.isUndefined(thread.delete_password)
                assert.isArray(thread.replies)
                done();
            })
    })

    test('Delete a Reply On a Thread', (done) => {
        chai
            .request(server)
            .delete('/api/replies/test')
            .send({
                thread_id: testThreadId, 
                reply_id: testReplyId, 
                delete_password: testThreadPass 
            })
            .end((err, res) => {
                assert.equal(res.body, 'success');
                done();
            })
    })

    test ('Report a Thread', (done) => {
        chai
            .request(server)
            .put('/api/threads/test')
            .send({
                thread_id: testThreadId, 
            })
            .end((err, res) => {
                assert.equal(res.body, 'success');
                done();
            })
    })
    test('Report a reply on a Thread', (done) => {
        chai    
            .request(server)
            .put('/api/replies/test')
            .send({
                thread_id: testThreadId, 
                reply_id: testReplyId, 
            })
            .end((err, res) => {
                assert.equal(res.body, 'success');
                done();
            })
    })

    test('Delete a Thread', (done) => {
        chai    
            .request(server)
            .delete('/api/threads/test')
            .send({ 
                thread_id: testThreadId, 
                delete_password: testThreadPass 
            })
            .end((err, res) => {
                assert.equal(res.body, 'success');
                done();
            })
    })

});
