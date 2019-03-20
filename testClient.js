/* eslint-disable no-console */
/*jshint esversion: 6 */

var lm = require('./lmclient.js');

// создаем экземпляр класса
var client = new lm.LMClient({
        host:       '127.0.0.1',                // адрес сервера
        port:       3000,                       // порт сервера
        login:      'login1',                   // логин
        password:   'password',                 // пароль
        reconnect:  true,                       // автоматически переподключаться при ошибках и разрывах связи
        opros:      false,                      // тип учетной записи "опрос"
        client:     true                        // тип учетной записи "клиент"
});

// события
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
    console.log('check connection successfully, delay=' + time + ' ms');
});
client.on('timeSynchronize', function(time){
    console.log('timeSynchronize: serverTime="' + time.toLocaleString() + '"');
});
client.on('disconnect', function(){
    console.log('disconnected');
});
client.on('control', function(ch){
    console.log('receive control "' + ch.name + '" value="' + ch.value + '"');
    // подтверждаем прием
    client.setValue(ch.name, ch.value);
});
client.on('channel', function(channel){
    console.log('receive channel ' + channel.name + ' value:' + channel.value + ' quality:' + channel.quality);
});


client.on('error', function(err){
    console.log(err.message);
});

// подключаемся к серверу
client.connect();
