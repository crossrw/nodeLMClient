/* eslint-disable no-console */
/*jshint esversion: 6 */

var lm = require('./lmclient.js');

const   hostIP = '192.168.1.92';

function createOprosClient(oprosIndex) {
    //
    // создаем экземпляр класса
    var client = new lm.LMClient({
            host:       hostIP,                     // адрес сервера
            port:       3000,                       // порт сервера
            login:      oprosIndex.toString(),      // логин
            password:   '',                         // пароль
            reconnect:  true,                       // автоматически переподключаться при ошибках и разрывах связи
            opros:      true,                       // тип учетной записи "опрос"
            client:     false,                      // тип учетной записи "клиент"
            hashAuth:   true
    });
    //
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
    client.on('delete', function(name, attrId){
        if(typeof attrId === 'undefined') {
            console.log('channel "' + name + '" was removed');
        } else {
            console.log('attribute ' + attrId + ' was removed from channel "' + name + '" deleted');
        }
    });
    client.on('error', function(err){
        console.error(err.message);
    });
    // создаем каналы разных типов
    client.add(oprosIndex.toString() + '_channel_VT_R8_1', lm.VT_R8, false, {
        units: 'вольты',
        comment: 'тип VT_R8'
    });
    client.add(oprosIndex.toString() + '_channel_VT_R8_2', lm.VT_R8, false, {
        units: 'вольты',
        comment: 'тип VT_R8'
    });
    client.add(oprosIndex.toString() + '_channel_VT_R8_3', lm.VT_R8, false, {
        units: 'вольты',
        comment: 'тип VT_R8'
    });
    client.add(oprosIndex.toString() + '_channel_VT_R8_4', lm.VT_R8, false, {
        units: 'вольты',
        comment: 'тип VT_R8'
    });
    client.add(oprosIndex.toString() + 'channel_aVT_I4', lm.VT_I4 + lm.VT_ARRAY, false, {
        units: 'кг',
        comment: 'массив VT_I4'
    });
    client.add(oprosIndex.toString() + 'channel_aVT_R8', lm.VT_R8 + lm.VT_ARRAY, false, {
        units: 'кг',
        comment: 'массив VT_R8'
    });
    client.add(oprosIndex.toString() + 'channel_VT_STRING', lm.VT_STRING, false, {
        units: '',
        comment: 'строка'
    });
    client.add(oprosIndex.toString() + 'channel_aVT_STRING', lm.VT_STRING + lm.VT_ARRAY, false, {
        units: '',
        comment: 'массив строк'
    });

    //
    // подключаемся к серверу
    client.connect();
    //
    // периодически формируем данные
    var value = 0;
    var value2 = 0;
    setInterval(function(){
        value++;
        if(value >= 120) {
            value = 0;
        }
        value2 += 0.1;
        //
        // простые значения
        client.setValue(oprosIndex.toString() + '_channel_VT_R8_1', value);
        client.setValue(oprosIndex.toString() + '_channel_VT_R8_2', value);
        client.setValue(oprosIndex.toString() + '_channel_VT_R8_3', value);
        client.setValue(oprosIndex.toString() + '_channel_VT_R8_4', value);

        var arr = [value, value+1, value+2, value+3, value+4];
        client.setValue(oprosIndex.toString() + 'channel_aVT_I4', arr);
        client.setValue(oprosIndex.toString() + 'channel_aVT_R8', arr);
        client.setValue(oprosIndex.toString() + 'channel_VT_STRING', 'Строка ' + value);
        var arr = ['Красный ' + value, 'Жёлтый ' + value+1, 'Зелёный ' + value+2, 'Синий ' + value+3, 'Коричневый ' + value+4];
        client.setValue(oprosIndex.toString() + 'channel_aVT_STRING', arr);
    }, 1000);
}

for(var idx = 2500001; idx <= 2500100; idx++) createOprosClient(idx);
