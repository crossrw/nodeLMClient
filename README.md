# Клиент SCADA системы LanMon для Node.js

## Назначение

Библиотека предназначена для организации подключения к серверу SCADA системы LanMon из программ написанных на языке js.

Более подробное описание SCADA системы LanMon можно получить на [сайте МНПП "Сатурн"](https://www.mnppsaturn.ru/?topic_id=3&good_id=184).

Основные функции библиотеки:

* подключение к серверу системы
* автоматические повторные подключения при обрыве соединения или ошибках
* автоматическая периодическая проверка канала связи с сервером
* создание каналов со всеми поддерживаемыми сервером типами данных (включая массивы)
* поддержка основных типов атрибутов каналов
* поддержка установки значения свойства **quality**
* фильтрация значений каналов с типом ```VT_R4``` и ```VT_R8``` с использованием атрибута ```ATTR_PERCENTDB```
* поддержка получения команд управления
* автоматическое преобразование кодировки значений каналов типа ```VT_STRING``` из кодировки CP1251 в UTF-8 и обратно
* преообразование типа данных ```VT_DATE``` в объект js ```Date()``` и обратно с использованием информации о часовом поясе сервера

Библиотека поддерживает работу с сервером LanMon начиная с его версии 4.12.

Библиотека не содержит внешних зависимостей.

## Classes

<dl>
<dt><a href="#LMClient">LMClient</a></dt>
<dd><p>Класс клиента сервера LM</p>
</dd>
</dl>

## Typedefs

<dl>
<dt><a href="#ConnectOptions">ConnectOptions</a> : <code>Object</code></dt>
<dd><p>Параметры подключения к серверу</p>
</dd>
<dt><a href="#ChannelOptions">ChannelOptions</a> : <code>Object</code></dt>
<dd><p>Параметры задаваемые при создании канала</p>
</dd>
</dl>

<a name="LMClient"></a>

## LMClient
Класс клиента сервера LM

**Kind**: global class  
**Emits**: [<code>connecting</code>](#LMClient+event_connecting), [<code>connect</code>](#LMClient+event_connect), [<code>disconnect</code>](#LMClient+event_disconnect), [<code>loggedIn</code>](#LMClient+event_loggedIn), [<code>checkConnection</code>](#LMClient+event_checkConnection), [<code>timeSynchronize</code>](#LMClient+event_timeSynchronize), [<code>control</code>](#LMClient+event_control), [<code>error</code>](#LMClient+event_error)  

* [LMClient](#LMClient)
    * [new LMClient(options)](#new_LMClient_new)
    * [.loggedIn](#LMClient+loggedIn) : <code>boolean</code>
    * [.connected](#LMClient+connected) : <code>boolean</code>
    * [.checkConnectInterval](#LMClient+checkConnectInterval) : <code>number</code>
    * [.connect()](#LMClient+connect)
    * [.disconnect()](#LMClient+disconnect)
    * [.addChannel(name, type, writeEnable, options)](#LMClient+addChannel) ⇒ <code>boolean</code>
    * [.setValue(name, value)](#LMClient+setValue) ⇒ <code>boolean</code>
    * [.setQuality(name, quality)](#LMClient+setQuality) ⇒ <code>boolean</code>
    * ["connecting"](#LMClient+event_connecting)
    * ["connect"](#LMClient+event_connect)
    * ["disconnect"](#LMClient+event_disconnect)
    * ["loggedIn"](#LMClient+event_loggedIn)
    * ["checkConnection"](#LMClient+event_checkConnection)
    * ["timeSynchronize"](#LMClient+event_timeSynchronize)
    * ["control"](#LMClient+event_control)
    * ["error"](#LMClient+event_error)

<a name="new_LMClient_new"></a>

### new LMClient(options)
Конструктор класса.Создает новый экземпляр класса подключения к серверу. В параметрах конструктора указываютсянастройки используемые при подключении к серверу.


| Param | Type | Description |
| --- | --- | --- |
| options | [<code>ConnectOptions</code>](#ConnectOptions) | Параметры подключения к серверу |

<a name="LMClient+loggedIn"></a>

### lmClient.loggedIn : <code>boolean</code>
Текущее состояние регистрации на сервере.Значение true соответствует тому, что клиент успешно подключен и зарегестрирован на сервере.

**Kind**: instance property of [<code>LMClient</code>](#LMClient)  
**Access**: public  
<a name="LMClient+connected"></a>

### lmClient.connected : <code>boolean</code>
Текущее состояние подключения к серверу.Значение true соответствует тому, что клиент установил соединение с сервером. Состояние регистрации можнопроконтролировать через свойство loggedIn.

**Kind**: instance property of [<code>LMClient</code>](#LMClient)  
**Access**: public  
<a name="LMClient+checkConnectInterval"></a>

### lmClient.checkConnectInterval : <code>number</code>
Интервал проверки связи с сервером в мс. Значение по умолчанию 480000 мс (8 минут).

**Kind**: instance property of [<code>LMClient</code>](#LMClient)  
**Access**: public  
<a name="LMClient+connect"></a>

### lmClient.connect()
Подключение и регистрация на сервере LM.Метод начинает процедуру подключения и регистрации к серверу системы LanMon. При подключении используютсяпараметры указанные при создании класса. Если в параметрах указано значение reconnect: true, то соединениебудет автоматически восстанавливаться в случаях обрыва связи или ошибок.

**Kind**: instance method of [<code>LMClient</code>](#LMClient)  
**Access**: public  
<a name="LMClient+disconnect"></a>

### lmClient.disconnect()
Отключиться от сервера.Метод разрывает соединение с сервером если оно было ранее установлено вызовом метода connect().

**Kind**: instance method of [<code>LMClient</code>](#LMClient)  
**Access**: public  
<a name="LMClient+addChannel"></a>

### lmClient.addChannel(name, type, writeEnable, options) ⇒ <code>boolean</code>
Добавление нового канала.Метод добавляет новый канал для регистрации и передачи данных на сервер.Метод возвращает значение false если канал с указанным именем уже существует илиесли указан некорректный тип данных.

**Kind**: instance method of [<code>LMClient</code>](#LMClient)  
**Access**: public  

| Param | Type | Description |
| --- | --- | --- |
| name | <code>string</code> | Имя канала |
| type | <code>number</code> | Тип канала |
| writeEnable | <code>boolean</code> | Разрешение записи значений |
| options | [<code>ChannelOptions</code>](#ChannelOptions) | Параметры канала |

<a name="LMClient+setValue"></a>

### lmClient.setValue(name, value) ⇒ <code>boolean</code>
Установка значения канала.Метод устанавливает значение для ранее созданного канала. Тип параметра value должен соответствовать типуканала указанному при его создании. Установленное значение канала будет передано на сервер. Кроме того, методустанавливает свойство канала quality (качество) в значение stOk.Метод возвращает значение false если канал с указанным именем не найден.

**Kind**: instance method of [<code>LMClient</code>](#LMClient)  
**Access**: public  

| Param | Type | Description |
| --- | --- | --- |
| name | <code>string</code> | Имя канала |
| value | <code>\*</code> | Новое значение канала |

<a name="LMClient+setQuality"></a>

### lmClient.setQuality(name, quality) ⇒ <code>boolean</code>
Установка качества канала.

**Kind**: instance method of [<code>LMClient</code>](#LMClient)  
**Access**: public  

| Param | Type | Description |
| --- | --- | --- |
| name | <code>string</code> | Имя канала |
| quality | <code>number</code> | Новое значение качества |

<a name="LMClient+event_connecting"></a>

### "connecting"
Событие формируется при начале подключения к серверу.

**Kind**: event emitted by [<code>LMClient</code>](#LMClient)  
**Properties**

| Name | Type | Description |
| --- | --- | --- |
| host | <code>string</code> | адрес сервера к которому происходит подключение |
| port | <code>number</code> | номер TCP-порта сервера |

<a name="LMClient+event_connect"></a>

### "connect"
Событие формируется когда соединение с сервером установлено.

**Kind**: event emitted by [<code>LMClient</code>](#LMClient)  
<a name="LMClient+event_disconnect"></a>

### "disconnect"
Событие формируется когда соединение с сервером разорвано.

**Kind**: event emitted by [<code>LMClient</code>](#LMClient)  
**Properties**

| Name | Type | Description |
| --- | --- | --- |
| err | <code>boolean</code> | признак того, что соединение разорвано в результате ошибки |

<a name="LMClient+event_loggedIn"></a>

### "loggedIn"
Событие формируется когда клиент успешно зарегистрировался на сервере.

**Kind**: event emitted by [<code>LMClient</code>](#LMClient)  
**Properties**

| Name | Type | Description |
| --- | --- | --- |
| serverId | <code>number</code> | идентификатор клиента на сервере |
| version | <code>string</code> | версия сервера в формате "hi.lo" |

<a name="LMClient+event_checkConnection"></a>

### "checkConnection"
Событие формируется при успешном выполнении проверки связи с сервером.

**Kind**: event emitted by [<code>LMClient</code>](#LMClient)  
**Properties**

| Name | Type | Description |
| --- | --- | --- |
| delay | <code>number</code> | задержка в миллисекундах при ответе сервера на команду проверки связи |

<a name="LMClient+event_timeSynchronize"></a>

### "timeSynchronize"
Событие формируется при получении от сервера команды синхронизации времени.

**Kind**: event emitted by [<code>LMClient</code>](#LMClient)  
**Properties**

| Name | Type | Description |
| --- | --- | --- |
| time | <code>Date</code> | значение времени полученное от сервера |

<a name="LMClient+event_control"></a>

### "control"
Событие формируется при получении от сервера команды записи в канал управления. Для подтверждения получения и обработки этого событиянеобходимо установить полученное значение канала вызовом setValue(name, value).

**Kind**: event emitted by [<code>LMClient</code>](#LMClient)  
**Properties**

| Name | Type | Description |
| --- | --- | --- |
| control | <code>Object</code> | полученная команда управления каналом |
| control.name | <code>string</code> | имя канала для которого пришла команда управления |
| control.value | <code>\*</code> | новое значение канала |
| control.dt | <code>Date</code> | метка времени |

**Example**  
```js
client.on('control', function(control){  console.log('receive channel "' + control.name + '" value="' + control.value + '"');  client.setValue(control.name, control.value); // подтверждаем прием});
```
<a name="LMClient+event_error"></a>

### "error"
Событие формируется при возникновении ошибки. Программа должна содержать обработчик этого события.

**Kind**: event emitted by [<code>LMClient</code>](#LMClient)  
**Properties**

| Name | Type | Description |
| --- | --- | --- |
| error | <code>Error</code> | ошибка |

<a name="ConnectOptions"></a>

## ConnectOptions : <code>Object</code>
Параметры подключения к серверу

**Kind**: global typedef  
**Properties**

| Name | Type | Description |
| --- | --- | --- |
| host | <code>string</code> | адрес сервера |
| port | <code>number</code> | номер TCP порта |
| login | <code>string</code> | логин |
| password | <code>string</code> | пароль |
| reconnect | <code>boolean</code> | автоматически переподключаться при ошибках и разрывах связи |
| opros | <code>boolean</code> | тип учетной записи "опрос" |
| client | <code>boolean</code> | тип учетной записи "клиент" (пока не поддерживается) |

<a name="ChannelOptions"></a>

## ChannelOptions : <code>Object</code>
Параметры задаваемые при создании канала

**Kind**: global typedef  
**Properties**

| Name | Type | Description |
| --- | --- | --- |
| [units] | <code>string</code> | единицы измерения |
| [comment] | <code>string</code> | текстовое описание |
| [signification] | <code>number</code> | назначение |
| [saveValue] | <code>boolean</code> | сохранять значение на сервере при отключении опросчика |
| [enum] | <code>Array.&lt;string&gt;</code> | массив строк, соответствующих значению канала |
| [bounds] | <code>Array.&lt;number&gt;</code> | массив из двух элементов [нижняя граница, верхняя граница] |
| [percentDeadband] | <code>number</code> | величина "мертвой зоны" изменения значения канала в процентах |


## Примеры использования

### Пример подключения в режиме "опрос"

```javascript
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

```

Подробнее смотри в test.js.

## Существующие ограничения

* Поддержка только каналов второго типа
* Пока реализован только режим подключения "опрос"

## Обратная связь

Замечания и предложения отправляйте на адрес lanmon@mnppsaturn.ru или непосредственно в **Issues/Pull requests**.

* * *
&copy; 2019 ООО "МНПП Сатурн"
