import io from 'socket.io-client'

export default function reducer(state={
    io: io,
    socket: socket,
}, action){
    switch (action.type) {
        case 'SET_SOCKET': {
            return { ...state, socket: action.payload }
        }
        case 'DESTROY_SOCKET': {
            return {
                ...state,
                socket: null,
            }
        }
    }

    return state;
}