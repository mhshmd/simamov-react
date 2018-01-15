import * as types from '../actions/types'

export default function reducer(state={
    username: 'guest',
    isLoggedIn: false,
    error: null,
}, action){
    switch (action.type) {
        case types.SET_USER: {
            return {
                ...state,
                ...action.payload,
            }
        }
    }

    return state
}