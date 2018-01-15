import { combineReducers } from 'redux'

import general from './generalReducer'
import socket from './socketReducer'
import user from './userReducer'

export default combineReducers({
    general,
    socket,
    user
})