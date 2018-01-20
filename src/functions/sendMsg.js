
module.exports = (client, msg)=>{
    client.emit('messages', msg)
}