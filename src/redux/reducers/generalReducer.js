import * as types from '../actions/types'

export default function reducer(state={
    pdfPreviewSource: "http://localhost/result/rdjk.pdf",
}, action){
    switch (action.type) {
        case types.SET_PDF_PREVIEW_SRC: {
            return {
                ...state,
                ...action.payload,
            }
        }
    }

    return state
}