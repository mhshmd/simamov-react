import React from 'react';
import {Alert, Button, ButtonGroup, Card, CardGroup, CardHeader, CardBody, CardText, Col, Collapse, Dropdown, DropdownToggle, DropdownMenu, DropdownItem, Form, FormGroup, Input, InputGroup, InputGroupButton, Label, Modal, ModalHeader, ModalBody, ModalFooter, TabContent, TabPane, Nav, NavItem, NavLink, Row} from "reactstrap";
import HotTable from 'react-handsontable';
import Datetime from 'react-datetime';
import moment from 'moment';
import Pikaday from 'pikaday';
import _ from 'underscore';
import {AgGridReact, AgGridColumn} from "ag-grid-react";

import {asyncContainer, Typeahead} from 'react-bootstrap-typeahead';
const AsyncTypeahead = asyncContainer(Typeahead);
//redux
import { connect } from 'react-redux';
import PDFSimplePreview from '../../component/PDFSimplePreview';

import {setPDFPreviewSRC} from '../../redux/actions/rdjkActions'
import getNumber from '../../functions/getNumber'
import formatUang from '../../functions/formatUang'
import toTitleCase from '../../functions/toTitleCase'

import '../../../css/typeahead-react.css';
import '../../../css/react-datetime.css';
import '../../../css/pikaday.css';
import 'ag-grid/dist/styles/ag-grid.css';
import 'ag-grid/dist/styles/ag-theme-fresh.css';

class RDJK extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            isSubmitBuatSurat: false,
            isDownloadingSurat: false,
            isLoading: false,
            isTugasLoading: false,
            isOutputLoading: false,
            isProvLoading: false,
            isKabLoading: false,
            isOrgLoading: false,
            importPgwModal: false,
            ygBepergianModal: false,
            riwayatSuratModal: false,
            tugasOptions: [],
            nameOptions: [],
            kompOptions: [],
            provOptions: [],
            kabOptions: [],
            orgOptions: [],
            penanda_tgn_st_list: [],
            penanda_tgn_legalitas_list: [],
            penanda_tgn_st_selected: '',
            penanda_tgn_legalitas_selected: '',
            yang_bepergian: [],
            starting_sppd: '1/SPD/STIS/'+new Date().getFullYear(),
            tugas: [],
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
            penanda_tgn_legalitas: {},
            rowData: [],
            columnDefs: [
                {headerName: 'No. Surat', field: 'nomor_sppd'},
                {headerName: 'Nama', field: 'nama'},
                {headerName: 'Tujuan', field: 'tugas'}
            ],
         };

         this.handleInputChange = this.handleInputChange.bind(this)
         this.buatSurat = this.buatSurat.bind(this)
         this.downloadSurat = this.downloadSurat.bind(this)
         this.toggleRiwayatSurtugModal = this.toggleRiwayatSurtugModal.bind(this)
         this.toggleYgBepergianModal = this.toggleYgBepergianModal.bind(this)
         this.handleYgBepergianTableChange = this.handleYgBepergianTableChange.bind(this)
         this.sendDataForBuatSurat = this.sendDataForBuatSurat.bind(this)
         this.resetForm = this.resetForm.bind(this)
    }

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
        console.log(yang_bepergian);
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
        if(e.target){
            this.setState({[e.target.name] : e.target.value})
        }
    }

    resetForm(){
        this.setState({
            isSubmitBuatSurat: false,
            isDownloadingSurat: false,
            isLoading: false,
            isTugasLoading: false,
            isOutputLoading: false,
            isProvLoading: false,
            isKabLoading: false,
            isOrgLoading: false,
            importPgwModal: false,
            ygBepergianModal: false,
            tugasOptions: [],
            nameOptions: [],
            kompOptions: [],
            provOptions: [],
            kabOptions: [],
            orgOptions: [],
            yang_bepergian: [],
            tugas: [],
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
         }, () => {
            socket.emit('surtug.getSetting', '', ( res_setting )=>{
                this.setState({
                    starting_sppd: this.state.starting_sppd.replace(/^\d{1,4}/, res_setting.last_nmr_surat)
                })
            })
         })
    }

    sendDataForBuatSurat(toPdf = true, cb){
        //lihat data yang dikirim
        console.log(this.state);
        //kirim data ke server utk buat surat tugas, be = surtug.js
        socket.emit('surtug_buat_surat', {toPdf: toPdf, data: this.state}, (pdfLink)=>{
            if(pdfLink === false){
                
            } else{
                setPDFPreviewSRC(location.protocol+'//'+location.host+"/result/"+pdfLink)
                this.resetForm()
            }
            this.setState({
                isSubmitBuatSurat: false, isDownloadingSurat: false
            })
        })
    }

    buatSurat() {
        this.setState({isSubmitBuatSurat: true})
        this.sendDataForBuatSurat(true, ()=>{
            this.setState({ isSubmitBuatSurat: false });
        })
    }

    downloadSurat() {
        this.setState({ isDownloadingSurat: true });
        this.sendDataForBuatSurat(false, ()=>{
            this.setState({ isDownloadingSurat: false });
        })
    }

    toggleRiwayatSurtugModal() {
        this.setState({
            riwayatSuratModal: !this.state.riwayatSuratModal
        });
        socket.emit('surtug.getAllSurtug', '', ( res_allSurtug )=>{
            this.setState({
                rowData: res_allSurtug
            })
        })
    }

    componentDidMount(){
        setPDFPreviewSRC("http://localhost/result/surat_tugas.pdf");
        socket.emit('surtug.getSetting', '', ( res_setting )=>{
            this.setState({
                starting_sppd: this.state.starting_sppd.replace(/^\d{1,4}/, res_setting.last_nmr_surat),
                penanda_tgn_st_list: res_setting.ttd_st,
                penanda_tgn_st: res_setting.ttd_st?res_setting.ttd_st[0]:{}, 
                penanda_tgn_legalitas_list: res_setting.ttd_leg,
                penanda_tgn_legalitas:  res_setting.ttd_leg? res_setting.ttd_leg[0]:{}
            })
        })

        socket.emit('index.getTahunAnggaran', '', ( tahun_anggaran )=>{
            this.setState( {
                starting_sppd: this.state.starting_sppd.replace(/\d{4}$/, tahun_anggaran)
            } )
        })
    }

    render() {
        const linkStyle = {color: 'inherit', textDecoration: 'none'};
        const noPadding = {padding: 0};
        const noLeftPadding = {paddingLeft: 0};
        const bold = {fontWeight: 'bold'}
        const noMarginBottom = {marginBottom: 0}
        
        const {
            isSubmitBuatSurat, 
            isDownloadingSurat, 
            isLoading, 
            isTugasLoading,
            isOutputLoading, 
            isProvLoading, 
            isKabLoading, 
            isOrgLoading, 
            tugasOptions,
            nameOptions,
            kompOptions,
            provOptions,
            kabOptions,
            orgOptions,
            yang_bepergian, 
            penanda_tgn_st_list, 
            penanda_tgn_legalitas_list, 
            penanda_tgn_st_selected, 
            penanda_tgn_legalitas_selected,
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
                                                    <InputGroup>
                                                        <Input onChange={this.handleInputChange.bind(this)} type="text" id="starting_sppd" name='starting_sppd' value={starting_sppd} required/>
                                                        <InputGroupButton>
                                                            <Button color="secondary" type='button' onClick={this.toggleRiwayatSurtugModal}><i className="icon-list"></i></Button>
                                                            <Modal isOpen={this.state.riwayatSuratModal} toggle={this.toggleRiwayatSurtugModal}>
                                                                <ModalHeader toggle={this.toggleRiwayatSurtugModal}>Riwayat Surat Tugas</ModalHeader>
                                                                    <ModalBody>
                                                                        <div  style={{height: 400, width: '100%', marginTop: 15}} className="ag-theme-fresh">
                                                                            <AgGridReact
                                                                                // properties
                                                                                rowData={this.state.rowData}
                                                                                columnDefs={this.state.columnDefs}>
                                                                            </AgGridReact>
                                                                        </div>
                                                                    </ModalBody>
                                                                <ModalFooter>
                                                                <Button color="secondary" onClick={this.toggleRiwayatSurtugModal}>Kembali</Button>
                                                                </ModalFooter>
                                                            </Modal>
                                                        </InputGroupButton>
                                                    </InputGroup>
                                                </FormGroup>
                                                <FormGroup>
                                                    <Label style={bold}>Nama Anggota <span>*</span></Label>
                                                    <AsyncTypeahead
                                                        multiple
                                                        autoFocus={true}
                                                        labelKey='nama'
                                                        isLoading={isLoading}
                                                        onSearch={query => {
                                                            this.setState({isLoading: true});
                                                            socket.emit('surtug_nama', query, function (pgw) {
                                                                this.setState({
                                                                    isLoading: false,
                                                                    nameOptions: pgw,
                                                                })
                                                            }.bind(this));
                                                        }}
                                                        options={nameOptions}
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
                                                                <HotTable root="hot" ref='anggotaHot' height="640" manualColumnResize={true} settings={{
                                                                    data: yang_bepergian,
                                                                    dataSchema: {
                                                                        _id: null,
                                                                        nama: '', 
                                                                        gol: null, 
                                                                        jabatan: null, 
                                                                        lokasi: null, 
                                                                        tgl_berangkat: null, 
                                                                        tgl_kembali: null, 
                                                                        jumlah_hari: null,
                                                                        penanda_tgn_st_nama: null,
                                                                        penanda_tgn_st_nip: null,
                                                                        penanda_tgn_st_jabatan: null,
                                                                    },
                                                                    colHeaders: true,
                                                                    rowHeaders: true,
                                                                    colHeaders: [
                                                                        'NIP',
                                                                        'Nama', 
                                                                        'Gol', 
                                                                        'Jabatan', 
                                                                        'Tujuan', 
                                                                        'Tanggal Berangkat', 
                                                                        'Tanggal Kembali', 
                                                                        'Jumlah Hari (Hari)', 
                                                                        'Penanda Tangan Surat Tugas', 
                                                                        'NIP Penanda Tangan Surat Tugas',
                                                                        'Jabatan Penanda Tangan Surat Tugas'
                                                                        
                                                                    ],
                                                                    colWidths: [48, 125, 20, 100, 100, 48, 48, 20, 48, 48, 48],
                                                                    stretchH: 'all',
                                                                    minSpareRows: 1,
                                                                    columns: [     
                                                                        {data: '_id'},                                                                  
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
                                                                        {data: 'jumlah_hari', type: 'numeric'},
                                                                        {data: 'penanda_tgn_st_nama'},
                                                                        {data: 'penanda_tgn_st_nip'},
                                                                        {data: 'penanda_tgn_st_jabatan'},
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
                                                                labelKey='urkmpnen'
                                                                isLoading={isOutputLoading}
                                                                onSearch={query => {
                                                                    this.setState({isOutputLoading: true});
                                                                    socket.emit('komponen_list', query, (data) => {
                                                                        this.setState({
                                                                            isOutputLoading: false,
                                                                            kompOptions: data,
                                                                        })
                                                                    });
                                                                }}
                                                                options={kompOptions}
                                                                selected={output}
                                                                onChange={(output) => {
                                                                    this.setState({
                                                                        kode_output : output[0]?output[0].kdoutput+'.'+output[0].kdkmpnen:'',
                                                                        output: output,
                                                                        tugas : output[0]?[{nama: 'Dalam Rangka '+toTitleCase(output[0].urkmpnen)}]:[]
                                                                    });
                                                                }}
                                                                emptyLabel='Tidak ada hasil'
                                                                highlightOnlyResult={true}
                                                                selectHintOnEnter={true}
                                                                allowNew={true}
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
                                                    <AsyncTypeahead
                                                            labelKey='nama'
                                                            isLoading={isTugasLoading}
                                                            onSearch={query => {
                                                                this.setState({isTugasLoading: true});
                                                                socket.emit('komponen_list_extra', query, (data) => {
                                                                    this.setState({
                                                                        isTugasLoading: false,
                                                                        tugasOptions: data,
                                                                    })
                                                                });
                                                            }}
                                                            options={tugasOptions}
                                                            selected={tugas}
                                                            onChange={(tugas) => {
                                                                this.setState({
                                                                    tugas: tugas,
                                                                });
                                                            }}
                                                            emptyLabel='Tidak ada hasil'
                                                            allowNew={true}
                                                            selectHintOnEnter={true}
                                                        />
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
                                                            labelKey='nama'
                                                            isLoading={isProvLoading}
                                                            onSearch={query => {
                                                                this.setState({isProvLoading: true});
                                                                socket.emit('prov_list', {'q': query}, (data) => {
                                                                    this.setState({
                                                                        isProvLoading: false,
                                                                        provOptions: data,
                                                                    })
                                                                });
                                                            }}
                                                            options={provOptions}
                                                            selected={prov}
                                                            onChange={(prov) => {
                                                                this.setState({
                                                                    prov: prov,
                                                                });
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
                                                            labelKey='nama'
                                                            isLoading={isKabLoading}
                                                            onSearch={query => {
                                                                this.setState({isKabLoading: true});
                                                                var syarat = { 'q': query }
                                                                if(prov[0]){
                                                                    syarat.prov = prov[0]._id
                                                                }
                                                                socket.emit('kab_list', syarat, (data) => {
                                                                    this.setState({
                                                                        isKabLoading: false,
                                                                        kabOptions: data,
                                                                    })
                                                                });
                                                            }}
                                                            options={kabOptions}
                                                            selected={kab}
                                                            onChange={(kab) => {
                                                                this.setState({
                                                                    kab: kab,
                                                                });
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
                                                            labelKey='nama'
                                                            isLoading={isOrgLoading}
                                                            allowNew={true}
                                                            newSelectionPrefix='Pilih: '
                                                            onSearch={query => {
                                                                this.setState({isOrgLoading: true});
                                                                socket.emit('org_list', query, (data) => {
                                                                    this.setState({
                                                                        isOrgLoading: false,
                                                                        orgOptions: data,
                                                                    })
                                                                });
                                                            }}
                                                            options={orgOptions}
                                                            selected={org}
                                                            onChange={(org) => {
                                                                this.setState({
                                                                    org: org,
                                                                });
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
                                                                var tgl = params._d;
                                                                if(params._d){
                                                                    tgl = params._d;
                                                                } else{
                                                                    if(/^\d{1,2}\s\w+\s\d{4}$/.test(params)){
                                                                        tgl = moment(params, 'DD MMMM YYYY')._d;
                                                                    } else{
                                                                        tgl = params;
                                                                    }
                                                                }
                                                                this.setState({tgl_berangkat: tgl})
                                                            }} closeOnSelect={true} dateFormat="DD MMMM YYYY" locale="id" timeFormat={false} value={tgl_berangkat}/>
                                                            <span className="help-block text-muted">berangkat</span>
                                                        </Col>
                                                        <Col md='6'>
                                                            <Datetime onChange={params=>{
                                                                var tgl = params._d;
                                                                if(params._d){
                                                                    tgl = params._d;
                                                                } else{
                                                                    if(/^\d{1,2}\s\w+\s\d{4}$/.test(params)){
                                                                        tgl = moment(params, 'DD MMMM YYYY')._d;
                                                                    } else{
                                                                        tgl = params;
                                                                    }
                                                                }
                                                                this.setState({tgl_kembali: tgl})
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
                                                            this.setState({
                                                                penanda_tgn_st_selected: e.target.value,
                                                                penanda_tgn_st: _.findWhere(penanda_tgn_st_list, {_id: e.target.value})
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
                                                            this.setState({
                                                                penanda_tgn_legalitas_selected: e.target.value,
                                                                penanda_tgn_legalitas: _.findWhere(penanda_tgn_legalitas_list, {_id: e.target.value})
                                                            })
                                                        }}
                                                        defaultValue={penanda_tgn_legalitas_selected}>
                                                        {penanda_tgn_legalitas_list.map(person => <option key={person._id} value={person._id}>{person.nama}</option>)}
                                                    </Input>
                                                </FormGroup>
                                                <FormGroup>
                                                    <Label style={bold}>Tanggal TTD Surat Tugas <span>*</span></Label>
                                                    <Datetime onChange={params=>{
                                                        var tgl_ttd_surtug;
                                                        if(params._d){
                                                            tgl_ttd_surtug = params._d;
                                                        } else{
                                                            if(/^\d{1,2}\s\w+\s\d{4}$/.test(params)){
                                                                tgl_ttd_surtug = moment(params, 'DD MMMM YYYY')._d;
                                                            } else{
                                                                tgl_ttd_surtug = params;
                                                            }
                                                        }
                                                        this.setState({tgl_ttd_surtug})
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