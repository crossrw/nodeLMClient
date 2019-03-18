/*jshint esversion: 6 */

var lmclient = require('./lmclient.js');

var client = new lmclient.LMClient({
        host:       '127.0.0.1',                // адрес сервера
        port:       3000,                       // порт сервера
        login:      'login',                    // логин
        password:   'password',                 // пароль
        // reconnect:  true,                       // автоматически переподключаться при ошибках и разрывах связи
        // opros:      true,                       // тип учетной записи "опрос"
        // client:     false                       // тип учетной записи "клиент"
});

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
client.on('data', function(ch){
    console.log('receive channel "' + ch.name+ '" value="' + ch.value + '"');
    // подтверждаем прием
    client.setValue(ch.name, ch.value);
});

client.on('error', function(err){
    console.log(err.message);
});

// создаем каналы всех типов
client.addChannel('channel_VT_I1', lmclient.VT_I1, 'вольты', 'тип VT_I1', 0);
client.addChannel('channel_VT_UI1', lmclient.VT_UI1, 'амперы', 'тип VT_UI1', 0);
client.addChannel('channel_VT_I2', lmclient.VT_I2, 'секунды', 'тип VT_I2', 0);
client.addChannel('channel_VT_UI2', lmclient.VT_UI2, 'килограммы', 'тип VT_UI2', 0);
client.addChannel('channel_VT_I4', lmclient.VT_I4, 'миллиметры', 'тип VT_I4', 0);
client.addChannel('channel_VT_UI4', lmclient.VT_UI4, 'паскали', 'тип VT_UI4', 0);
client.addChannel('channel_VT_R4', lmclient.VT_R4, 'омы', 'тип VT_R4', 0);
client.addChannel('channel_VT_R8', lmclient.VT_R8, 'мешки', 'тип VT_R8', 0);
client.addChannel('channel_VT_DATE', lmclient.VT_DATE, 'дата и время', 'тип VT_DATE', 0);
client.addChannel('channel_VT_BOOL', lmclient.VT_BOOL, 'хорошо или плохо', 'тип VT_BOOL', 0);
client.addChannel('channel_VT_STRING', lmclient.VT_STRING, 'это строка', 'тип VT_STRING', 0);
// создаем каналы всех типов с возможностью управления
client.addChannel('channelw_VT_I1', lmclient.VT_I1, 'вольты', 'тип VT_I1', 0, true);
client.addChannel('channelw_VT_UI1', lmclient.VT_UI1, 'амперы', 'тип VT_UI1', 0, true);
client.addChannel('channelw_VT_I2', lmclient.VT_I2, 'секунды', 'тип VT_I2', 0, true);
client.addChannel('channelw_VT_UI2', lmclient.VT_UI2, 'килограммы', 'тип VT_UI2', 0, true);
client.addChannel('channelw_VT_I4', lmclient.VT_I4, 'миллиметры', 'тип VT_I4', 0, true);
client.addChannel('channelw_VT_UI4', lmclient.VT_UI4, 'паскали', 'тип VT_UI4', 0, true);
client.addChannel('channelw_VT_R4', lmclient.VT_R4, 'омы', 'тип VT_R4', 0, true);
client.addChannel('channelw_VT_R8', lmclient.VT_R8, 'мешки', 'тип VT_R8', 0, true);
client.addChannel('channelw_VT_DATE', lmclient.VT_DATE, 'дата и время', 'тип VT_DATE', 0, true);
client.addChannel('channelw_VT_BOOL', lmclient.VT_BOOL, 'хорошо или плохо', 'тип VT_BOOL', 0, true);
client.addChannel('channelw_VT_STRING', lmclient.VT_STRING, 'это строка', 'тип VT_STRING', 0, true);
// подключаемся к серверу
client.connect();

var value = 0;

setInterval(function(){
    if(value++ >= 255) value = 0;
    //
    client.setValue('channel_VT_I1', value-128);
    client.setValue('channel_VT_UI1', value);
    client.setValue('channel_VT_I2', (value-128)*256);
    client.setValue('channel_VT_UI2', value*256);
    client.setValue('channel_VT_I4', (value-128)*256);
    client.setValue('channel_VT_UI4', value*256);
    client.setValue('channel_VT_R4', value/3);
    client.setValue('channel_VT_R8', value/3);
    client.setValue('channel_VT_DATE', new Date());
    client.setValue('channel_VT_BOOL', !!(value & 1));
    client.setValue('channel_VT_STRING', 'value' + value);
}, 2000);

