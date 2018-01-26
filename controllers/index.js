//====== MODUL ======//
//load framework express
var express = require('express');

//buat router khusus index/home
var index = express.Router();

var redisClient;

index.setRedisClient = (client)=>{
	redisClient = client;
}
var getLoggedUser = require('./function/getLoggedUser')

var Setting = require(__dirname+"/../model/Setting.model");

index.get('/', function(req, res){
	getLoggedUser( redisClient, req.cookies.uid, ( loggedUser ) => {
		console.log(loggedUser);
		res.render('blank', {display_name: loggedUser.username, admin: loggedUser.jenis, tahun_anggaran: loggedUser.tahun_anggaran});
	} )
});

index.get('/home', function(req, res){
	getLoggedUser( redisClient, req.cookies.uid, ( loggedUser ) => {
		res.render('beranda', {layout: false, username: loggedUser.username, tahun_anggaran: loggedUser.tahun_anggaran});
	} )
});

module.exports = index;