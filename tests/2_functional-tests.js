const chaiHttp = require('chai-http');
const chai = require('chai');
const assert = chai.assert;
const server = require('../server');

chai.use(chaiHttp);

suite('Functional Tests', function() {
    let testThreadId
    let testReplyId 
    let testPass = 'testpass';

    test (' Create a new Thread', (done) => {
        chai.request(server)
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
        chai.request(server)
           .post('/api/replies/test/')
           .send({
                thread_id: testThreadId,
                text: 'Test Reply from Functional Test',
                delete_password: testPass
            })
           .end((err, res) => {
                assert.equal(res.status, 200);
                let createdReplyId = res.redirects[0].split('/')[res.redirects[0].split('/').length - 1];
                testReplyId = createdReplyId
                done();
            });
    })

});
