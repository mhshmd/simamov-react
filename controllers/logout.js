//====== MODUL ======//
//load framework express
var express = require('express');
//buat router khusus logout
var logout = express.Router();

//load model User
var User = require(__dirname+"/../model/User.model");

var redisClient;

logout.setRedisClient = (client)=>{
	redisClient = client;
}
var getLoggedUser = require('./function/getLoggedUser')

//route GET /logout
logout.get('/', function(req, res){
	User.update({_id: req.cookies.uid}, {$push: {"act": {label: 'Logout'}}}, function(err, status){

	});
	res.clearCookie('uid')
	res.redirect('login');
});

module.exports = logout;