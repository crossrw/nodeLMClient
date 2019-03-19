/* eslint-disable no-console */
/*jshint esversion: 6 */

var lm = require('./lmclient.js');

// создаем экземпляр класса
var client = new lm.LMClient({
        host:       '127.0.0.1',                // адрес сервера
        port:       3000,                       // порт сервера
        login:      'login',                    // логин
        password:   'password',                 // пароль
        reconnect:  true,                       // автоматически переподключаться при ошибках и разрывах связи
        opros:      true,                       // тип учетной записи "опрос"
        client:     false                       // тип учетной записи "клиент"
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
client.on('data', function(ch){
    console.log('receive channel "' + ch.name + '" value="' + ch.value + '"');
    // подтверждаем прием
    client.setValue(ch.name, ch.value);
});
client.on('error', function(err){
    console.log(err.message);
});

// создаем каналы разных типов
client.addChannel('channel_VT_I1', lm.VT_I1, false, {
    units: 'амперы',
    comment: 'тип VT_UI1',
    enum: ['красный', 'желтый', 'зеленый']
});
client.addChannel('channel_VT_R4', lm.VT_R4, false, {
    units: 'омы',
    comment: 'тип VT_R4',
    bounds: [0, 1000]
});
client.addChannel('channel_VT_R8', lm.VT_R8, false, {
    units: 'вольты',
    comment: 'тип VT_R8',
    bounds: [0, 1000],
    percentDeadband: 1
});
client.addChannel('channel_aVT_I4', lm.VT_I4 + lm.VT_ARRAY, false, {
    units: 'кг',
    comment: 'массив VT_I4'
});
// проверка активизации канала
client.addChannel('channel_active', lm.VT_I1, false);
client.setValue('channel_active', 10);

// подключаемся к серверу
client.connect();

// периодически формируем данные
var value = 0;
var value2 = 0;
setInterval(function(){
    if(value++ >= 120) value = 0;
    value2 += 0.1;
    // простые значения
    client.setValue('channel_VT_I1', value);
    client.setValue('channel_VT_R4', value2);
    client.setValue('channel_VT_R8', value2);
    // массивы
    var arr = [value, value+1, value+2, value+3, value+4];
    client.setValue('channel_aVT_I4', arr);
}, 500);
