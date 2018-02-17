const { client } = require('../db')
const router = require('express-promise-router')()
const oauthServer = require('express-oauth-server')
const oauthModel = require('../db/oauth2Client')


module.exports = app => {
    app.oauth = new oauthServer({
        model: oauthModel,
        debug: true
    })

    // Post token.
    router.post('/oauth/token', app.oauth.token())

    /* TODO for grant_type=authorization_code
    app.post('/oauth/authorize', function(req, res) {
        // Redirect anonymous users to login page.
        if (!req.app.locals.user) {
            res.status(400).send({error: "no tokens"})
        }

        return app.oauth.authorize()(req,res)
    })
    */

    // Check phone through oauth2
    router.post('/check_phone', app.oauth.authenticate(), async (req, res) => {
        if (!req.body || !req.body.phone) {
            sendBodyError(res)
            return;
        }

        let phone = await client.query(`SELECT * FROM phones WHERE phone=$1;`, [req.body.phone])
        if (phone.rows.length > 0) {
            res.status(200).send({exist: true})
        } else {
            res.status(400).send({exist: false})
        }
    })

    app.use('/', router)

}
