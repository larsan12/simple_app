const express = require('express')
const path = require('path')
const logger = require('morgan')
const cookieParser = require('cookie-parser')
const bodyParser = require('body-parser')
const applyRouters = require('./routes')
const applyOauth2Routers = require('./routes/oauth2')

const jwt = require('jsonwebtoken')
const app = express()

// view engine setup
app.set('views', path.join(__dirname, 'views'))
app.set('view engine', 'hjs')

app.use(logger('dev'))
app.use(bodyParser.json())
app.use(bodyParser.urlencoded({ extended: false }))
app.use(cookieParser())
app.use(express.static(path.join(__dirname, 'public')))



//Middlewares

//black list for logout endpoint
app.tokensBlackList = []

app.use((req, res, next) => {
    if (["/login", "/oauth/token", "/oauth/authorize", "/check_phone"].indexOf(req.originalUrl) > -1) {
        next()
    } else {
        let authHeader = req.headers['authorization'] || ''
        let authorization = authHeader.split(' ')
        if (authorization.length > 1 && authorization[0] === 'Bearer' && authorization[1]) {
            let token = authorization[1]
            jwt.verify(token, "some secret key", (err, user) => {
                if (!err && app.tokensBlackList.indexOf(token) === -1) {
                    req.app.locals.user = jwt.decode(token)
                    next()
                } else {
                    res.status(401).send({message: 'Failed to authenticate token.'})
                }
            })
        } else {
            res.status(401).send({message: 'No token provided.'})
        }
    }
})


//routers

applyRouters(app)
applyOauth2Routers(app)


// catch 404 and forward to error handler
app.use((req, res, next) => {
    let err = new Error('Not Found')
    err.status = 404
    next(err)
})

if (app.get('env') === 'development') {
    app.use((err, req, res, next) => {
        res.status(err.status || 500)
        res.render('error', {
            message: err.message,
            error: err
        })
    })
} else {
    app.use((err, req, res, next) => {
        res.status(err.status || 500);
        res.render('error', {
            message: err.message,
            error: {}
        })
    })
}


module.exports = app
