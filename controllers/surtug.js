//====== MODUL ======//
//load framework express
const express = require('express');
//buat router khusus rdjk
const surtug = express.Router();

const Pegawai = require(__dirname+"/../model/Pegawai.model");
const SuratTugas2 = require('../model/SuratTugas2.model')
const SettingSPPD = require('../model/SettingSPPD.model')
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
const toTitleCase = require('./function/toTitleCase')

surtug.socket = function(io, connections, client, loggedUser){
    surtug.connections = connections;
    surtug.io = io;

    client.on('surtug.getAllSurtug', (q, cb)=>{
        SuratTugas2.find({}, ( err, res_allSurtug )=>{
            cb( res_allSurtug )
        })
    })
    
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

    client.on('surtug.getSetting', (clientData, cb)=>{
        SettingSPPD.findOne({}).populate('ttd_st ttd_leg').exec( (err, res_setting ) => {
            if( !err ) cb( res_setting );
        })
    })
    
    client.on('surtug_buat_surat', (clientData, cb)=>{
        var starting_sppd = clientData.data.starting_sppd.match(/^\d{1,4}/)?+clientData.data.starting_sppd.match(/^\d{1,4}/)[0]:null;
        var suffix = clientData.data.starting_sppd.match(/\d{1,7}(\/SPD\/STIS\/\d{4})/)?clientData.data.starting_sppd.match(/\d{1,7}(\/SPD\/STIS\/\d{4})/)[1]:null
        if(!starting_sppd){
            sendMsg(client, 'Nomor surat tugas tidak valid.');
            cb(false);
            return;
        } else if(!suffix){
            sendMsg(client, 'Format nomor surat tugas salah.');
            cb(false);
            return;
        } else if(!clientData.data.yang_bepergian.length){
            sendMsg(client, 'Yang bepergian belum ditentukan.');
            cb(false);
            return;
        }

        // console.log(clientData);
        //1. buat objek tiap model
        var surtug_instances = [];
        var save_task = []
        var ok = true;
        var setting;
        //simpan
        save_task.push( (get_setting_task_cb) => {
            SettingSPPD.findOne({}, 'ppk').populate('ppk').exec(( err, res_setting ) => {
                setting = res_setting;
                get_setting_task_cb( null, 'setting loaded' )
            })
        })
        _.each(clientData.data.yang_bepergian, (item, i, arr)=>{
            save_task.push( (save_task_cb) => {
                var nsd = {};
                nsd.nomor_sppd = (starting_sppd++) + suffix
                nsd.nama = item.nama
                nsd.nip = item._id
                nsd.gol = item.gol
                nsd.jabatan = item.jabatan

                nsd.ppk = _.clone(setting.ppk);

                nsd.output = clientData.data.output
                nsd.kode_output = clientData.data.kode_output
                nsd.tugas =  clientData.data.tugas
                nsd.prov = clientData.data.prov
                nsd.kab = clientData.data.kab
                nsd.org = clientData.data.org
                if(item.lokasi) nsd.lokasi = item.lokasi
                nsd.posisi_kota = clientData.data.posisi_kota
                nsd.tgl_berangkat = item.tgl_berangkat?moment(item.tgl_berangkat, 'DD/MM/YYYY').format():clientData.data.tgl_berangkat
                nsd.tgl_kembali = item.tgl_kembali?moment(item.tgl_kembali, 'DD/MM/YYYY').format():clientData.data.tgl_kembali
                nsd.jenis_ang = clientData.data.jenis_ang
                if(item.penanda_tgn_st_nama && item.penanda_tgn_st_nip && item.penanda_tgn_st_jabatan ){
                    nsd.penanda_tgn_st = {
                        _id: item.penanda_tgn_st_nip, nama: item.penanda_tgn_st_nama, jabatan: item.penanda_tgn_st_jabatan
                    }
                } else{
                    nsd.penanda_tgn_st = clientData.data.penanda_tgn_st
                }
                nsd.penanda_tgn_legalitas = clientData.data.penanda_tgn_legalitas
                nsd.tgl_ttd_surtug = clientData.data.tgl_ttd_surtug

                SuratTugas2.findOne( {nomor_sppd: nsd.nomor_sppd}, ( err, stgs ) => {
                    if( stgs ){
                        SuratTugas2.update( { _id: stgs._id }, nsd, ( err, updated ) => {
                            surtug_instances.push( new SuratTugas2(nsd) )
                            save_task_cb( null, nsd.nomor_sppd )
                        } )
                    } else{
                        var ns = new SuratTugas2(nsd)
                        ns.save( ( err ) => {
                            if( err ){
                                _.each(err.errors, (item, i, arr)=>{
                                    sendMsg(client, item.message)
                                })

                                ok = false

                                save_task_cb( nsd.nomor_sppd+' error', null )

                                return;
                            } else{
                                surtug_instances.push( ns )
                                save_task_cb( null, nsd.nomor_sppd )
                            }
                        } )
                    }
                } )
            } )
        })

        async.series( save_task, (err, finish) => {
            if( !ok ){
                cb( false )
                return;
            }

            setting.last_nmr_surat = starting_sppd;
            setting.save()

            async.series(
                [(cb_1)=>{
                    generateDocx(
                        {yang_bepergian: surtug_instances}, 
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
        } )
    })

}

//ekspresi
expressions.filters.date = function(input) {
    if(!input) return input;
    return moment(input).format('DD MMMM YYYY');
}

expressions.filters.capitalize = function(input) {
    if(!input) return input;
    return toTitleCase(input);
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

surtug.get('/perhitungan', function(req, res){
    res.render('sppd/perhitungan_react', {layout: false});
})

module.exports = surtug;