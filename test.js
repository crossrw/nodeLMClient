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
client.addChannel('channel_VT_I1', lm.VT_I1, 'вольты', 'тип VT_I1', 0);
client.addChannel('channel_VT_UI1', lm.VT_UI1, 'амперы', 'тип VT_UI1', 0);
client.addChannel('channel_VT_I2', lm.VT_I2, 'секунды', 'тип VT_I2', 0);
client.addChannel('channel_VT_UI2', lm.VT_UI2, 'килограммы', 'тип VT_UI2', 0);
client.addChannel('channel_VT_I4', lm.VT_I4, 'миллиметры', 'тип VT_I4', 0);
client.addChannel('channel_VT_UI4', lm.VT_UI4, 'паскали', 'тип VT_UI4', 0);
client.addChannel('channel_VT_R4', lm.VT_R4, 'омы', 'тип VT_R4', 0);
client.addChannel('channel_VT_R8', lm.VT_R8, 'мешки', 'тип VT_R8', 0);
client.addChannel('channel_VT_DATE', lm.VT_DATE, 'дата и время', 'тип VT_DATE', 0);
client.addChannel('channel_VT_BOOL', lm.VT_BOOL, 'хорошо или плохо', 'тип VT_BOOL', 0);
client.addChannel('channel_VT_STRING', lm.VT_STRING, 'это строка', 'тип VT_STRING', 0);
// создаем каналы массив всех типов
client.addChannel('channel_aVT_I1', lm.VT_ARRAY + lm.VT_I1, 'вольты', 'тип массив VT_I1', 0);
client.addChannel('channel_aVT_UI1', lm.VT_ARRAY + lm.VT_UI1, 'амперы', 'тип массив VT_UI1', 0);
client.addChannel('channel_aVT_I2', lm.VT_ARRAY + lm.VT_I2, 'секунды', 'тип массив VT_I2', 0);
client.addChannel('channel_aVT_UI2', lm.VT_ARRAY + lm.VT_UI2, 'килограммы', 'тип массив VT_UI2', 0);
client.addChannel('channel_aVT_I4', lm.VT_ARRAY + lm.VT_I4, 'миллиметры', 'тип массив VT_I4', 0);
client.addChannel('channel_aVT_UI4', lm.VT_ARRAY + lm.VT_UI4, 'паскали', 'тип массив VT_UI4', 0);
client.addChannel('channel_aVT_R4', lm.VT_ARRAY + lm.VT_R4, 'омы', 'тип массив VT_R4', 0);
client.addChannel('channel_aVT_R8', lm.VT_ARRAY + lm.VT_R8, 'мешки', 'тип массив VT_R8', 0);
client.addChannel('channel_aVT_DATE', lm.VT_ARRAY + lm.VT_DATE, 'дата и время', 'тип массив VT_DATE', 0);
client.addChannel('channel_aVT_BOOL', lm.VT_ARRAY + lm.VT_BOOL, 'хорошо или плохо', 'тип массив VT_BOOL', 0);
client.addChannel('channel_aVT_STRING', lm.VT_ARRAY + lm.VT_STRING, 'это строка', 'тип массив VT_STRING', 0);
// создаем каналы всех типов с возможностью управления
client.addChannel('channelw_VT_I1', lm.VT_I1, 'вольты', 'тип VT_I1', 0, true);
client.addChannel('channelw_VT_UI1', lm.VT_UI1, 'амперы', 'тип VT_UI1', 0, true);
client.addChannel('channelw_VT_I2', lm.VT_I2, 'секунды', 'тип VT_I2', 0, true);
client.addChannel('channelw_VT_UI2', lm.VT_UI2, 'килограммы', 'тип VT_UI2', 0, true);
client.addChannel('channelw_VT_I4', lm.VT_I4, 'миллиметры', 'тип VT_I4', 0, true);
client.addChannel('channelw_VT_UI4', lm.VT_UI4, 'паскали', 'тип VT_UI4', 0, true);
client.addChannel('channelw_VT_R4', lm.VT_R4, 'омы', 'тип VT_R4', 0, true);
client.addChannel('channelw_VT_R8', lm.VT_R8, 'мешки', 'тип VT_R8', 0, true);
client.addChannel('channelw_VT_DATE', lm.VT_DATE, 'дата и время', 'тип VT_DATE', 0, true);
client.addChannel('channelw_VT_BOOL', lm.VT_BOOL, 'хорошо или плохо', 'тип VT_BOOL', 0, true);
client.addChannel('channelw_VT_STRING', lm.VT_STRING, 'это строка', 'тип VT_STRING', 0, true);
// создаем каналы массив всех типов с возможностью управления
client.addChannel('channelw_aVT_I1', lm.VT_ARRAY + lm.VT_I1, 'вольты', 'тип массив VT_I1', 0, true);
client.addChannel('channelw_aVT_UI1', lm.VT_ARRAY + lm.VT_UI1, 'амперы', 'тип массив VT_UI1', 0, true);
client.addChannel('channelw_aVT_I2', lm.VT_ARRAY + lm.VT_I2, 'секунды', 'тип массив VT_I2', 0, true);
client.addChannel('channelw_aVT_UI2', lm.VT_ARRAY + lm.VT_UI2, 'килограммы', 'тип массив VT_UI2', 0, true);
client.addChannel('channelw_aVT_I4', lm.VT_ARRAY + lm.VT_I4, 'миллиметры', 'тип массив VT_I4', 0, true);
client.addChannel('channelw_aVT_UI4', lm.VT_ARRAY + lm.VT_UI4, 'паскали', 'тип массив VT_UI4', 0, true);
client.addChannel('channelw_aVT_R4', lm.VT_ARRAY + lm.VT_R4, 'омы', 'тип массив VT_R4', 0, true);
client.addChannel('channelw_aVT_R8', lm.VT_ARRAY + lm.VT_R8, 'мешки', 'тип массив VT_R8', 0, true);
client.addChannel('channelw_aVT_DATE', lm.VT_ARRAY + lm.VT_DATE, 'дата и время', 'тип массив VT_DATE', 0, true);
client.addChannel('channelw_aVT_BOOL', lm.VT_ARRAY + lm.VT_BOOL, 'хорошо или плохо', 'тип массив VT_BOOL', 0, true);
client.addChannel('channelw_aVT_STRING', lm.VT_ARRAY + lm.VT_STRING, 'это строка', 'тип массив VT_STRING', 0, true);
// проверка активизации канала
client.addChannel('channel_active', lm.VT_I1, 'вольты', 'тип VT_I1', 0);
client.setValue('channel_active', 10);

// подключаемся к серверу
client.connect();

// периодически формируем данные
var value = 0;
setInterval(function(){
    if(value++ >= 120) value = 0;
    // простые значения
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
    // массивы
    var arr = [value, value+1, value+2, value+3, value+4];
    client.setValue('channel_aVT_I1', arr);
    client.setValue('channel_aVT_UI1', arr);
    client.setValue('channel_aVT_I2', arr);
    client.setValue('channel_aVT_UI2', arr);
    client.setValue('channel_aVT_I4', arr);
    client.setValue('channel_aVT_UI4', arr);
    client.setValue('channel_aVT_R4', arr);
    client.setValue('channel_aVT_R8', arr);
    client.setValue('channel_aVT_DATE', [new Date(), new Date(), new Date(), new Date(), new Date()]);
    client.setValue('channel_aVT_BOOL', [true, true, false, false, false]);
    client.setValue('channel_aVT_STRING', ['str1', 'str2', 'str3']);
}, 2000);

