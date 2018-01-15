import React from 'react';
import {Button, Modal, ModalHeader, ModalBody, ModalFooter} from 'reactstrap';
import HotTable from 'react-handsontable';

class HandsontableOnModal extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            anggotaModal: false
        }
        this.toggleAnggotaModal = this.toggleAnggotaModal.bind(this)
    }
    toggleAnggotaModal() {
        this.setState({
            anggotaModal: !this.state.anggotaModal
        });
    }
    componentDidMount(){
        this.setState({
            anggotaModal: true,
        }, ()=>{
            console.log(this.refs.anggotaHot?this.refs.anggotaHot.hotInstance:'');
        })
    }
    render() {
        return (
            <Modal isOpen={this.props.anggotaModal} toggle={this.props.toggleAnggotaModal}>
                <ModalHeader toggle={this.toggleAnggotaModal}>Anggota</ModalHeader>
                    <ModalBody>
                        {this.state.anggotaModal?
                            <HotTable root="hot" ref='anggotaHot' manualColumnResize={true} settings={{
                                data: [],
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
                            }} />:''
                        }
                    </ModalBody>
                <ModalFooter>
                <Button color="secondary" onClick={this.props.toggleAnggotaModal}>Kembali</Button>
                </ModalFooter>
            </Modal>
        )
    }
}

export default HandsontableOnModal