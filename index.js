require('dotenv').config()
const express = require('express')
const http = require('http')
const https = require('https')
const bodyParser = require('body-parser')
const debug = require('debug')('server')

const localAddress = require('./utils/address.js')

const app = express()
const server = http.createServer({}, app)
const portHTTP = process.env.PORT_HTTP

app.use(bodyParser.json({limit: '200kb'}))
app.use(bodyParser.urlencoded({ extended: true }))
// app.use(bodyParser.urlencoded({ extended: true }))

app.use('', express.static(__dirname + '/../public'))

const data = []

const signUpFailed = (res) => {
	res.status(400)
	res.send({
		"message": "Account creation failed",
		"cause": "required user_id and password"
	})
}

const signUpSuccess = (res, body) => {
	res.status(200)

	data.push({
		user_id: body.user_id,
		nickname: body.user_id,
		passwprd: body.password
	})

	res.send({
		"message": "Account successfully created",
		"user": {
		  "user_id": body.user_id,
		  "nickname": body.user_id
		}
	})
	debug(data)
}

app.post('/signup', (req, res) => {
	debug('/signup', req.body)
	if(!req.body) {
		signUpFailed(res)
		return
	}
	if(typeof req.body.user_id != 'string' || typeof req.body.password != 'string') {
		signUpFailed(res)
		return
	}
	signUpSuccess(res, req.body)
})

app.get('/api/relay', (req, res) => {
	debug(req.body)
	res.status(400)
	res.send({ ok: true })
})

app.post('/api/product/delete', (req, res) => {
	// if (Model.API.product.Delete.validate(req.body, (error) => {
	// 	res.status(400)
	// 	res.send({ ok: false, error: error })
	// })) {
	// 	productAPI.delete(res, req.body)
	// }
})

server.listen(portHTTP, () => {
	debug('start HTTP server listening')
	debug(localAddress.toHTTP(portHTTP))
})
