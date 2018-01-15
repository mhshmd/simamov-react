import React from 'react';
import {Input} from "reactstrap";

class DetailBelanjaSelector extends React.Component {
    constructor(props) {
        super(props);
        this.state = {

         };
    }

    render() {
        return (
            <Input onChange={this.handleInputChange.bind(this)} type="text" id="nomor_sk" name='nomor_sk' value={nomor_sk} required/>
        )
    }
}

export default DetailBelanjaSelector