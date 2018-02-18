const request = require('supertest');
const should = require('should');
const app = require('../app')
const { initDb, client } = require('../db')


describe('oauth2 grant_type=password', function() {

    const client_id = "key1",
        client_secret = "key2",
        username = "admin",
        password = "admin";

    let access_token; //access oauth tokens

    before(done => initDb().then(() => {
        app.set('port', process.env.PORT || 3000)
        app.listen(app.get('port'), '0.0.0.0', () => done())
    }))

    it("get oauth token", done => {
        request(app)
            .post('/oauth/token')
            .type('form')
            .send({
                client_id: client_id,
                client_secret: client_secret,
                username: username,
                password: password,
                grant_type: "password"
            })
            .expect(200)
            .end((err, res) => {
                should.exist(res.body)
                should.exist(res.body.access_token)
                should.exist(res.body.token_type)
                should.exist(res.body.expires_in)
                should.exist(res.body.refresh_token)
                res.body.token_type.should.equal("Bearer")
                access_token = res.body.access_token
                done()
            })
    })

    it("check phone throught oauth2 tokens", done => {
        request(app)
            .post('/check_phone')
            .set('Authorization', 'Bearer ' + access_token)
            .send({
                phone: '+7 931 123 12 12'
            })
            .expect(200)
            .end((err, res) => {
                should.exist(res.body)
                should.exist(res.body.exist)
                res.body.exist.should.equal(true)
                done()
            })
    })

    it("check phone without oauth2 tokens", done => {
        request(app)
            .post('/check_phone')
            .send({
                phone: '+7 931 123 12 12'
            })
            .expect(401)
            .end(done)
    })

    it("request to another endpoint with oauth2 tokens", done => {
        request(app)
            .get('/phones')
            .set('Authorization', 'Bearer ' + access_token)
            .expect(401)
            .end((err, res) => {
                should.exist(res.body)
                should.exist(res.body.message)
                res.body.message.should.equal("Failed to authenticate token.")
                done()
            })
    })
})
