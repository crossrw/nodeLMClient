var lmclient = require('./lmclient.js');

var client = new lmclient.LMClient('127.0.0.1', 3000, 'login', 'password', true);
client.on('connecting', function(host, port){
    console.log('connecting to ' + host + ':' + port);
});
client.on('connect', function(){
    console.log('connected');
});
client.on('loggedIn', function(id, version){
    console.log('logged in: id=' + id.toString(10) + ' version=' + version);
});
client.on('checkConnection', function(time){
    console.log('check connection successfully, delay=' + time/1000 + ' ms');
});
client.on('timeSynchronize', function(time){
    console.log('timeSynchronize: serverTime="' + time.toLocaleString() + '"');
});
client.on('disconnect', function(){
    console.log('disconnected');
});
client.on('error', function(err){
    console.log(err.message);
});


client.addChannel('channel1', lmclient.VT_I4, 'volt', 'comment', 1);
client.addChannel('channel2', lmclient.VT_I4, 'вольты', 'напряжение');
client.addChannel('channel3', lmclient.VT_I4, 'вольты', 'напряжение', 0, true);


client.connect();
