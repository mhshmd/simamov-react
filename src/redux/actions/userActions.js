import * as types from './types'
//redux store
import store from '../store'

const dispatch = store.dispatch

//set user
export const setUser = (username, isLoggedIn) => {
    dispatch( { 
        type: types.SET_USER,
        payload: { username: username, isLoggedIn: isLoggedIn },
     } );
}