var mongoose = require('mongoose');

var Schema = mongoose.Schema;

var RDJKSchema = new Schema({
    anggota: {
        type: [],
        required: true,
    },
    honor_gol3: {
        type: Number,
        required: true,
    },
    honor_gol4: {
        type: Number,
        required: true,
    },
    honor_gol12: {
        type: Number,
        required: true,
    },
    honor_mitra: {
        type: Number,
        required: true,
    },
    mengingat_4: {
        type: String,
        required: true,
    },
    mengingat_10: {
        type: String,
        required: true,
    },
    nomor_dipa: {
        type: String,
        required: true,
    },
    nomor_sk: {
        type: String,
        required: true,
    },
    nomor_surtug: {
        type: String,
        required: true,
    },
    pembahasan: {
        type: String,
        required: true,
    },
    pembuat_daftar: {
        type: {},
        required: true,
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
        required: true,
    },
    tgl_sk: {
        type: Date,
        required: true,
    },
    waktu_mulai: {
        type: Date,
        required: true,
    },
    waktu_selesai: {
        type: Date,
        required: true,
    },
}, { collection: 'rdjk'});

module.exports = mongoose.model('RDJK', RDJKSchema);