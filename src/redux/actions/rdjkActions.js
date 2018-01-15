import * as types from './types'
//redux store
import store from '../store'

const dispatch = store.dispatch

//set user
export const setPDFPreviewSRC = (src) => {
    dispatch( { 
        type: types.SET_PDF_PREVIEW_SRC,
        payload: { pdfPreviewSource: src },
     } );
}