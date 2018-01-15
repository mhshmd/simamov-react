//====== MODUL ======//
//load framework express
var express = require('express');
//buat router khusus rdjk
var rdjk = express.Router();

//route GET /rdjk
rdjk.get('/', function(req, res){
	res.render('rdjk/rdjk', {layout: false});
});

module.exports = rdjk;