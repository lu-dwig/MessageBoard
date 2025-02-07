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
                const createdThreadId = res.redirects[0].split('/')[res.redirects[0].split('/').length - 1];
                testThreadId = createdThreadId
                done();
            });
    })

});
