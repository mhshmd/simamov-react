//====== MODUL ======//
//load framework express
const express = require('express');
const app = express();
const redis = require('redis')

let redisClient = redis.createClient();

redisClient.on('connect', ()=>{
	console.log('Redis connected.');
})

var server = require('http').createServer(app);  
var io = require('socket.io')(server);

require('dotenv').config();

//clients connection
var connections = {};

//Security
var helmet = require('helmet');
app.use(helmet());


//modul morgan utk debug log ke console
var logger = require('morgan');
app.use(logger('dev'));

//modul cookie parser utk mengatur cookie
var cookieParser = require('cookie-parser');
var credentials = require('./credentials.js'); //string acak utk encrypt
app.use(cookieParser(credentials.cookieSecret));

//modul body parser utk mengatur POST request
var bodyParser = require('body-parser');
app.use(bodyParser.urlencoded({extended: true}));

//Kompresi gzip
var compression = require('compression');
app.use(compression());

//modul mongodb utk koneksi mongo db keuangan
var mongo = require('mongodb');

var url = 'mongodb://127.0.0.1:27017/simamov';

var mongoose = require('mongoose');

mongoose.connect(url);
var Program = require(__dirname+"/model/Program.model");

//modul session utk tracking visitor
var session = require('express-session')({
	resave: false,
	saveUninitialized: true,
	secret: credentials.cookieSecret
});
var sharedsession = require("express-socket.io-session");
app.use(session); //share session

io.use(sharedsession(session, cookieParser(credentials.cookieSecret)));

//modul handlebars utk dynamic page render
var handlebars = require('express-handlebars').create({defaultLayout: 'main',
	helpers:{
		if_eq: function(a, b, opts) {
		    if (a == b) {
		        return opts.fn(this);
		    } else {
		        return opts.inverse(this);
		    }
		},
		if_neq: function(a, opts) {
		    if ( !(a == 'tanpa sub komponen' || a == 'tanpa sub output') ) {
		        return opts.fn(this);
		    } else {
		        return opts.inverse(this);
		    }
		},
		json : function(context) {
		    return JSON.stringify(context);
		},
		"inc" : function(value, options){
		    return parseInt(value) + 1;
		},
		"fullYear" : function(){
			return (new Date()).getFullYear();
		}
	}
});
app.engine('handlebars', handlebars.engine);
app.set('view engine', 'handlebars');

//====== DIRECTORY PUBLIC ACCESS ======//
//dir yg bisa diakses langsung
app.use('/css', express.static(__dirname + '/css'));
app.use('/js', express.static(__dirname + '/js'));
app.use('/fonts', express.static(__dirname + '/fonts'));
app.use('/img', express.static(__dirname + '/img'));
app.use('/result', express.static(__dirname + '/template/output'));
app.use('/result_temp', express.static(__dirname + '/temp_file'));
app.use('/template', express.static(__dirname + '/template'));
app.use('/download', express.static(__dirname + '/template/output/riwayat'));

//====== ROUTES ======//
var login = require('./controllers/login.js'); //route index
login.setRedisClient(redisClient);
app.use('/login', login); //root menggunakan dialihkan ke index.js


//Short syntax tool
var _ = require("underscore");

//cek login, urutan harus di bawah route login
var login_check = function (req, res, next) {
	if(!req.cookies.uid){
		Program.findOne().sort({'thang': 1}).exec(function(error, programs) {
			var thang = [];
			if(!programs){
				thang = [{thang: new Date().getFullYear()}];
			} else {
				for (var i = (programs.thang); i < new Date().getFullYear()+1; i++) {
					thang.push({thang: i});
				}
			}
			res.set('login', '0')
			res.render('login', {layout: false, 'thang': thang, 'this_year': new Date().getFullYear()});
		})
		return;
	}
  	next()
}

app.use(login_check)

//Home
var index = require('./controllers/index.js'); //route index
index.setRedisClient(redisClient);
app.use('/', index); //root menggunakan dialihkan ke index.js

//SPPD
var sppd = require('./controllers/sppd.js');
sppd.setRedisClient(redisClient);
app.use('/sppd', sppd); 
//SPJ
var spj = require('./controllers/spj.js');
spj.setRedisClient(redisClient);
app.use('/spj', spj);
//PEGAWAI
var pegawai = require('./controllers/pegawai.js');
pegawai.setRedisClient(redisClient);
app.use('/pegawai', pegawai);
//POK
var pok = require('./controllers/pok.js');
pok.setRedisClient(redisClient);
app.use('/pok', pok);
//SURTUG REACT
var surtug = require('./controllers/surtug.js');
surtug.setRedisClient(redisClient);
app.use('/surtug', surtug);
//RDJK
var rdjk = require('./controllers/rdjk.js');
rdjk.setRedisClient(redisClient);
app.use('/rdjk', rdjk);
//ADMIN
var admin = require('./controllers/admin.js');
admin.setRedisClient(redisClient);
app.use('/admin', admin);
//LOGOUT
var logout = require('./controllers/logout.js');
logout.setRedisClient(redisClient);
app.use('/logout', logout);
//BANTUAN
var bantuan = require('./controllers/bantuan.js');
bantuan.setRedisClient(redisClient);
app.use('/bantuan', bantuan);

//route jika halaman tidak ditemukan
app.use(function(req, res){
	res.type('text/html');
	res.status(404);
	res.render('404', {layout: false});
});
//route jika terjadi error di server/bug code
app.use(function(err, req, res, next){
	console.error(err.stack);
	res.status(500);
	res.render('500', {layout: false});
});

server.listen(process.env.PORT || 80, function(){
	console.log('Server listening on '+(process.env.PORT || 80));
});

var getLoggedUser = require('./controllers/function/getLoggedUser')

io.on('connection', function(client) {

	if(!client.handshake.cookies.uid){

		client.emit('login_required', 'Anda harus login.');
		return;

	} else {

		getLoggedUser(redisClient, client.handshake.cookies.uid, ( loggedUser ) => {

			if( !loggedUser ){
				client.emit('login_required', 'Anda harus login.');
				return;
			}
			
			index.socket(io, connections, client, loggedUser);
			pok.socket(io, connections, client, loggedUser);
			sppd.socket(io, connections, client, loggedUser);
			surtug.socket(io, connections, client, loggedUser);
			spj.socket(io, connections, client, loggedUser);
			pegawai.socket(io, connections, client, loggedUser);
			admin.socket(io, connections, client, loggedUser);
			login.socket(io, connections, client, loggedUser);

		} )

	}

	client.on('join', function(data) {
    	client.emit('messages', 'Terhubung ke server.');
    });
})