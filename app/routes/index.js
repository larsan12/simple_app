const router = require('express-promise-router')()
const { client } = require('../db')
const jwt = require('jsonwebtoken')
const path = require("path")

module.exports = app => {

    let sendBodyError = (res) => res.status(400).send({
        message: "missed fields in the body"
    })

    router.get('/', function(req, res, next) {
        res.sendFile(path.join(__dirname+'/../views/index.html'));
    })


    /**
        Account service
    **/

    router.post('/login', async (req, res) => {
        if (!req.body || !req.body.username || !req.body.password) {
            sendBodyError(res)
            return
        }
        let user = await client.query(`SELECT * FROM users WHERE username=$1 and password=$2;`, [req.body.username, req.body.password])
        if (user.rows.length > 0) {
            let token = jwt.sign({ name: req.body.name, password: req.body.password }, "some secret key", { expiresIn: 1800 })
            res.status(200).send({token: token})
        } else {
            res.status(400).send({message: "wrong name or password"})
        }

    })

    router.post('/logout', async (req, res) => {
        let authHeader = req.headers['authorization'] || ''
        let authorization = authHeader.split(' ')
        let token = authorization[1]
        app.tokensBlackList.push(token)
        res.status(200).send({})
    })


    /**
        Phone service
    **/

    router.get('/phones', async (req, res) => {
        let phones = await client.query(`SELECT * FROM phones;`)
        res.status(200).send(phones.rows)
    })

    router.post('/phones', async (req, res) => {
        if (!req.body || !req.body.phone) {
            sendBodyError(res)
            return
        }
        try {
            await client.query(`INSERT INTO phones VALUES ($1);`, [req.body.phone])
        } catch (err) {
            if (err.code === "23505") {
                res.status(400).send({message: "phone already exist"})
                return;
            }
            throw err
        }
        res.status(200).send({})
    })

    router.delete('/phones', async (req, res) => {
        if (!req.body || !req.body.phone) {
            sendBodyError(res)
            return;
        }
        await client.query(`DELETE FROM phones WHERE phone=$1;`, [req.body.phone])
        res.status(200).send({})
    })

    app.use('/', router)

}
