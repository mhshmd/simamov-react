const mongoose = require('mongoose');
const moment = require('moment')

var Schema = mongoose.Schema;

var SuratTugasSchema = new Schema({
    nomor_sppd: {
        type: String,
        required: [true, 'Nomor surat tugas bermasalah.']
    },
    nama: {
        type: String,
        required: [true, 'Nama anggota ada yang kosong.']
    },
    nip: {
        type: String,
        required: [true, 'nip anggota ada yang kosong.']
    },
    gol: {
        type: String,
        required: [true, 'Gol anggota ada yang kosong.']
    },
    jabatan: {
        type: String,
        required: [true, 'Jabatan anggota ada yang kosong.']
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
        type: {},
        required: [true, 'Tugas belum ditentukan.'],
    },
    prov: {
        type:[{}],
        required: [true, 'Provinsi belum ditentukan.'],
    },
    kab: [{}],
    org: [{}],
    lokasi: String,
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
    jumlah_hari: Number,
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
    },
    ppk: {
        type: {},
        required: [true, 'PPK belum ditentukan.'],
    }    
}, { collection: 'surat_tugas2'});

SuratTugasSchema.virtual('lokasi_').get(function () {

    var lokasi_ = [];

    if( this.lokasi ){
        return this.lokasi
    }

    if(this.org.length){
        lokasi_.push(this.org[0].nama);
    }

    if (this.kab.length) {
        lokasi_.push(this.kab[0].nama)
    }

    if (this.prov.length) {
        lokasi_.push(this.prov[0].nama)
    }

    return lokasi_.join(", ");

});

SuratTugasSchema.virtual('jumlah_hari_').get(function () {

    if( this.jumlah_hari ){
        return this.jumlah_hari
    }

    return moment(this.tgl_kembali, 'DD/MM/YYYY').diff(moment(this.tgl_berangkat, 'DD/MM/YYYY'), 'days') + 1;

});

SuratTugasSchema.virtual('kop_ttd_st').get(function () {
    if( this.penanda_tgn_st.jabatan === 'Ketua STIS' ){
        return ''
    } else{
        return 'A.n. Ketua Sekolah Tinggi Ilmu Statistik'
    }
});

module.exports = mongoose.model('SuratTugas2', SuratTugasSchema);