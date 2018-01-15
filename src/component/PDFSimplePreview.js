import React from 'react';

class PDFSimplePreview extends React.Component {
    render() {
        return (
            <div>
                <iframe className="preview-pane" type="application/pdf" width="100%" height="690" frameBorder="0" style={{position:'relative',zIndex:999}} src={this.props.src}></iframe>
            </div>
        )
    }
}

export default PDFSimplePreview