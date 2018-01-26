var mongoose = require('mongoose');

var Schema = mongoose.Schema;

var SuratTugasSchema = new Schema({
    yang_bepergian: {
        type: {},
        required: [true, 'Anggota perjalanan dinas belum ditentukan.'],
    },
    output: {
        type: [{}],
        required: [true, 'Output belum ditentukan.'],
    },
    kode_output: {
        type: String,
        required: [true, 'Kode output belum ditentukan.'],
    },
    tugas: {
        type: String,
        required: [true, 'Tugas belum ditentukan.'],
    },
    prov: {
        type:[{}],
        required: [true, 'Provinsi belum ditentukan.'],
    },
    kab: [{}],
    org: [{}],
    posisi_kota: {
        type: String,
        required: [true, 'Posisi Kota belum ditentukan.'],
    },
    tgl_berangkat: {
        type: Date,
        required: [true, 'Tanggal berangkat belum ditentukan.'],
    },
    tgl_kembali: {
        type: Date,
        required: [true, 'Tanggal kembali belum ditentukan.'],
    },
    jenis_ang: {
        type: String,
        required: [true, 'Jenis angkutan belum ditentukan.'],
    },
    penanda_tgn_st: {
        type:{},
        required: [true, 'Penanda tangan surat tugas belum ditentukan.'],
    },
    penanda_tgn_legalitas: {
        type:{},
        required: [true, 'Penanda tangan legalitas belum ditentukan.'],
    },
    tgl_ttd_surtug: {
        type: Date,
        required: [true, 'Tanggal ttd surat tugas belum ditentukan.'],
    }
}, { collection: 'surat_tugas'});

module.exports = mongoose.model('SuratTugas2', SuratTugasSchema);