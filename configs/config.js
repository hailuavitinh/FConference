var FConfDB =  {
    "mongodb": {
        "host":"118.69.135.101",
        //"host":"192.168.1.23",
        "port":"27017",
        "database":"FConf",
        "user":"",
        "password":""
    }
    
}
module.exports = {
    getMongoConnectString:function(){
        //return `mongodb://${FConfDB.mongodb.user}:${FConfDB.mongodb.password}@${FConfDB.mongodb.host}:${FConfDB.mongodb.port}/${FConfDB.mongodb.database}`;
        return `mongodb://${FConfDB.mongodb.host}:${FConfDB.mongodb.port}/${FConfDB.mongodb.database}`;
    }
};