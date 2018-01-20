import React from 'react';
import {Alert, Button, ButtonGroup, Card, CardGroup, CardHeader, CardBody, CardText, Col, Collapse, Dropdown, DropdownToggle, DropdownMenu, DropdownItem, Form, FormGroup, Input, InputGroup, Label, Modal, ModalHeader, ModalBody, ModalFooter, TabContent, TabPane, Nav, NavItem, NavLink, Row} from "reactstrap";
import HotTable from 'react-handsontable';
import Datetime from 'react-datetime';
import moment from 'moment';
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

import '../../../css/typeahead-react.css';
import '../../../css/react-datetime.css';

class RDJK extends React.Component {
    constructor(props) {
        super(props);
        this.state = { 
            collapseDok: true,
            collapseSurtug: true,
            collapseSK: true,
            anggotaModal: false,
            isSubmitBuatSurat: false,
            isDownloadingSurat: false,

            isLoading: false,
            options: [],

            jumlahBruto: 0,
            jumlahDiterima: 0,
            jumlahPPh21: 0,

            template: [{
                _id: 'none',
                name: '-- tanpa template --'
            },{
                _id: 'sdkfhsdlfjdsl',
                name: 'Revisi DIPA'
            },{
                _id: 'sdkfhsdlfjds2',
                name: 'Pembentukan Politeknik'
            }],
            
            data: {
                nomor_sk: '067/KPA/STIS/'+new Date().getFullYear(),
                tgl_sk: new Date(),
                pok: {},
                pembahasan: 'Revisi DIPA',
                mengingat_4: 'Undang-Undang No. 15 Tahun 2016 tentang Anggaran Pendapatan dan Belanja Negara Tahun Anggaran 2017',
                mengingat_10: 'Keputusan Kepala Badan Pusat Statistik No. 323/PA/2017 tentang Pejabat Perbendaharaan Badan Pusat Statistik Tahun Anggaran 2018',
                nomor_dipa: 'DIPA-054-01.1.690332/2018 Tanggal 5 Desember 2017',
                honor_gol4: 400000,
                honor_gol3: 350000,
                honor_gol12: 200000,
                honor_mitra: 150000,


                waktu_mulai: new Date(),
                waktu_selesai: new Date(),
                tgl_buat_spj: new Date(),

                nomor_surtug: '02722.1082',

                anggota: [
                    // {_id: 1, index: 1, nama: 'Indra, S.Si', gol: 'IV', jlh_hari: 2}, {_id: 2, nama: 'Bambang Nurcahyo, SE, MM', gol: 'IV', jlh_hari: 2}, 
                    // {_id: 3, index: 2, nama: 'Nurseto Wisnumurti, S.Si, M.Stat', gol: 'IV', jlh_hari: 1},
                    // {_id: 4, index: 3, nama: 'Sri Widaryani, SE, M.Si', gol: 'III', jlh_hari: 1}
                ],
                pembuat_daftar: null,
            }
         };
        this.togglecollapseDok = this.togglecollapseDok.bind(this);
        this.togglecollapseSurtug = this.togglecollapseSurtug.bind(this);
        this.togglecollapseSK = this.togglecollapseSK.bind(this);
        this.toggleAnggotaModal = this.toggleAnggotaModal.bind(this);
        this.setAnggota = this.setAnggota.bind(this);
        this.handleAnggotaTableChange = this.handleAnggotaTableChange.bind(this);
        this.changePOK = this.changePOK.bind(this);
        this.buatSurat = this.buatSurat.bind(this);
        this.downloadSurat = this.downloadSurat.bind(this);
        this.getHonor = this.getHonor.bind(this);
    }

    downloadSurat() {
        this.setState({isDownloadingSurat: true});
        socket.emit('buat rdjk', {data: this.state.data, toPdf: false}, (files)=>{
            if(files === false){

            } else{
                _.each(files, (item, i, arr)=>{
                    window.open(location.protocol+'//'+location.host+"/result/rdjk/"+item);
                })
            }
            this.setState({isDownloadingSurat: false})
        })
    }

    togglecollapseDok() {
        this.setState({ collapseDok: !this.state.collapseDok });
    }

    togglecollapseSurtug() {
        this.setState({ collapseSurtug: !this.state.collapseSurtug });
    }

    togglecollapseSK() {
        this.setState({ collapseSK: !this.state.collapseSK });
    }

    toggleAnggotaModal() {
        this.refs.anggotaHot&&this.setAnggota()
        this.setState({
            anggotaModal: !this.state.anggotaModal
        });
    }

    setAnggota(data = this.refs.anggotaHot.hotInstance.getSourceData()){
        data.pop()
        this.setState({
            anggota: data,
            jumlahBruto: _.reduce(_.map(data, (row)=>{return row.jlh_bruto}), function(a, b){
                return a + b;
             }, 0),
            jumlahDiterima: _.reduce(_.map(data, (row)=>{return row.jlh_diterima}), function(a, b){
                return a + b;
             }, 0),
            jumlahPPh21: _.reduce(_.map(data, (row)=>{return row.pph21}), function(a, b){
                 return a + b;
              }, 0)
        });
    }

    getPrice(number){
        if(!number){
            return 0;
        } else{
            return +number;
        }
    }

    getPph21(row){
        if(!row.gol){
            return 0;
        } else if(row.gol.toUpperCase() === 'IV'){
            return row.jlh_bruto * 0.15;
        } else if(row.gol.toUpperCase() === 'III'){
            return row.jlh_bruto * 0.05;
        } else if(row.gol.toUpperCase() == 'MITRA'){
            return row.jlh_bruto * 0.06;
        } else{
            return 0;
        }
    }

    getHonor(gol){
        if(!gol){
            return 0;
        } else if(gol.toUpperCase() === 'IV'){
            return this.state.data.honor_gol4;
        } else if(gol.toUpperCase() === 'III'){
            return this.state.data.honor_gol3;
        } else if(_.contains(['I', 'II'], gol.toUpperCase())){
            return this.state.data.honor_gol12;
        } else if(gol.toUpperCase() == 'MITRA'){
            return this.state.data.honor_mitra;
        } else{
            return 0;
        }
    }

    updatePrice(row) {
        row['jlh_bruto'] = this.getPrice(row['jlh_hari']) * this.getPrice(row['upah_perhari']);
        row['pph21'] = this.getPph21(row);
        row['jlh_diterima'] = this.getPrice(row['jlh_bruto']) - this.getPrice(row['pph21']);
    }

    fireAnggotaTableChange(data, change){
        this.updatePrice(data[change[0]])
        this.refs.anggotaHot.hotInstance.render();
        this.setAnggota();
    }

    handleAnggotaTableChange(changes){
        var data = this.refs.anggotaHot.hotInstance.getSourceData();
        _.each(changes, (change)=>{
            data[change[0]]['index'] = change[0]+1;
            if(change[1] === 'nama'){
                socket.emit('get_pgw_byName', change[3], function (pgw) {
                    data[change[0]]['gol'] = '';
                    this.refs.anggotaHot.hotInstance.render();
                    if(pgw && pgw.gol){
                        data[change[0]]['gol'] = pgw.gol.replace(/\/.*$/g, '');
                        data[change[0]]['jabatan'] = pgw.jabatan;
                        data[change[0]]['upah_perhari'] = this.getHonor(data[change[0]]['gol'])
                    }
                    this.fireAnggotaTableChange(data, change);
                }.bind(this));
            } else if(change[1] === 'gol'){
                data[change[0]]['upah_perhari'] = this.getHonor(data[change[0]]['gol'])
                this.fireAnggotaTableChange(data, change);
            } else{
                this.fireAnggotaTableChange(data, change);
            }
        })
        
    }

    handleInputChange(e){
        var data = {...this.state.data}
        if(/honor_/.test(e.target.name)){
            data[e.target.name] = getNumber(e.target.value);
            this.setState(
                ()=>({data}),
                ()=>{
                    _.each(data.anggota, (row)=>{
                        if(row['gol']){
                            row['upah_perhari'] = this.getHonor(row['gol'])
                            this.updatePrice(row)
                        }
                    })
                    this.setState({
                        data,
                        jumlahBruto: _.reduce(_.map(data.anggota, (row)=>{return row.jlh_bruto}), function(a, b){
                            return a + b;
                         }, 0),
                        jumlahDiterima: _.reduce(_.map(data.anggota, (row)=>{return row.jlh_diterima}), function(a, b){
                            return a + b;
                         }, 0),
                        jumlahPPh21: _.reduce(_.map(data.anggota, (row)=>{return row.pph21}), function(a, b){
                              return a + b;
                           }, 0)
                    })
                }
            )
        } else{
            if(e.target){
                data[e.target.name] = e.target.value;
                this.setState({data})
            }
        }
    }

    changePOK(newPOK){
        var data = {...this.state.data}
        data.pok = newPOK
        this.setState({data})
    }

    buatSurat() {
        console.log(this.state.data);
        this.setState({isSubmitBuatSurat: true})
        socket.emit('buat rdjk', {data: this.state.data, toPdf: true}, (pdfLink)=>{
            if(pdfLink === false){

            } else{
                setPDFPreviewSRC(location.protocol+'//'+location.host+"/result/"+pdfLink)
            }
            this.setState({isSubmitBuatSurat: false})
        })
    }

    render() {
        const linkStyle = {color: 'inherit', textDecoration: 'none'};
        const noPadding = {padding: 0};
        const bold = {fontWeight: 'bold'}
        const noMarginBottom = {marginBottom: 0}
        const {
            nomor_sk, 
            tgl_sk,
            tgl_buat_spj, 
            waktu_mulai, 
            waktu_selesai, 
            pembahasan, 
            mengingat_4, 
            mengingat_10, 
            nomor_dipa, 
            honor_gol4, 
            honor_gol3, 
            honor_gol12, 
            honor_mitra, 
            nomor_surtug
        } = this.state.data;
        const {template, isSubmitBuatSurat, isDownloadingSurat} = this.state;

        return (
            <div>
                <Row className='justify-content-center'>
                    <Col md='5'>
                        <CardGroup className='mb-0'>
                            <Card className='p-2'>
                                <CardBody>
                                    <Row>
                                        <Col md="12">
                                            <h4><i className="icon-bubbles"></i> Rapat Diluar Jam Kerja (RDJK)</h4>
                                        </Col>
                                    </Row>
                                    <Form action="" method="post" encType="multipart/form-data" className="form-horizontal">
                                        <Row>
                                            <Col md="12">
                                                <FormGroup>
                                                    {/*<Card style={{border: 0}}>
                                                        <a href='#' style={linkStyle} onClick={this.togglecollapseDok}>
                                                            <CardHeader>Dokumen</CardHeader>
                                                        </a>
                                                        <Collapse isOpen={this.state.collapseDok}>
                                                            <p><a href='#'>RDJK Sebelumnya</a></p>
                                                            <FormGroup>
                                                                <Label style={bold}>Template</Label>
                                                                <Input type="select" onChange={(e)=>{
                                                                    this.setState({templateID: e.target.value})
                                                                }} defaultValue={this.state.programID}>
                                                                    {template.map(templ => <option key={templ._id} value={templ._id}>{templ.name}</option>)}
                                                                </Input>
                                                            </FormGroup>
                                                            <div style={{marginTop: 3}}>
                                                                <a href="#" className="mute"><i className="fa fa-pencil fa-lg"></i> ganti nama</a>
                                                                <a href="#" className="mute"><i className="fa fa-trash fa-lg"></i> hapus</a>
                                                            </div>
                                                        </Collapse>
                                                            </Card>*/}
                                                    <Card style={{border: 0}}>
                                                        <a href='#' style={linkStyle} onClick={this.togglecollapseSK}>
                                                            <CardHeader>SK</CardHeader>
                                                        </a>
                                                        <Collapse isOpen={this.state.collapseSK}>
                                                            <FormGroup>
                                                                <Label style={bold}>Nomor <span>*</span></Label>
                                                                <Input onChange={this.handleInputChange.bind(this)} type="text" id="nomor_sk" name='nomor_sk' value={nomor_sk} required/>
                                                            </FormGroup>
                                                            <FormGroup>
                                                                <Label style={bold}>Tgl SK <span>*</span></Label>
                                                                <Datetime onChange={params=>{
                                                                    var data = {...this.state.data}
                                                                    if(params._d){
                                                                        data['tgl_sk'] = params._d;
                                                                    } else{
                                                                        if(/^\d{1,2}\s\w+\s\d{4}$/.test(params)){
                                                                            data['tgl_sk'] = moment(params, 'DD MMMM YYYY')._d;
                                                                        } else{
                                                                            data['tgl_sk'] = params;
                                                                        }
                                                                    }
                                                                    this.setState({data})
                                                                }} closeOnSelect={true} dateFormat="DD MMMM YYYY" locale="id" timeFormat={false} value={tgl_sk}/>
                                                            </FormGroup>
                                                            <FormGroup>
                                                                <Label style={bold}>Detail Belanja <span>*</span></Label>
                                                                <FormGroup className='row'>
                                                                    <Col md='12'>
                                                                        <DetailBelanjaSelector pok={this.state.data.pok} changePOK={this.changePOK} />
                                                                    </Col>
                                                                </FormGroup>
                                                            </FormGroup>
                                                            <FormGroup>
                                                                <Label style={bold}>Pembahasan <span>*</span></Label>
                                                                <Input onChange={this.handleInputChange.bind(this)} type="text" id="pembahasan" name='pembahasan' value={pembahasan} required/>
                                                            </FormGroup>
                                                            <FormGroup>
                                                                <Label style={bold}>Mengingat (poin 4) <span>*</span></Label>
                                                                <Input onChange={this.handleInputChange.bind(this)} type="textarea" id="mengingat_4" name='mengingat_4' value={mengingat_4} rows="3"/>
                                                            </FormGroup>
                                                            <FormGroup>
                                                                <Label style={bold}>Mengingat (poin 10) <span>*</span></Label>
                                                                <Input onChange={this.handleInputChange.bind(this)} type="textarea" id="mengingat_10" name='mengingat_10' value={mengingat_10} rows="3"/>
                                                            </FormGroup>
                                                            <FormGroup>
                                                                <Label style={bold}>Nomor DIPA <span>*</span></Label>
                                                                <Input onChange={this.handleInputChange.bind(this)} type="textarea" id="nomor_dipa" name='nomor_dipa' value={nomor_dipa} rows="3"/>
                                                            </FormGroup>
                                                            <FormGroup>
                                                                <Label style={bold}>Honorarium <span>*</span></Label>
                                                                <FormGroup className='row'>
                                                                    <Col md='6'>
                                                                        <Input onChange={this.handleInputChange.bind(this)} type="text" id="honor_gol4" name='honor_gol4' value={formatUang(honor_gol4)}/>
                                                                        <span className="help-block text-muted">Gol IV</span>
                                                                    </Col>
                                                                    <Col md='6'>
                                                                        <Input onChange={this.handleInputChange.bind(this)} type="text" id="honor_gol3" name='honor_gol3' value={formatUang(honor_gol3)}/>
                                                                        <span className="help-block text-muted">Gol III</span>
                                                                    </Col>
                                                                    <Col md='6'>
                                                                        <Input onChange={this.handleInputChange.bind(this)} type="text" id="honor_gol12" name='honor_gol12' value={formatUang(honor_gol12)}/>
                                                                        <span className="help-block text-muted">Gol I dan II</span>
                                                                    </Col>
                                                                    <Col md='6'>
                                                                        <Input onChange={this.handleInputChange.bind(this)} type="text" id="honor_mitra" name='honor_mitra' value={formatUang(honor_mitra)}/>
                                                                        <span className="help-block text-muted">Mitra</span>
                                                                    </Col>
                                                                </FormGroup>
                                                            </FormGroup>
                                                            <FormGroup>
                                                                <Label style={bold}>Waktu <span>*</span></Label>
                                                                <FormGroup className='row'>
                                                                    <Col md='6'>
                                                                        <Datetime onChange={params=>{
                                                                            var data = {...this.state.data}
                                                                            if(params._d){
                                                                                data['waktu_mulai'] = params._d;
                                                                            } else{
                                                                                if(/^\d{1,2}\s\w+\s\d{4}$/.test(params)){
                                                                                    data['waktu_mulai'] = moment(params, 'DD MMMM YYYY')._d;
                                                                                } else{
                                                                                    data['waktu_mulai'] = params;
                                                                                }
                                                                            }
                                                                            this.setState({data})
                                                                        }} closeOnSelect={true} dateFormat="DD MMMM YYYY" locale="id" timeFormat={false} value={waktu_mulai}/>
                                                                        <span className="help-block text-muted">dari</span>
                                                                    </Col>
                                                                    <Col md='6'>
                                                                        <Datetime onChange={params=>{
                                                                            var data = {...this.state.data}
                                                                            if(params._d){
                                                                                data['waktu_selesai'] = params._d;
                                                                                data['tgl_buat_spj'] = data['waktu_selesai'];
                                                                            } else{
                                                                                if(/^\d{1,2}\s\w+\s\d{4}$/.test(params)){
                                                                                    data['waktu_selesai'] = moment(params, 'DD MMMM YYYY')._d;
                                                                                    data['tgl_buat_spj'] = data['waktu_selesai'];
                                                                                } else{
                                                                                    data['waktu_selesai'] = params;
                                                                                }
                                                                            }
                                                                            this.setState({data})
                                                                        }} closeOnSelect={true} dateFormat="DD MMMM YYYY" isValidDate={ current=>{
                                                                            return current.isAfter( moment(waktu_mulai).subtract(1, 'd') )
                                                                        } } locale="id" timeFormat={false} value={waktu_selesai}/>
                                                                        <span className="help-block text-muted">sampai</span>
                                                                    </Col>
                                                                </FormGroup>
                                                            </FormGroup>
                                                        </Collapse>
                                                    </Card>
                                                    <Card style={{border: 0}}>
                                                        <a href='#' style={linkStyle} onClick={this.togglecollapseSurtug}>
                                                            <CardHeader>Surat Tugas</CardHeader>
                                                        </a>
                                                        <Collapse isOpen={this.state.collapseSurtug}>
                                                            <FormGroup>
                                                                <Label style={bold}>Nomor <span>*</span></Label>
                                                                <Input onChange={this.handleInputChange.bind(this)} type="text" id="nomor_surtug" name='nomor_surtug' value={nomor_surtug} required/>
                                                            </FormGroup>
                                                            <FormGroup>
                                                                <Label style={bold}>Anggota <span>*</span></Label>
                                                                <p style={noMarginBottom}>{this.state.data.anggota.map(nama=>{
                                                                    return nama.nama;
                                                                }).join(", ")}</p>
                                                                <a href='#' onClick={this.toggleAnggotaModal}>Ubah</a>
                                                            </FormGroup>
                                                        </Collapse>
                                                        <FormGroup>
                                                            <Label style={bold}>Tgl Buat SPJ <span>*</span></Label>
                                                            <Datetime onChange={params=>{
                                                                var data = {...this.state.data}
                                                                if(params._d){
                                                                    data['tgl_buat_spj'] = params._d;
                                                                } else{
                                                                    if(/^\d{1,2}\s\w+\s\d{4}$/.test(params)){
                                                                        data['tgl_buat_spj'] = moment(params, 'DD MMMM YYYY')._d;
                                                                    } else{
                                                                        data['tgl_buat_spj'] = params;
                                                                    }
                                                                }
                                                                this.setState({data})
                                                            }} closeOnSelect={true} dateFormat="DD MMMM YYYY" locale="id" timeFormat={false} value={tgl_buat_spj}/>
                                                        </FormGroup>
                                                        <FormGroup>
                                                            <Label style={bold}>Pembuat Daftar <span>*</span></Label>
                                                            <AsyncTypeahead
                                                                labelKey='nama'
                                                                isLoading={this.state.isLoading}
                                                                onSearch={query => {
                                                                    this.setState({isLoading: true});
                                                                    socket.emit('penerima_list', {query: query, type: 'pegawai_only'}, function (pgw) {
                                                                        this.setState({
                                                                            isLoading: false,
                                                                            options: pgw,
                                                                        })
                                                                    }.bind(this));
                                                                }}
                                                                options={this.state.options}
                                                                onChange={(selected) => {
                                                                    var data = {...this.state.data};
                                                                    data.pembuat_daftar = selected[0];
                                                                    this.setState({data});
                                                                }}
                                                            />
                                                        </FormGroup>
                                                    </Card>
                                                </FormGroup>
                                                <ButtonGroup>
                                                    <Button type="button" onClick={this.buatSurat} color="primary">{isSubmitBuatSurat?<i className="fa fa-spinner fa-spin fa-1x fa-fw"></i>:''} Buat Surat</Button>
                                                    <Button type="button" onClick={this.downloadSurat} >{isDownloadingSurat?<i className="fa fa-spinner fa-spin fa-1x fa-fw"></i>:''} Download</Button>
                                                    <Button onClick={this.toggleAnggotaModal}>Simpan Template</Button>
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
                <Modal isOpen={this.state.anggotaModal} toggle={this.toggleAnggotaModal}>
                    <ModalHeader toggle={this.toggleAnggotaModal}>Anggota</ModalHeader>
                        <ModalBody>
                            <HotTable root="hot" ref='anggotaHot' manualColumnResize={true} settings={{
                                data: this.state.data.anggota,
                                dataSchema: {nama: null, gol: null, jlh_hari: null, upah_perhari: null, jlh_bruto: null, pph21: null, jlh_diterima: null, jabatan: null},
                                colHeaders: true,
                                rowHeaders: true,
                                colHeaders: ['Nama', 'Gol', 'Jumlah Hari', 'Upah per Hari', 'Jumlah Bruto', 'Potongan PPh 21', 'Jumlah Diterima', 'Jabatan'],
                                stretchH: 'all',
                                minSpareRows: 1,
                                columns: [
                                    {
                                        type: 'autocomplete',
                                        source: function (query, process) {
                                            this.props.socket.emit('penerima_list', {'query': query, 'type': 'all'}, function (data) {
                                                process(_.map(data, function(peg){ return peg.nama}));
                                            });
                                        }.bind(this),
                                        data: 'nama',
                                        strict: false
                                    },
                                    {data: 'gol'},
                                    {data: 'jlh_hari', type: 'numeric'},
                                    {data: 'upah_perhari', format: '_(* #,##0_);_(* (#,##0);_(* "-"_);_(@_)', type: 'numeric'},
                                    {data: 'jlh_bruto', format: '_(* #,##0_);_(* (#,##0);_(* "-"_);_(@_)', type: 'numeric'},
                                    {data: 'pph21', format: '_(* #,##0_);_(* (#,##0);_(* "-"_);_(@_)', type: 'numeric'},
                                    {data: 'jlh_diterima', format: '_(* #,##0_);_(* (#,##0);_(* "-"_);_(@_)', type: 'numeric'},
                                    {data: 'jabatan'}
                                ],
                                contextMenu: true,
                                afterChange: function (changes, source) {
                                    if(changes){
                                        this.handleAnggotaTableChange(changes);
                                    }
                                }.bind(this)
                            }} />
                        </ModalBody>
                    <Row>
                        <Col md='12'>
                            <Alert color="success">
                                <strong>Total</strong><br/>
                                Bruto: Rp{formatUang(this.state.jumlahBruto)}<br/>
                                Diterima: Rp{formatUang(this.state.jumlahDiterima)}<br/>
                                PPh21: Rp{formatUang(this.state.jumlahPPh21)}
                            </Alert>
                        </Col>
                    </Row>
                    <ModalFooter>
                    <Button color="secondary" onClick={this.toggleAnggotaModal}>Kembali</Button>
                    </ModalFooter>
                </Modal>
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