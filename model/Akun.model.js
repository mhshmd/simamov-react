var mongoose = require('mongoose');

var Schema = mongoose.Schema;

var UraianAkun = require(__dirname+"/../model/UraianAkun.model");

var AkunSchema = new Schema({
    'thang': {
        type: Number,
        default: new Date().getFullYear()
    },
    'kdprogram': String,
    'kdgiat': String,
    'kdoutput': String,
    'kdsoutput': String,
    'kdkmpnen': String,
    'kdkmpnen': String,
    'kdskmpnen': String,
    'kdakun': String,
    uraian: String,
    jumlah: Number,
    timestamp: Number,
    active: {
        default: true,
        type: Boolean
    },
    old: [],
    pengentry: {
        type: String,
        ref: 'User'
    }
}, { collection: 'pok_akun' });

AkunSchema.pre('save', function(next) {
    var akun = this;
    UraianAkun.findOne({thang: this.thang, _id: this.kdakun}, 'uraian', function(err, uraian){
        if(uraian){
            akun.uraian = uraian.uraian;
            next(); 
        } else{
            next();
        }
    })
});

AkunSchema.methods.isExist = function(cb) {
    return this.model('Akun').findOne({ thang: this.thang, 'kdprogram': this.kdprogram, 'kdgiat': this.kdgiat, 'kdoutput': this.kdoutput, 
        'kdsoutput': this.kdsoutput, 'kdkmpnen': this.kdkmpnen, 'kdskmpnen': this.kdskmpnen, 'kdakun': this.kdakun }, cb);
};

AkunSchema.statics.getAll = function(cb) {
  return this.model('Akun').find({}, null, {sort: {_id:1}}, cb);
};

module.exports = mongoose.model('Akun', AkunSchema);