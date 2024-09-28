const redis = require('redis');
const client = redis.createClient();


client.on('connect', ()=>{
    console.log('Redis connected...');
});

client.on('error', (err)=>{
    console.log(`Redis error: ${err}`);
});


const cacheData = (key, data, expiration = 3600)=>{
    client.setex(key, expiration, JSON.stringify(data));
}

const getCachedData = (key)=>{
    return new Promise((resolve, reject)=>{
        client.get(key, (err, data)=>{
            if(err) reject(err);
            if(data !== null){
                resolve(JSON.parse(data));
            }else{
                resolve(null);
            }
        })
    })
}

module.exports = {cacheData, getCachedData};