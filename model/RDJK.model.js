var mongoose = require('mongoose');

var Schema = mongoose.Schema;

const moment = require('moment')
const _ = require('underscore')

var RDJKSchema = new Schema({
    anggota: {
        type: [],
        validate: {
          validator: function(anggota) {
            var valid = true;
            _.each(anggota, (item, i, arr)=>{
                if(!item.nama || !item.gol || !item.jlh_hari || !item.upah_perhari){
                    valid = false;
                    return false;
                }
            });
            return valid;
          },
          message: 'Data peserta ada yang kosong/tidak valid'
        },
        required: [true, 'Peserta RDJK belum ditentukan.'],
    },
    honor_gol3: {
        type: Number,
        required: [true, 'Honor Gol III belum ditentukan.'],
    },
    honor_gol4: {
        type: Number,
        required: [true, 'Honor Gol IV belum ditentukan.'],
    },
    honor_gol12: {
        type: Number,
        required: [true, 'Honor Gol I dan II belum ditentukan.'],
    },
    honor_mitra: {
        type: Number,
        required: [true, 'Honor mitra belum ditentukan.'],
    },
    mengingat_4: {
        type: String,
        required: [true, 'Mengingat poin 4 belum ditentukan.'],
    },
    mengingat_10: {
        type: String,
        required: [true, 'Mengingat poin 10 belum ditentukan.'],
    },
    nomor_dipa: {
        type: String,
        required: [true, 'Nomor DIPA belum ditentukan.'],
    },
    nomor_sk: {
        type: String,
        required: [true, 'Nomor SK belum ditentukan.'],
    },
    nomor_surtug: {
        type: String,
        required: [true, 'Nomor Surat Tugas belum ditentukan.'],
    },
    pembahasan: {
        type: String,
        required: [true, 'Pembahasan belum ditentukan.'],
    },
    pembuat_daftar: {
        type: {},
        required: [true, 'Pembuat Daftar belum ditentukan.'],
    },
    pok: {
        program: {
            kdprogram: String,
            uraian: String,
        },
        kegiatan: {
            kdgiat: String,
            uraian: String,
        },
        output: {
            kdoutput: String,
            uraian: String,
        },
        soutput: {
            kdsoutput: String,
            ursoutput: String,
        },
        komponen: {
            kdkmpnen: String,
            urkmpnen: String,
        },
        skomponen: {
            kdskmpnen: String,
            urskmpnen: String,
        },
        akun: {
            kdakun: String,
            uraian: String,
        },
        detail: {
            noitem: String,
            nmitem: String,
        },
    },
    tgl_buat_spj: {
        type: Date,
        required: [true, 'Tanggal pembuatan SPJ belum ditentukan.'],
    },
    tgl_sk: {
        type: Date,
        required: [true, 'Tanggal SK belum ditentukan.'],
    },
    waktu_mulai: {
        type: Date,
        required: [true, 'Tanggal Waktu Mulai belum ditentukan.'],
    },
    waktu_selesai: {
        type: Date,
        required: [true, 'Tanggal Waktu Selesai belum ditentukan.'],
    },
}, { collection: 'rdjk'});

RDJKSchema.virtual('waktu_overall').get(function () {
    if(moment(this.waktu_mulai).isSame(this.waktu_selesai)){
        return moment(this.waktu_mulai).format('DD MMMM YYYY')
    } else if(moment(this.waktu_mulai).format('MM') === moment(this.waktu_selesai).format('MM')){
        return moment(this.waktu_mulai).format('DD')+' - '+moment(this.waktu_selesai).format('DD')+' '+moment(this.waktu_mulai).format('MMMM YYYY')
    } else{
        return moment(this.waktu_mulai).format('DD MMMM YYYY')+' - '+moment(this.waktu_selesai).format('DD MMMM YYYY')
    }
});

module.exports = mongoose.model('RDJK', RDJKSchema);