module.exports = ( redisClient, uid, cb ) => {
    if( redisClient ){
        redisClient.hgetall( uid, ( err, obj )=>{
            if(err) {
                console.log(err);
                return
            }
            cb( obj )
        })
    }
}