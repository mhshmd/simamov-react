import React from 'react';
import {Alert, Button, ButtonGroup, Card, CardGroup, CardHeader, CardBody, CardText, Col, Collapse, Dropdown, DropdownToggle, DropdownMenu, DropdownItem, Form, FormGroup, Input, InputGroup, InputGroupButton, Label, Modal, ModalHeader, ModalBody, ModalFooter, TabContent, TabPane, Nav, NavItem, NavLink, Row} from "reactstrap";
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

import {setPDFPreviewSRC} from '../../redux/actions/rdjkActions'
import getNumber from '../../functions/getNumber'
import formatUang from '../../functions/formatUang'
import toTitleCase from '../../functions/toTitleCase'

import '../../../css/typeahead-react.css';
import '../../../css/react-datetime.css';
import '../../../css/pikaday.css';

class PerhitunganSurtug extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            starting_sppd: '51/SPD/STIS/2017',
            isSubmitBuatSurat: false,
            isDownloadingSurat: false
         };

         this.handleInputChange = this.handleInputChange.bind(this)
         this.buatSurat = this.buatSurat.bind(this)
         this.downloadSurat = this.downloadSurat.bind(this)
         this.resetForm = this.resetForm.bind(this)
    }

    handleInputChange(e){
        if(e.target){
            this.setState({[e.target.name] : e.target.value})
        }
    }

    resetForm(){
        this.setState({
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

    componentDidMount(){
        setPDFPreviewSRC("http://localhost/result/sppd_perhitungan.pdf");
    }

    render() {
        const linkStyle = {color: 'inherit', textDecoration: 'none'};
        const noPadding = {padding: 0};
        const noLeftPadding = {paddingLeft: 0};
        const bold = {fontWeight: 'bold'}
        const noMarginBottom = {marginBottom: 0}
        
        const {
            starting_sppd,
            isSubmitBuatSurat,
            isDownloadingSurat
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
                                                            <Button color="secondary" type='button'><i className="icon-list"></i></Button>
                                                        </InputGroupButton>
                                                    </InputGroup>
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

export default connect(mapStateToProps)(PerhitunganSurtug)