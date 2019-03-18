# Клиент SCADA системы LanMon для Node.js

## Краткое описание

Библиотека предназначена для организации подключения к серверу SCADA системы LanMon.

Более подробное описание SCADA системы LanMon можно получить по адресу http://www.mnppsaturn.ru/?topic_id=3&good_id=184.

Основные функции библиотеки:

* подключение к серверу системы
* автоматические повторные подключения при обрыве соединения или ошибках
* создание каналов со всеми поддерживаемыми сервером типами данных (включая массивы)
* поддержка основных типов атрибутов каналов
* поддержка установки значения свойства **quality**
* поддержка получения команд управления

Библиотека поддерживает работу с сервером LanMon начиная с его версии 4.12.

## Пример использования

```javascript
/*jshint esversion: 6 */

var lm = require('./lm.js');

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

// обработка событий
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
// подключаемся к серверу
client.connect();

// периодически формируем данные
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

```

Подробнее смотри в test.js.

## Существующие ограничения

* Поддержка только каналов второго типа
* Реализован только режим подключения "опрос" (пока)

## Обратная связь

Замечания и предложения отправляйте на адрес lanmon@mnppsaturn.ru или создавайте **Issues/Pull requests**.
