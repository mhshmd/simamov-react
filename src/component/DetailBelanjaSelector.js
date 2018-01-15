import React from 'react';
import {Button, Col, FormGroup, Input, Label, Modal, ModalHeader, ModalBody, ModalFooter} from "reactstrap";

class DetailBelanjaSelector extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            detailModal: false,
            currentPopulate: '',
            program: [],
            kegiatan: [],
            output: [],
            soutput: [],
            komponen: [],
            skomponen: [],
            akun: [],
            detail: []
         };
        this.toggledetailModal = this.toggledetailModal.bind(this);
        this.itemSelected = this.itemSelected.bind(this);
    }

    toggledetailModal() {
        this.refs.anggotaHot&&this.setAnggota()
        this.setState({
            detailModal: !this.state.detailModal
        });
    }

    itemSelected(level, _id, sortBy, childLevel){
        socket.emit('pok_get_childs', {'level': level, 'sortby': sortBy, '_id': _id}, (childs)=>{
            this.setState(()=>({
                [childLevel]: childs,
                currentPopulate: childLevel,
            }), ()=>{
                const {currentPopulate} = this.state;
                var pok = {...this.props.pok}
                if(currentPopulate === 'program'){
                    pok.program = this.state.program[0];
                    this.props.changePOK(pok);
                    this.state.program[0]&&this.itemSelected('program', this.state.program[0]._id, 'kdgiat', 'kegiatan')
                } else if(currentPopulate === 'kegiatan'){
                    pok.kegiatan = this.state.kegiatan[0];
                    this.props.changePOK(pok);
                    this.state.kegiatan[0]&&this.itemSelected('kegiatan', this.state.kegiatan[0]._id, 'kdoutput', 'output')
                } else if(currentPopulate === 'output'){
                    pok.output = this.state.output[0];
                    this.props.changePOK(pok);
                    this.state.output[0]&&this.itemSelected('output', this.state.output[0]._id, 'kdsoutput', 'soutput')
                } else if(currentPopulate === 'soutput'){
                    pok.soutput = this.state.soutput[0];
                    this.props.changePOK(pok);
                    this.state.soutput[0]&&this.itemSelected('soutput', this.state.soutput[0]._id, 'kdkmpnen', 'komponen')
                } else if(currentPopulate === 'komponen'){
                    pok.komponen = this.state.komponen[0];
                    this.props.changePOK(pok);
                    this.state.komponen[0]&&this.itemSelected('komponen', this.state.komponen[0]._id, 'kdskmpnen', 'skomponen')
                } else if(currentPopulate === 'skomponen'){
                    pok.skomponen = this.state.skomponen[0];
                    this.props.changePOK(pok);
                    this.state.skomponen[0]&&this.itemSelected('skomponen', this.state.skomponen[0]._id, 'kdakun', 'akun')
                } else if(currentPopulate === 'akun'){
                    pok.akun = this.state.akun[0];
                    this.props.changePOK(pok);
                    this.state.akun[0]&&this.itemSelected('akun', this.state.akun[0]._id, 'noitem', 'detail')
                } else{
                    if(this.state.detail[0]){
                        pok.detail = _.omit(this.state.detail[0], ['old', 'realisasi']);
                        this.props.changePOK(pok);
                    }
                }
            });
        });
    }

    componentDidMount(){
        this.itemSelected('', null, 'kdprogram', 'program');
    }

    render() {
        const {program, kegiatan, output, soutput, komponen, skomponen, akun, detail} = this.state;
        const {pok} = this.props;
        return (
            <div>
                <span id="detail_label">{this.props.pok? (this.props.pok.detail? this.props.pok.detail.nmitem : '[Belum ada detail]') : '[Belum ada detail]'}</span> <a onClick={this.toggledetailModal} href="#"><i className="fa fa-pencil fa-sm"></i>ganti</a>
                <Modal isOpen={this.state.detailModal} toggle={this.toggledetailModal} className='modal-sm'>
                    <ModalHeader toggle={this.toggledetailModal}>Ubah Detail</ModalHeader>
                    <ModalBody>
                        <Col md='12'>
                            <FormGroup row>
                                <Label className='col-md-3'>Program</Label>
                                <Col md='9'>
                                    <Input type="select" onChange={(e)=>{
                                        this.setState({programID: e.target.value})
                                        var pok = {...this.props.pok}
                                        pok.program = _.findWhere(program, {_id: e.target.value})
                                        this.props.changePOK(pok);
                                        this.itemSelected('program', e.target.value, 'kdgiat', 'kegiatan');
                                    }} defaultValue={this.state.programID}>
                                        {program.map(prog => <option key={prog._id} value={prog._id}>{prog.kdprogram+' '+prog.uraian}</option>)}
                                    </Input>
                                </Col>
                            </FormGroup>
                            <FormGroup row>
                                <Label className='col-md-3'>Kegiatan</Label>
                                <Col md='9'>
                                    <Input type="select" onChange={(e)=>{
                                        this.setState({kegID: e.target.value})
                                        var pok = {...this.props.pok}
                                        pok.kegiatan = _.findWhere(kegiatan, {_id: e.target.value})
                                        this.props.changePOK(pok);
                                        this.itemSelected('kegiatan', e.target.value, 'kdoutput', 'output');
                                    }} defaultValue={this.state.kegID}>
                                        {kegiatan.map(keg => <option key={keg._id} value={keg._id}>{keg.kdgiat+' '+keg.uraian}</option>)}
                                    </Input>
                                </Col>
                            </FormGroup>
                            <FormGroup row>
                                <Label className='col-md-3'>Output</Label>
                                <Col md='9'>
                                    <Input type="select" onChange={(e)=>{
                                        this.setState({outpID: e.target.value})
                                        var pok = {...this.props.pok}
                                        pok.output = _.findWhere(output, {_id: e.target.value})
                                        this.props.changePOK(pok);
                                        this.itemSelected('output', e.target.value, 'kdsoutput', 'soutput');
                                    }} defaultValue={this.state.outpID}>
                                        {output.map(outp => <option key={outp._id} value={outp._id}>{outp.kdoutput+' '+outp.uraian}</option>)}
                                    </Input>
                                </Col>
                            </FormGroup>
                            <FormGroup row>
                                <Label className='col-md-3'>Sub Output</Label>
                                <Col md='9'>
                                    <Input type="select" onChange={(e)=>{
                                        this.setState({soutpID: e.target.value})
                                        var pok = {...this.props.pok}
                                        pok.soutput = _.findWhere(soutput, {_id: e.target.value})
                                        this.props.changePOK(pok);
                                        this.itemSelected('soutput', e.target.value, 'kdkmpnen', 'komponen');
                                    }} defaultValue={this.state.soutpID}>
                                        {soutput.map(soutp => <option key={soutp._id} value={soutp._id}>{soutp.kdsoutput+' '+soutp.ursoutput}</option>)}
                                    </Input>
                                </Col>
                            </FormGroup>
                            <FormGroup row>
                                <Label className='col-md-3'>Komponen</Label>
                                <Col md='9'>
                                    <Input type="select" onChange={(e)=>{
                                        this.setState({kompID: e.target.value})
                                        var pok = {...this.props.pok}
                                        pok.komponen = _.findWhere(komponen, {_id: e.target.value})
                                        this.props.changePOK(pok);
                                        this.itemSelected('komponen', e.target.value, 'kdskmpnen', 'skomponen');
                                    }} defaultValue={this.state.kompID}>
                                        {komponen.map(komp => <option key={komp._id} value={komp._id}>{komp.kdkmpnen+' '+komp.urkmpnen}</option>)}
                                    </Input>
                                </Col>
                            </FormGroup>
                            <FormGroup row>
                                <Label className='col-md-3'>Sub Komponen</Label>
                                <Col md='9'>
                                    <Input type="select" onChange={(e)=>{
                                        this.setState({skompID: e.target.value})
                                        var pok = {...this.props.pok}
                                        pok.skomponen = _.findWhere(skomponen, {_id: e.target.value})
                                        this.props.changePOK(pok);
                                        this.itemSelected('skomponen', e.target.value, 'kdakun', 'akun');
                                    }} defaultValue={this.state.skompID}>
                                        {skomponen.map(skomp => <option key={skomp._id} value={skomp._id}>{skomp.kdskmpnen+' '+skomp.urskmpnen}</option>)}
                                    </Input>
                                </Col>
                            </FormGroup>
                            <FormGroup row>
                                <Label className='col-md-3'>Akun</Label>
                                <Col md='9'>
                                    <Input type="select" onChange={(e)=>{
                                        this.setState({akunID: e.target.value})
                                        var pok = {...this.props.pok}
                                        pok.akun = _.findWhere(akun, {_id: e.target.value})
                                        this.props.changePOK(pok);
                                        this.itemSelected('akun', e.target.value, 'noitem', 'detail');
                                    }} defaultValue={this.state.akunID}>
                                        {akun.map(akun => <option key={akun._id} value={akun._id}>{akun.kdakun+' '+akun.uraian}</option>)}
                                    </Input>
                                </Col>
                            </FormGroup>
                            <FormGroup row>
                                <Label className='col-md-3'>Detail Belanja</Label>
                                <Col md='9'>
                                    <Input type="select" onChange={(e)=>{
                                        this.setState({detailID: e.target.value})
                                        var pok = {...this.props.pok}
                                        pok.detail = _.findWhere(detail, {_id: e.target.value})
                                        this.props.changePOK(pok);
                                    }} defaultValue={this.state.detailID}>
                                        {detail.map(detail => <option key={detail._id} value={detail._id}>{detail.noitem+' '+detail.nmitem}</option>)}
                                    </Input>
                                </Col>
                            </FormGroup>
                        </Col>
                    </ModalBody>
                    <ModalFooter>
                        <Button color="secondary" onClick={this.toggledetailModal}>Kembali</Button>
                    </ModalFooter>
                </Modal>
            </div>
        )
    }
}

export default DetailBelanjaSelector