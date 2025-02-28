import express from 'express'
import { createServer } from 'http'
const app = express()
const server = createServer(app)


import morgan from 'morgan'
app.use(morgan('tiny'))

// handle cors
import cors from 'cors'
app.use(cors({
    origin: process.env.CLIENT.split(','),
    credentials: true
}))

// parse cookie
import cookie_parser from 'cookie-parser'
app.use(cookie_parser())

// parse body request
import body_parser from 'body-parser'
app.use(body_parser.json())
app.use(body_parser.urlencoded({ extended: true }))


// route app
import handle_404 from './v1/middlewares/handle-404.js'
import handle_error from './v1/middlewares/handle-error.js'
import connect_mongo from './v1/configs/init.mongo.js'
import socket from './v1/configs/init.socket.js'
import redis from './v1/configs/init.redis.js'
import init_cloudinary from './v1/configs/init.cloudinary.js'
import rabitmq from './v1/configs/init.rabbitmq.js'

Promise.all([
    connect_mongo(),
    socket.connect(server),
    redis.connect(),
    init_cloudinary(),
    rabitmq.connect()
])
    .then(async () => {
        const { default: router } = await import('./v1/routers/index.js')
        app.use(router)
        app.use(handle_404)
        app.use(handle_error)
    })

export default server