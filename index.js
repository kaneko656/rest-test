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

var base64 = require('base-64');
var utf8 = require('utf8');

app.use(bodyParser.json({limit: '200kb'}))
app.use(bodyParser.urlencoded({ extended: true }))
// app.use(bodyParser.urlencoded({ extended: true }))

app.use('', express.static(__dirname + '/../public'))

const data = []

const initData = {
	'user_id': "TaroYamada",
	password: "PaSSwd4TY",
	nickname: "たろー",
	comment: "僕は元気です"
}

data.push(initData)

const signUpFailed = (res, cause) => {
	res.status(400)
	res.send({
		"message": "Account creation failed",
		"cause": cause || "required user_id and password"
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
		signUpFailed(res, "required user_id and password")
		return
	}

	if(req.body.user_id.length < 6 || req.body.user_id.elgnth >= 20) {
		signUpFailed(res, 'user_id must be at least 6 characters and no more than 20 characters')
		return
	}
	if(req.body.password.length < 8 || req.body.password.elgnth >= 20) {
		signUpFailed(res, 'password must be at least 8 characters and no more than 20 characters')
		return
	}

	if(!req.body.user_id.match(/^[A-Za-z0-9]*$/)){
		signUpFailed(res, 'username is half-width alphanumeric characters only')
    return
  }
	if(!req.body.password.match(/^[\x20-\x7e]*$/)){
		signUpFailed(res, 'password is only one-byte alphanumeric symbol')
    return
  }

	if(data.find(e => e.user_id == req.body.user_id)) {
		signUpFailed(res, 'already same user_id is used')
		return
	}
	signUpSuccess(res, req.body)
})

const usersSuccess = (res, user) => {
	res.status(200)
	let userInfo = {
		'user_id': user.user_id,
		'nickname': user.nickname,
	}
	if(user.comment) userInfo.comment = user.comment

	res.send({
		"message": "User details by user_id",
		"user": userInfo
	})
}

app.get('/users/:user_id', (req, res) => {
	let user_id = req.params['user_id']
	debug(req.query)
	const user = data.find(e => e.user_id == user_id)
	if(!user){
		res.status(404)
		res.send({ "message":"No User found" })
		return
	}

	let token = Buffer.from(`${user.user_id}:${user.password}`).toString('base64')
	if(req.headers.authorization !== 'Basic ' + token) {
		res.status(401)
		res.send({ "message":"Authentication Faild" })
		return
	}

	usersSuccess(res, user)
})

app.patch('/users/:user_id', (req, res) => {
	let user_id = req.params['user_id']
	debug(req.body)
	const user = data.find(e => e.user_id == user_id)

	if(!user) {
		res.status(404)
		res.send({ "message":"No User found" })
		return
	}

	let token = Buffer.from(`${user.user_id}:${user.password}`).toString('base64')
	if(req.headers.authorization !== 'Basic ' + token) {
		res.status(401)
		res.send({ "message":"Authentication Faild" })
		return
	}

	if(req.body.nickname >= 30) {
		req.body.nickname = null
	}
	if(req.body.comment >= 100) {
		req.body.comment = null
	}

	if(typeof req.body.nickname != 'string' && typeof req.body.comment != 'string') {
		res.status(400)
		res.send({
		  "message": "User updation failed",
		  "cause": "required nickname or comment"
		})
		return
	}

	if(typeof req.body.user_id == 'string' || typeof req.body.password == 'string') {
		res.status(400)
		res.send({
		  "message": "User updation failed",
		  "cause": "not updatable user_id and password"
		})
		return
	}

	if(req.body.nickname) {
		if(req.body.nickname == '') user.nickname = user.user_id
		else user.nickname = req.body.nickname
	}
	if(req.body.comment) {
		if(req.body.comment == '') delete user.comment
		else user.comment = req.body.comment
	}
	res.status(200)
	res.send({
		"message": "User successfully updated",
		"recipe": [
		  {
		    "nickname":user.nickname,
		    "comment": user.comment
		  }
		]
	})
})


app.post('/close', (req, res) => {
	const userIndex = -1
	data.forEach((user, index) => {
		let token = Buffer.from(`${user.user_id}:${user.password}`).toString('base64')
		if(req.headers.authorization === 'Basic ' + token) {
			userIndex = index
			return
		}
	})
	if(userIndex == -1) {
		res.status(401)
		res.send({ "message":"Authentication Faild" })
		return
	}

	debug('/close', data[userIndex])
	res.status(200)
	res.send({ "message": "Account and user successfully removed" })
	data.splice(userIndex, 1)
	debug(data)
})

server.listen(portHTTP, () => {
	debug('start HTTP server listening')
	debug(localAddress.toHTTP(portHTTP))
})
