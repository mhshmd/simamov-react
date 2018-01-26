//====== MODUL ======//
//load framework express
const express = require('express');
//buat router khusus rdjk
const surtug = express.Router();

const Pegawai = require(__dirname+"/../model/Pegawai.model");
const SuratTugas2 = require('../model/SuratTugas2.model')
const levenshtein = require('fast-levenshtein');
const _ = require('underscore')
var fs = require('fs');
var msopdf = require('node-msoffice-pdf');
//modul docx
const Docxtemplater = require('docxtemplater');
const JSZip = require('jszip');
const expressions= require('angular-expressions');
const async = require('async');
var timeOutUnlink = require('./../src/functions/timeOutUnlink')
const PDFMerge = require('pdf-merge');

const moment = require('moment')

const sendMsg = require('../src/functions/sendMsg')

//Socket.io
surtug.connections;

surtug.io;

var redisClient;

surtug.setRedisClient = (client)=>{
	redisClient = client;
}
var getLoggedUser = require('./function/getLoggedUser')

surtug.socket = function(io, connections, client, loggedUser){
    surtug.connections = connections;
    surtug.io = io;
    
    client.on('surtug_nama', (q, cb)=>{
    if(q){
            q = q.replace(/[-[\]{}()*+?.,\\/^$|#\s]/g, "\\$&");
        }
        Pegawai.find({"nama": new RegExp(q, "i"), active: true}, 'nama gol jabatan', function(err, pegs){
            _.each(pegs, function(item, index, list){
                pegs[index].d = levenshtein.get(q || q, item.nama);
            })
            pegs = _.sortBy(pegs, function(o) { return o.d; })
            cb(pegs);
        })
    })

    client.on('get peg by _id', (_id, cb)=>{
        Pegawai.findOne({"_id": _id}, 'nama gol jabatan', function(err, peg){
            cb(peg);
        })
    })
    
    client.on('surtug_buat_surat', (clientData, cb)=>{
        var starting_sppd = clientData.data.starting_sppd.match(/^\d{1,4}/)?+clientData.data.starting_sppd.match(/^\d{1,4}/)[0]:null
        if(!starting_sppd){
            sendMsg(client, 'Nomor surat tugas tidak valid.');
            cb(false);
        } else if(!clientData.yang_bepergian.length){
            sendMsg(client, 'Yang bepergian belum ditentukan.');
            cb(false);
        }
        //1. buat objek tiap model
        //kondisi: ada yang_bepergian, ada data
        //jika elemen yg bepergian tdk valid, ambil dari data.
        //simpan
        _.each(clientData.yang_bepergian, (item, i, arr)=>{
            // console.log(item, i);
        })
        cb(false)
        return
        //2. simpan (termasuk validasi), notif jika ada yg tidak passed
        //3. buat docx 
        var st = _.clone(clientData.data);
        st.yang_bepergian = []
        _.each(clientData.yang_bepergian, (item, i, arr)=>{
            item.nomor_sppd = (starting_sppd++)+'/SPD/STIS/2018';
            item.tgl_berangkat = moment(item.tgl_berangkat, 'DD/MM/YYYY')
            item.tgl_kembali = moment(item.tgl_kembali, 'DD/MM/YYYY')
            st.yang_bepergian.push(item)
        })
        async.series(
            [(cb_1)=>{
                generateDocx(
                    st, 
                    clientData.toPdf, //apakah pdf
                    __dirname+"/../template/surtug/surat_tugas.docx", //path +nama template docx
                    __dirname+"/../template/output/surtug/"+moment().format('DD-MM-YYYY hh mm ss')+" surat_tugas.docx", //path + nama outp docx
                    __dirname+"/../template/output/surtug/"+moment().format('DD-MM-YYYY-hh-mm-ss')+"-surat_tugas-docx.pdf", //path + nama outp pdf
                    cb_1
                );
            }],
            (err, fileResultPath)=>{
                cb('/surtug/'+fileResultPath[0].match(/\d{2}.*\.\w{3,4}$/)[0])
            }
        );
    })

}

//ekspresi
expressions.filters.date = function(input) {
    if(!input) return input;
    return moment(input).format('DD MMMM YYYY');
}

var angularParser = function(tag) {
    return {
        get: tag === '.' ? function(s){ return s;} : function(s) {
            return expressions.compile(tag.replace(/’/g, "'"))(s);
        }
    };
}

function generateDocx(data, toPDF, docxTemplatePath, outputDocxPath, outputPDFPath, cb){
	//#### docx generator
	var template = fs.readFileSync(docxTemplatePath,"binary");

    var zip = new JSZip(template);
    var doc = new Docxtemplater().loadZip(zip).setOptions({parser:angularParser});
    //set data
    doc.setData(data);
    //render
    doc.render();
    var buf = doc.getZip()
                 .generate({type:"nodebuffer"});
    
	fs.writeFileSync(outputDocxPath,buf);
	if(toPDF){
		msopdf(null, function(error, office) {
			office.word({input: outputDocxPath, output: outputPDFPath}, function(error, pdf) {
				timeOutUnlink(outputDocxPath);
		   	});
	
			office.close(null, function(error) { 
				if(cb){
					cb(null, outputPDFPath)
				} else{
					return outputPDFPath;
				}
				timeOutUnlink(outputPDFPath, 600000)
		   });
		});
	} else{
		if(cb){
			cb(null, outputDocxPath.match(/\d{2}.*\.\w{3,4}$/)[0])
		} else{
			return outputDocxPath;
		}
		timeOutUnlink(outputDocxPath, 600000)
	}
    
}

surtug.get('/', function(req, res){
    res.render('sppd/surat_tugas_react', {layout: false});
})

module.exports = surtug;