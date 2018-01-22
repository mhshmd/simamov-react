import React from 'react';
import {Alert, Button, ButtonGroup, Card, CardGroup, CardHeader, CardBody, CardText, Col, Collapse, Dropdown, DropdownToggle, DropdownMenu, DropdownItem, Form, FormGroup, Input, InputGroup, Label, Modal, ModalHeader, ModalBody, ModalFooter, TabContent, TabPane, Nav, NavItem, NavLink, Row} from "reactstrap";
import HotTable from 'react-handsontable';
import Datetime from 'react-datetime';
import moment from 'moment';
import Pikaday from 'pikaday';
import _ from 'underscore';

import {asyncContainer, Typeahead} from 'react-bootstrap-typeahead';
const AsyncTypeahead = asyncContainer(Typeahead);
//redux
import { connect } from 'react-redux';
import PDFSimplePreview from '../../component/PDFSimplePreview';
import DetailBelanjaSelector from '../../component/DetailBelanjaSelector';

import {setPDFPreviewSRC} from '../../redux/actions/rdjkActions'
import getNumber from '../../functions/getNumber'
import formatUang from '../../functions/formatUang'
import toTitleCase from '../../functions/toTitleCase'

import '../../../css/typeahead-react.css';
import '../../../css/react-datetime.css';
import '../../../css/pikaday.css';

class RDJK extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            isSubmitBuatSurat: false,
            isDownloadingSurat: false,
            isLoading: false,
            isOutputLoading: false,
            isProvLoading: false,
            isKabLoading: false,
            isOrgLoading: false,
            importPgwModal: false,
            ygBepergianModal: false,
            options: [],
            penanda_tgn_st_list: [
                {_id:'19580311 198003 1 004', nama: 'Dr. Hamonangan Ritonga, M.Sc.'},
                {_id:'19671022 199003 2 002', nama: 'Dr. Erni Tri Astuti, M.Math.'},
            ],
            penanda_tgn_legalitas_list: [
                {_id:'19700513 199211 1 001', nama: 'Bambang Nurcahyo, S.E., M.M.'},
                {_id:'19700926 199211 1 001', nama: 'Nurseto Wisnumurti, S.Si, M.Stat.'},
            ],
            penanda_tgn_st_selected: '',
            penanda_tgn_legalitas_selected: '',
            yang_bepergian: [],
            data: {
                starting_sppd: '1/SPD/STIS/2018',
                tugas: 'Perjalanan Tim Advance Dosen dalam rangka Penelitian Program DIV',
                posisi_kota: 'Luar Kota',
                jenis_ang: 'Plane',
                output: [],
                kode_output: '',
                prov: [],
                kab: [],
                org: [],
                tgl_berangkat: new Date(),
                tgl_kembali: new Date(),
                tgl_ttd_surtug: new Date(),
                penanda_tgn_st: {},
                penanda_tgn_legalitas: {}
            }
         };

         this.handleInputChange = this.handleInputChange.bind(this)
         this.buatSurat = this.buatSurat.bind(this)
         this.downloadSurat = this.downloadSurat.bind(this)
         this.toggleimportPgwModal = this.toggleimportPgwModal.bind(this)
         this.toggleYgBepergianModal = this.toggleYgBepergianModal.bind(this)
         this.handleYgBepergianTableChange = this.handleYgBepergianTableChange.bind(this)
        //  this.setPgw = this.setPgw.bind(this)
        //  this.fireYgBepergianTableChange = this.fireYgBepergianTableChange.bind(this)
    }

    // setPgw(data = this.refs.anggotaHot.hotInstance.getSourceData()){
    //     console.log(11111111111, data.pop());
    //     this.setState({
    //         yang_bepergian: data,
    //     });
    // }

    // fireYgBepergianTableChange(data){
    //     this.refs.anggotaHot.hotInstance.render();
    //     this.setPgw();
    // }

    handleYgBepergianTableChange(changes) {
        var yang_bepergian = this.refs.anggotaHot.hotInstance.getSourceData();
        _.each(changes, (item, i, obj)=>{
            if(_.contains(['tgl_berangkat', 'tgl_kembali'], item[1])){
                if(yang_bepergian[item[0]].tgl_berangkat && yang_bepergian[item[0]].tgl_kembali){
                    yang_bepergian[item[0]].jumlah_hari = moment(yang_bepergian[item[0]].tgl_kembali, 'DD/MM/YYYY').diff(moment(yang_bepergian[item[0]].tgl_berangkat, 'DD/MM/YYYY'), 'days') + 1;
                }
            } else if(item[1] === 'nama'){
                if(item[3]){
                    const _id = item[3].match(/.*\(NIP.\s(.*)\)/);
                    if(_id){
                        socket.emit('get peg by _id', _id[1], (pgw)=>{
                            const {_id, nama, gol, jabatan} = pgw;
                            yang_bepergian[item[0]] = {...yang_bepergian[item[0]], _id, nama, gol, jabatan}
                            this.setState({yang_bepergian})
                        })
                    } else{
                        yang_bepergian[item[0]].nama = item[3]
                    }
                }
            }
        })
        this.setState({yang_bepergian})
    }

    toggleYgBepergianModal() {
        this.setState({
            ygBepergianModal: !this.state.ygBepergianModal
        }, ()=>{
            setTimeout(()=>{
                if(!this.state.ygBepergianModal){
                    var yang_bepergian = [...this.state.yang_bepergian];
                    if(!yang_bepergian[yang_bepergian.length-1].nama){
                        yang_bepergian.pop();
                        this.setState({yang_bepergian})
                    }
                }
            }, 1000)
        });
    }

    handleInputChange(e){
        var data = {...this.state.data}
        if(e.target){
            data[e.target.name] = e.target.value;
            this.setState({data})
        }
    }

    buatSurat(e, toPdf = true) {
        console.log(this.state);
        // return
        this.setState({isSubmitBuatSurat: true})
        const { yang_bepergian, data } = this.state;
        socket.emit('surtug_buat_surat', {toPdf: toPdf, yang_bepergian: yang_bepergian, data: data}, (pdfLink)=>{
            // console.log(pdfLink);
            // return;
            if(pdfLink === false){
                
            } else{
                setPDFPreviewSRC(location.protocol+'//'+location.host+"/result/"+pdfLink)
            }
            this.setState({
                isSubmitBuatSurat: false, isDownloadingSurat: false
            })
        })
    }

    downloadSurat() {
        this.setState({ isDownloadingSurat: true });
        buatSurat(e, toPdf = false)
    }

    toggleimportPgwModal() {
        this.setState({
            importPgwModal: !this.state.importPgwModal
        });
    }

    render() {
        const linkStyle = {color: 'inherit', textDecoration: 'none'};
        const noPadding = {padding: 0};
        const noLeftPadding = {paddingLeft: 0};
        const bold = {fontWeight: 'bold'}
        const noMarginBottom = {marginBottom: 0}

        const {
            starting_sppd, 
            tugas, 
            jenis_ang, 
            output, 
            kode_output, 
            prov, 
            kab, 
            org, 
            posisi_kota, 
            tgl_berangkat, 
            tgl_kembali, 
            penanda_tgn_st, 
            penanda_tgn_legalitas, 
            tgl_ttd_surtug
        } = this.state.data
        const {
            isSubmitBuatSurat, 
            isDownloadingSurat, 
            isLoading, 
            isOutputLoading, 
            isProvLoading, 
            isKabLoading, 
            isOrgLoading, 
            options, 
            yang_bepergian, 
            penanda_tgn_st_list, 
            penanda_tgn_legalitas_list, 
            penanda_tgn_st_selected, 
            penanda_tgn_legalitas_selected
        } = this.state

        return (
            <div>
                <Row className='justify-content-center'>
                    <Col md='5'>
                        <CardGroup className='mb-0'>
                            <Card className='p-2'>
                                <CardBody>
                                    <Row>
                                        <Col md="12">
                                            <h4><i className="icon-plane"></i> Surat Tugas</h4>
                                        </Col>
                                    </Row>
                                    <Form action="" method="post" encType="multipart/form-data" className="form-horizontal">
                                        <Row>
                                            <Col md="12">
                                                <FormGroup>
                                                    <Label style={bold}>Nomor Surat <span>*</span></Label>
                                                    <Input onChange={this.handleInputChange.bind(this)} type="text" id="starting_sppd" name='starting_sppd' value={starting_sppd} required/>
                                                </FormGroup>
                                                <FormGroup>
                                                    <Label style={bold}>Nama Anggota <span>*</span></Label>
                                                    <AsyncTypeahead
                                                        multiple
                                                        autoFocus={true}
                                                        clearButton={true}
                                                        labelKey='nama'
                                                        isLoading={isLoading}
                                                        onSearch={query => {
                                                            this.setState({isLoading: true});
                                                            socket.emit('surtug_nama', query, function (pgw) {
                                                                this.setState({
                                                                    isLoading: false,
                                                                    options: pgw,
                                                                })
                                                            }.bind(this));
                                                        }}
                                                        options={options}
                                                        selected={yang_bepergian}
                                                        onChange={(selected) => {
                                                            this.setState({yang_bepergian: selected});
                                                        }}
                                                        emptyLabel='Tidak ada hasil'
                                                        highlightOnlyResult={true}
                                                        selectHintOnEnter={true}
                                                    />
                                                    <a href='#' onClick={this.toggleYgBepergianModal}>Import Pegawai</a>
                                                    <Modal isOpen={this.state.ygBepergianModal} toggle={this.toggleYgBepergianModal} className='modal-lg'>
                                                        <ModalHeader toggle={this.toggleYgBepergianModal}>Anggota</ModalHeader>
                                                            <ModalBody>
                                                                <HotTable root="hot" ref='anggotaHot' width="100%" height="640" manualColumnResize={true} settings={{
                                                                    data: yang_bepergian,
                                                                    dataSchema: {_id: null, nama: '', gol: null, jabatan: null, lokasi: null, tgl_berangkat: null, tgl_kembali: null, jumlah_hari: null},
                                                                    colHeaders: true,
                                                                    rowHeaders: true,
                                                                    colHeaders: ['Nama', 'Gol', 'Jabatan', 'Tujuan', 'Tanggal Berangkat', 'Tanggal Kembali', 'Jumlah Hari (Hari)'],
                                                                    colWidths: [125, 20, 100, 200, 48, 48, 20],
                                                                    stretchH: 'all',
                                                                    minSpareRows: 1,
                                                                    columns: [                                                                       
                                                                        {
                                                                            type: 'autocomplete',
                                                                            source: function (query, process) {
                                                                                this.props.socket.emit('surtug_nama', query, function (data) {
                                                                                    process(_.map(data, function(peg){ return peg.nama+' (NIP. '+peg._id+')'}));
                                                                                });
                                                                            }.bind(this),
                                                                            data: 'nama',
                                                                            strict: false
                                                                        },
                                                                        {data: 'gol'},
                                                                        {data: 'jabatan'},
                                                                        {data: 'lokasi'},
                                                                        {data: 'tgl_berangkat', type: 'date', dateFormat: 'DD/MM/YYYY', correctFormat: true},
                                                                        {data: 'tgl_kembali', type: 'date', dateFormat: 'DD/MM/YYYY', correctFormat: true},
                                                                        {data: 'jumlah_hari', type: 'numeric'}
                                                                    ],
                                                                    contextMenu: true,
                                                                    afterChange: function (changes, source) {
                                                                        if(changes){
                                                                            this.handleYgBepergianTableChange(changes);
                                                                        }
                                                                    }.bind(this)
                                                                }} />
                                                            </ModalBody>
                                                        <ModalFooter>
                                                        <Button color="secondary" onClick={this.toggleYgBepergianModal}>Kembali</Button>
                                                        </ModalFooter>
                                                    </Modal>
                                                </FormGroup>
                                                <FormGroup>
                                                    <Label style={bold}>Output/Komponen <span>*</span></Label>
                                                    <Row>
                                                        <Col md='9'>
                                                            <AsyncTypeahead
                                                                clearButton={true}
                                                                labelKey='urkmpnen'
                                                                isLoading={isOutputLoading}
                                                                onSearch={query => {
                                                                    this.setState({isOutputLoading: true});
                                                                    socket.emit('komponen_list', query, (data) => {
                                                                        this.setState({
                                                                            isOutputLoading: false,
                                                                            options: data,
                                                                        })
                                                                    });
                                                                }}
                                                                options={options}
                                                                selected={output}
                                                                onChange={(output) => {
                                                                    var data = {...this.state.data}
                                                                    var data = {...this.state.data}
                                                                    if(output.length){
                                                                        data.output = output;
                                                                        data.kode_output = output[0].kdoutput+'.'+output[0].kdkmpnen;
                                                                        data.tugas = 'Dalam Rangka '+toTitleCase(output[0].urkmpnen)
                                                                        this.setState({data: {...data}});
                                                                    }
                                                                }}
                                                                emptyLabel='Tidak ada hasil'
                                                                highlightOnlyResult={true}
                                                                selectHintOnEnter={true}
                                                            />
                                                            <span className="help-block text-muted">uraian</span>
                                                        </Col>
                                                        <Col md='3'>
                                                            <Input onChange={this.handleInputChange.bind(this)} type="text" id="kode_output" name='kode_output' value={kode_output} required/>
                                                            <span className="help-block text-muted">kode</span>
                                                        </Col>
                                                    </Row>
                                                </FormGroup> 
                                                <FormGroup>
                                                    <Label style={bold}>Tugas <span>*</span></Label>
                                                    <Input onChange={this.handleInputChange.bind(this)} type="textarea" id="tugas" name='tugas' value={tugas} rows="2"/>
                                                </FormGroup>
                                                <FormGroup>
                                                    <Label style={bold}>Lokasi <span>*</span></Label>
                                                </FormGroup>
                                                <FormGroup row>
                                                    <Col md='3'>
                                                        <Label>Provinsi <span>*</span></Label>
                                                    </Col>
                                                    <Col md='9'>
                                                        <AsyncTypeahead
                                                            clearButton={true}
                                                            labelKey='nama'
                                                            isLoading={isProvLoading}
                                                            onSearch={query => {
                                                                this.setState({isProvLoading: true});
                                                                socket.emit('prov_list', {'q': query}, (data) => {
                                                                    this.setState({
                                                                        isProvLoading: false,
                                                                        options: data,
                                                                    })
                                                                });
                                                            }}
                                                            options={options}
                                                            selected={prov}
                                                            onChange={(prov) => {
                                                                var data = {...this.state.data}
                                                                if(prov.length){
                                                                    data.prov = prov;
                                                                    this.setState({data: {...data}});
                                                                }
                                                            }}
                                                            emptyLabel='Tidak ada hasil'
                                                            highlightOnlyResult={true}
                                                            selectHintOnEnter={true}
                                                        />
                                                    </Col>
                                                </FormGroup>
                                                <FormGroup row>
                                                    <Col md='3'>
                                                        <Label>Kabupaten</Label>
                                                    </Col>
                                                    <Col md='9'>
                                                        <AsyncTypeahead
                                                            clearButton={true}
                                                            labelKey='nama'
                                                            isLoading={isKabLoading}
                                                            onSearch={query => {
                                                                this.setState({isKabLoading: true});
                                                                if(prov[0]){
                                                                    socket.emit('kab_list', {'q': query, 'prov': prov[0]._id}, (data) => {
                                                                        this.setState({
                                                                            isKabLoading: false,
                                                                            options: data,
                                                                        })
                                                                    });
                                                                }
                                                            }}
                                                            options={options}
                                                            selected={kab}
                                                            onChange={(kab) => {
                                                                var data = {...this.state.data}
                                                                if(kab.length){
                                                                    data.kab = kab;
                                                                    this.setState({data: {...data}});
                                                                }
                                                            }}
                                                            emptyLabel='Tidak ada hasil'
                                                            highlightOnlyResult={true}
                                                            selectHintOnEnter={true}
                                                        />
                                                    </Col>
                                                </FormGroup>
                                                <FormGroup row>
                                                    <Col md='3'>
                                                        <Label>Organisasi</Label>
                                                    </Col>
                                                    <Col md='9'>
                                                        <AsyncTypeahead
                                                            clearButton={true}
                                                            labelKey='nama'
                                                            isLoading={isOrgLoading}
                                                            allowNew={true}
                                                            newSelectionPrefix='Pilih: '
                                                            onSearch={query => {
                                                                this.setState({isOrgLoading: true});
                                                                socket.emit('org_list', query, (data) => {
                                                                    this.setState({
                                                                        isOrgLoading: false,
                                                                        options: data,
                                                                    })
                                                                });
                                                            }}
                                                            options={options}
                                                            selected={org}
                                                            onChange={(org) => {
                                                                var data = {...this.state.data}
                                                                if(org.length){
                                                                    data.org = org;
                                                                    this.setState({data: {...data}});
                                                                }
                                                            }}
                                                            emptyLabel='Tidak ada hasil'
                                                            selectHintOnEnter={true}
                                                        />
                                                    </Col>
                                                </FormGroup>
                                                <FormGroup row>
                                                    <Col md='12'>
                                                        <Label style={bold}>Posisi Kota <span>*</span></Label>
                                                    </Col>
                                                    <Col md='12'>
                                                        <FormGroup check className="form-check-inline">
                                                            <Label check htmlFor="Luar-Kota">
                                                                <Input onChange={this.handleInputChange.bind(this)} type="radio" id="Luar-Kota" name="posisi_kota" value="Luar Kota" checked={posisi_kota==="Luar Kota"}/> Luar Kota
                                                            </Label>
                                                            <Label check htmlFor="Dalam-Kota">
                                                                <Input onChange={this.handleInputChange.bind(this)} type="radio" id="Dalam-Kota" name="posisi_kota" value="Dalam Kota (>8 jam)" checked={posisi_kota==="Dalam Kota (>8 jam)"}/> Dalam Kota (>8 jam)
                                                            </Label>
                                                        </FormGroup>
                                                    </Col>
                                                </FormGroup>
                                                <FormGroup>
                                                    <Label style={bold}>Waktu Tugas <span>*</span></Label>
                                                    <Row>
                                                        <Col md='6'>
                                                            <Datetime onChange={params=>{
                                                                var data = {...this.state.data}
                                                                if(params._d){
                                                                    data['tgl_berangkat'] = params._d;
                                                                } else{
                                                                    if(/^\d{1,2}\s\w+\s\d{4}$/.test(params)){
                                                                        data['tgl_berangkat'] = moment(params, 'DD MMMM YYYY')._d;
                                                                    } else{
                                                                        data['tgl_berangkat'] = params;
                                                                    }
                                                                }
                                                                this.setState({data})
                                                            }} closeOnSelect={true} dateFormat="DD MMMM YYYY" locale="id" timeFormat={false} value={tgl_berangkat}/>
                                                            <span className="help-block text-muted">berangkat</span>
                                                        </Col>
                                                        <Col md='6'>
                                                            <Datetime onChange={params=>{
                                                                var data = {...this.state.data}
                                                                if(params._d){
                                                                    data['tgl_kembali'] = params._d;
                                                                } else{
                                                                    if(/^\d{1,2}\s\w+\s\d{4}$/.test(params)){
                                                                        data['tgl_kembali'] = moment(params, 'DD MMMM YYYY')._d;
                                                                    } else{
                                                                        data['tgl_kembali'] = params;
                                                                    }
                                                                }
                                                                this.setState({data})
                                                            }} closeOnSelect={true} dateFormat="DD MMMM YYYY" isValidDate={ current=>{
                                                                return current.isAfter( moment(tgl_berangkat).subtract(1, 'd') )
                                                            }} locale="id" timeFormat={false} value={tgl_kembali}/>
                                                            <span className="help-block text-muted">kembali</span>
                                                        </Col>
                                                    </Row>
                                                </FormGroup>
                                                <FormGroup>
                                                    <Col md='12' style={noLeftPadding}>
                                                        <Label style={bold}>Angkutan <span>*</span></Label>
                                                    </Col>
                                                    <Col md='12' style={noLeftPadding}>
                                                        <FormGroup check className="form-check-inline">
                                                            <Label check htmlFor="Plane">
                                                            <Input onChange={this.handleInputChange.bind(this)} type="radio" id="Plane" name="jenis_ang" value="Plane" checked={jenis_ang==="Plane"}/> Plane
                                                            </Label>
                                                            <Label check htmlFor="Kereta-Api">
                                                            <Input onChange={this.handleInputChange.bind(this)} type="radio" id="Kereta-Api" name="jenis_ang" value="Kereta Api" checked={jenis_ang==="Kereta Api"}/> Kereta Api
                                                            </Label>
                                                            <Label check htmlFor="Kendaraan-Umum">
                                                            <Input onChange={this.handleInputChange.bind(this)} type="radio" id="Kendaraan-Umum" name="jenis_ang" value="Kendaraan Umum" checked={jenis_ang==="Kendaraan Umum"}/> Kendaraan Umum
                                                            </Label>
                                                            <Label check htmlFor="Kendaraan-Dinas">
                                                            <Input onChange={this.handleInputChange.bind(this)} type="radio" id="Kendaraan-Dinas" name="jenis_ang" value="Kendaraan Dinas" checked={jenis_ang==="Kendaraan Dinas"}/> Kendaraan Dinas
                                                            </Label>
                                                        </FormGroup>
                                                    </Col>
                                                </FormGroup>
                                                <FormGroup>
                                                    <Label style={bold}>Penanda Tangan Surat Tugas <span>*</span></Label>
                                                    <Input 
                                                        type="select" 
                                                        id="penanda_tgn_st" 
                                                        name='penanda_tgn_st'
                                                        onChange={(e)=>{
                                                            var data = {...this.state.data};
                                                            data.penanda_tgn_st = _.findWhere(penanda_tgn_st_list, {_id: e.target.value});
                                                            this.setState({
                                                                penanda_tgn_st_selected: e.target.value,
                                                                data: {...data}
                                                            })
                                                        }}
                                                        defaultValue={penanda_tgn_st_selected}>
                                                        {penanda_tgn_st_list.map(person => <option key={person._id} value={person._id}>{person.nama}</option>)}
                                                    </Input>
                                                </FormGroup>
                                                <FormGroup>
                                                    <Label style={bold}>Penanda Tangan Legalitas <span>*</span></Label>
                                                    <Input
                                                        type="select" 
                                                        id="penanda_tgn_st" 
                                                        name='penanda_tgn_st'
                                                        onChange={(e)=>{
                                                            var data = {...this.state.data};
                                                            data.penanda_tgn_legalitas = _.findWhere(penanda_tgn_legalitas_list, {_id: e.target.value});
                                                            this.setState({
                                                                penanda_tgn_legalitas_selected: e.target.value,
                                                                data: {...data}
                                                            })
                                                        }}
                                                        defaultValue={penanda_tgn_legalitas_selected}>
                                                        {penanda_tgn_legalitas_list.map(person => <option key={person._id} value={person._id}>{person.nama}</option>)}
                                                    </Input>
                                                </FormGroup>
                                                <FormGroup>
                                                    <Label style={bold}>Tanggal TTD Surat Tugas <span>*</span></Label>
                                                    <Datetime onChange={params=>{
                                                        var data = {...this.state.data}
                                                        if(params._d){
                                                            data['tgl_ttd_surtug'] = params._d;
                                                        } else{
                                                            if(/^\d{1,2}\s\w+\s\d{4}$/.test(params)){
                                                                data['tgl_ttd_surtug'] = moment(params, 'DD MMMM YYYY')._d;
                                                            } else{
                                                                data['tgl_ttd_surtug'] = params;
                                                            }
                                                        }
                                                        this.setState({data})
                                                    }} closeOnSelect={true} dateFormat="DD MMMM YYYY" locale="id" timeFormat={false} value={tgl_ttd_surtug}/>
                                                </FormGroup>
                                                <ButtonGroup>
                                                    <Button type="button" onClick={this.buatSurat} color="primary">{isSubmitBuatSurat?<i className="fa fa-spinner fa-spin fa-1x fa-fw"></i>:''} Buat Surat</Button>
                                                    <Button type="button" onClick={this.downloadSurat} >{isDownloadingSurat?<i className="fa fa-spinner fa-spin fa-1x fa-fw"></i>:''} Download</Button>
                                                </ButtonGroup>
                                            </Col>
                                        </Row>
                                    </Form>
                                </CardBody>
                            </Card>
                        </CardGroup>
                    </Col>
                    <Col md='7'>
                        <PDFSimplePreview src={this.props.pdfPreviewSource}/>
                    </Col>                    
                </Row>
            </div>
        )
    }
}

// global state
function mapStateToProps(state){
    return {
        pdfPreviewSource: state.general.pdfPreviewSource,
        socket: state.socket.socket
    }
}

export default connect(mapStateToProps)(RDJK)

// <Typeahead
//     onChange={(selected) => {
//         console.log(selected[0]);
//         var data = {...this.state.data};
//         data.pembuat_daftar = selected[0];
//         this.setState({data});
//     }}
//     options={[ {id: 1, label: 'Muh. Shamad,SST'},{id: 2, label: 'Bambang Nur Cahyo, SE, MM'},{id: 3, label: '3'},{id: 4, label: '4'} ]}
// />