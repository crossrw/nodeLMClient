![node](https://img.shields.io/node/v/lmclient.svg?style=flat-square)
![npm](https://img.shields.io/npm/v/lmclient.svg?style=flat-square)
![npm module downloads](http://img.shields.io/npm/dt/lmclient.svg?style=flat-square)
![license](https://img.shields.io/npm/l/lmclient.svg?style=flat-square)

# Клиент SCADA системы LanMon для Node.js

## Назначение

Библиотека предназначена для организации подключения к серверу SCADA системы LanMon из программ написанных на языке js.

Для выполнения необходим Node.js версии 6.17.0 или более новый.

Более подробное описание SCADA системы LanMon можно получить на [сайте МНПП "Сатурн"](https://www.mnppsaturn.ru/?topic_id=3&good_id=184).

Основные функции библиотеки:

* подключение к серверу системы
* поддержка типов учетной записи "опрос" и "клиент"
* автоматическое восстанвление подключения при обрывах или ошибках
* автоматическая проверка канала связи с сервером
* создание каналов со всеми поддерживаемыми сервером типами данных, включая массивы
* поддержка всех типов атрибутов каналов
* поддержка установки значения свойства **quality**
* фильтрация значений каналов с типом ```VT_R4``` и ```VT_R8``` с использованием атрибута ```ATTR_PERCENTDB```
* поддержка передачи и получения команд управления
* автоматическое преобразование кодировки значений каналов типа ```VT_STRING``` из кодировки CP1251 в UTF-8 и обратно
* преообразование типа данных ```VT_DATE``` в объект js ```Date()``` и обратно с использованием информации о часовом поясе сервера

Библиотека поддерживает работу с сервером LanMon начиная с его версии 4.12.

Библиотека не содержит внешних зависимостей.

## Установка

```
$ npm install lmclient
```

## Classes

<dl>
<dt><a href="#LMClient">LMClient</a></dt>
<dd><p>Класс клиента сервера LM</p>
</dd>
</dl>

## Typedefs

<dl>
<dt><a href="#Channel2">Channel2</a> : <code>Object</code></dt>
<dd><p>Канал сервера</p>
</dd>
<dt><a href="#Attribute">Attribute</a> : <code>Object</code></dt>
<dd><p>Атрибут канала</p>
</dd>
<dt><a href="#Control">Control</a> : <code>Object</code></dt>
<dd><p>Структура данных управления каналом</p>
</dd>
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
**Emits**: [<code>connecting</code>](#LMClient+event_connecting), [<code>connect</code>](#LMClient+event_connect), [<code>disconnect</code>](#LMClient+event_disconnect), [<code>loggedIn</code>](#LMClient+event_loggedIn), [<code>checkConnection</code>](#LMClient+event_checkConnection), [<code>timeSynchronize</code>](#LMClient+event_timeSynchronize), [<code>control</code>](#LMClient+event_control), [<code>channel</code>](#LMClient+event_channel), [<code>add</code>](#LMClient+event_add), [<code>change</code>](#LMClient+event_change), [<code>delete</code>](#LMClient+event_delete), [<code>count</code>](#LMClient+event_count), [<code>error</code>](#LMClient+event_error)  

* [LMClient](#LMClient)
    * [new LMClient(options)](#new_LMClient_new)
    * [.loggedIn](#LMClient+loggedIn) : <code>boolean</code>
    * [.connected](#LMClient+connected) : <code>boolean</code>
    * [.checkConnectInterval](#LMClient+checkConnectInterval) : <code>number</code>
    * [.channelsMap](#LMClient+channelsMap) : <code>Map.&lt;string, Channel2&gt;</code>
    * [.connect()](#LMClient+connect)
    * [.disconnect()](#LMClient+disconnect)
    * [.add(name, type, writeEnable, options)](#LMClient+add) ⇒ <code>boolean</code>
    * [.delete(name, [attrId])](#LMClient+delete) ⇒ <code>boolean</code>
    * [.setValue(name, value)](#LMClient+setValue) ⇒ <code>boolean</code>
    * [.setQuality(name, quality)](#LMClient+setQuality) ⇒ <code>boolean</code>
    * [.sendControl(name, value)](#LMClient+sendControl) ⇒ <code>boolean</code>
    * ["connecting"](#LMClient+event_connecting)
    * ["connect"](#LMClient+event_connect)
    * ["disconnect"](#LMClient+event_disconnect)
    * ["loggedIn"](#LMClient+event_loggedIn)
    * ["checkConnection"](#LMClient+event_checkConnection)
    * ["timeSynchronize"](#LMClient+event_timeSynchronize)
    * ["control"](#LMClient+event_control)
    * ["channel"](#LMClient+event_channel)
    * ["add"](#LMClient+event_add)
    * ["change"](#LMClient+event_change)
    * ["delete"](#LMClient+event_delete)
    * ["count"](#LMClient+event_count)
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
**Read only**: true  
<a name="LMClient+connected"></a>

### lmClient.connected : <code>boolean</code>
Текущее состояние подключения к серверу.Значение true соответствует тому, что клиент установил соединение с сервером. Состояние регистрации можнопроконтролировать через свойство loggedIn.

**Kind**: instance property of [<code>LMClient</code>](#LMClient)  
**Access**: public  
**Read only**: true  
<a name="LMClient+checkConnectInterval"></a>

### lmClient.checkConnectInterval : <code>number</code>
Интервал проверки связи с сервером в мс. Значение по умолчанию 480000 мс (8 минут). Не рекомендуется устанавливать значение более 600000 мс (10 минут).

**Kind**: instance property of [<code>LMClient</code>](#LMClient)  
**Access**: public  
<a name="LMClient+channelsMap"></a>

### lmClient.channelsMap : <code>Map.&lt;string, Channel2&gt;</code>
Список каналов. Элементы списка является экземплярами класса [Channel2](#Channel2), ключом в списке являются имена каналов.Вы не должны напрямую изменять элементы списка! Для изменения используйте вызовы методов класса.

**Kind**: instance property of [<code>LMClient</code>](#LMClient)  
**Access**: public  
**Read only**: true  
**Example**  
```js
// получение канала по имениchannel = client.channelsMap.get('my_channel_name');// проверка на наличие каналаif(client.channelsMap.has('my_channel_name')) {...}; else {...};// перебор всех каналовclient.channelsMap.forEach(channel => {...});// получение количества каналовlet count = client.channelsMap.size;
```
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
<a name="LMClient+add"></a>

### lmClient.add(name, type, writeEnable, options) ⇒ <code>boolean</code>
Добавление нового канала.Метод добавляет новый канал для регистрации и передачи данных на сервер.Метод используется при подключении с типом учетной записи "опрос".Метод может быть вызван при любом состоянии подключения к сервреру.Метод возвращает значение false если канал с указанным именем уже существует илиесли указан некорректный тип данных.

**Kind**: instance method of [<code>LMClient</code>](#LMClient)  
**Access**: public  

| Param | Type | Description |
| --- | --- | --- |
| name | <code>string</code> | Имя канала |
| type | <code>number</code> | Тип канала |
| writeEnable | <code>boolean</code> | Разрешение записи значений |
| options | [<code>ChannelOptions</code>](#ChannelOptions) | Параметры канала |

<a name="LMClient+delete"></a>

### lmClient.delete(name, [attrId]) ⇒ <code>boolean</code>
Удаление канала или атрибута канала.Метод выполняет передачу на сервер запроса на удаление канала или отдельного атрибута канала.При вызове метода клиент должен быть подключен и зарегистрирован на сервере.При наличии соотвествующих прав доступа клиента, сервер выполняет удаление соответствующей сущности и рассылет уведомления всемподключенным к нему клиентам, в том числе и вам. При удачном удалении через некоторое время после вызова метода клиент получит уведомление ["delete"](#LMClient+event_delete).Метод используется при подключении с типом учетной записи "клиент".

**Kind**: instance method of [<code>LMClient</code>](#LMClient)  
**Access**: public  

| Param | Type | Description |
| --- | --- | --- |
| name | <code>string</code> | имя канала |
| [attrId] | <code>number</code> | идентификатор атрибута |

**Example**  
```js
// удаление атрибута с идентификатором 100 к канала 'myChannel'client.delete('myChannel', 100);// удпление канала 'myChannel'client.delete('myChannel');
```
<a name="LMClient+setValue"></a>

### lmClient.setValue(name, value) ⇒ <code>boolean</code>
Установка значения канала.Метод устанавливает значение для ранее созданного канала. Тип и значение параметра value должен соответствовать типуканала указанному при его создании. Установленное значение канала будет передано на сервер. Кроме того, методустанавливает свойство канала quality (качество) в значение stOk. Метод используется при подключении с типом учетной записи "опрос". Метод может быть вызван при любом состоянии подключения к сервреру.Метод возвращает значение false если канал с указанным именем не найден или указан некорректный тип учетной записи.

**Kind**: instance method of [<code>LMClient</code>](#LMClient)  
**Access**: public  

| Param | Type | Description |
| --- | --- | --- |
| name | <code>string</code> | Имя канала |
| value | <code>\*</code> | Новое значение канала |

<a name="LMClient+setQuality"></a>

### lmClient.setQuality(name, quality) ⇒ <code>boolean</code>
Установка качества канала.Метод устанавливает значение свойства качество для ранее созданного канала. Метод используется при подключении с типом учетной записи "опрос". Значение качества канала stOk автоматически устанавливается при установкезначения канала методом setValue(name, value) и отдельно устанавливать его не требуется.Метод может быть вызван при любом состоянии подключения к сервреру.Метод возвращает значение false если канал с указанным именем не найден, указано некорректное значение качества или тип учетной записи.

**Kind**: instance method of [<code>LMClient</code>](#LMClient)  
**Access**: public  

| Param | Type | Description |
| --- | --- | --- |
| name | <code>string</code> | Имя канала |
| quality | <code>number</code> | Новое значение качества |

<a name="LMClient+sendControl"></a>

### lmClient.sendControl(name, value) ⇒ <code>boolean</code>
Формирование команды управления каналом. Метод используется при подключении с типом учетной записи "клиент".Для выполнения управления каналом должны выполняться следующие условия: клиент должен быть подключен и зарегистрирован на сервере,канал должен быть существующим, канал должен быть создан другим клиентом (опросчиком), у канала должны быть установлены признаки активности и разрешения записи значений, тип значения value должен быть совместим с типом канала.При выполнении перечисленных выше условий метод возвращает true, иначе - false.Метод не устанавливает значение канала, полученную команду управления сервер пересылает клиенту типа "опрос", который сформировал этот канал.

**Kind**: instance method of [<code>LMClient</code>](#LMClient)  
**Todo**

- [ ] проверить работу


| Param | Type | Description |
| --- | --- | --- |
| name | <code>string</code> | Имя канала |
| value | <code>\*</code> | Значение команды управления |

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
| control | [<code>Control</code>](#Control) | полученная команда управления каналом |

**Example**  
```js
client.on('control', function(control){  console.log('receive control "' + control.name + '" value="' + control.value + '"');  client.setValue(control.name, control.value); // подтверждаем прием});
```
<a name="LMClient+event_channel"></a>

### "channel"
Событие формируется при получении клиентом от сервера нового значения канала. При отключении от сервера событие формируется для всех ранее полученныхот него каналов с установленным свойством quality в значение stOff.Событие используется при работе в режиме учетной записи "клиент".

**Kind**: event emitted by [<code>LMClient</code>](#LMClient)  
**Properties**

| Name | Type | Description |
| --- | --- | --- |
| channel | [<code>Channel2</code>](#Channel2) | объект состояние канала |

<a name="LMClient+event_add"></a>

### "add"
Уведомление о добавлении нового канала.Уведомление формируется только для учетных записей типа "клиент" в случае добавления нового канала другим клиентом сервера.Значение и метка времени канала сразу после его добавления не определено.

**Kind**: event emitted by [<code>LMClient</code>](#LMClient)  
**Properties**

| Name | Type | Description |
| --- | --- | --- |
| channel | [<code>Channel2</code>](#Channel2) | новый канал |

<a name="LMClient+event_change"></a>

### "change"
Уведомление о изменении настроек (свойств или атрибутов) канала.Измениться могут перечень и значения атрибутов, значения свойств active, writeEnable и saveServer.Изменение значения самого канала не приводит к появлению данного уведомления. Уведомление формируетсятолько для учетных записей типа "клиент".

**Kind**: event emitted by [<code>LMClient</code>](#LMClient)  
**Properties**

| Name | Type | Description |
| --- | --- | --- |
| channel | [<code>Channel2</code>](#Channel2) | измененный канал |

<a name="LMClient+event_delete"></a>

### "delete"
Уведомление об удалении канала с именем "name" или его атрибута с идентификатором "attrId".Если аргумент "attrId" не определен, то событие сообщает об удалении канала "name". В противном случае событие сообщает об удалении атрибута "attrId".Уведомление формируется только для учетных записей типа "клиент".

**Kind**: event emitted by [<code>LMClient</code>](#LMClient)  
**Properties**

| Name | Type | Description |
| --- | --- | --- |
| name | <code>string</code> | имя канала |
| [attrId] | <code>number</code> | идентификатор атрибута |

**Example**  
```js
client.on('delete', function(name, attrId){  if(attrId === undefined) console.log('channel "' + name + '" was removed');  else console.log('attribute ' + attrId + ' was removed from channel "' + name + '" deleted');});
```
<a name="LMClient+event_count"></a>

### "count"
Событие формируется для учетных записей типа "клиент" после подключения к серверу и запроса списка имеющихся каналов.

**Kind**: event emitted by [<code>LMClient</code>](#LMClient)  
**Properties**

| Name | Type | Description |
| --- | --- | --- |
| count | <code>number</code> | количество каналов |

<a name="LMClient+event_error"></a>

### "error"
Событие формируется при возникновении ошибки. Программа должна содержать обработчик этого события.

**Kind**: event emitted by [<code>LMClient</code>](#LMClient)  
**Properties**

| Name | Type | Description |
| --- | --- | --- |
| error | <code>Error</code> | ошибка |

<a name="Channel2"></a>

## Channel2 : <code>Object</code>
Канал сервера

**Kind**: global typedef  
**Properties**

| Name | Type | Description |
| --- | --- | --- |
| name | <code>string</code> | наименование |
| number | <code>number</code> | числовой идентификатор на сервере |
| type | <code>number</code> | тип |
| value | <code>\*</code> | значение |
| quality | <code>number</code> | качество |
| dt | <code>Date</code> | время изменения |
| needRegister | <code>boolean</code> | необходимо зарегистрировать |
| needSend | <code>boolean</code> | необходимо передать |
| active | <code>boolean</code> | активен |
| writeEnable | <code>boolean</code> | разрешение записи |
| saveServer | <code>boolean</code> | сохранять значение на сервере при откоючении источника |
| attributes | <code>Object.&lt;number, Attribute&gt;</code> | массив атрибутов |
| [creator] | <code>number</code> | идентификатор создателя канала |
| [owner] | <code>number</code> | источник значения для канала |
| [groups] | <code>number</code> | принадлежность группам каналов |

<a name="Attribute"></a>

## Attribute : <code>Object</code>
Атрибут канала

**Kind**: global typedef  
**Properties**

| Name | Type | Description |
| --- | --- | --- |
| id | <code>number</code> | идентификатор |
| value | <code>\*</code> | значение |
| dt | <code>Date</code> | дата изменения |
| fromServer | <code>boolean</code> | получен от сервера |

<a name="Control"></a>

## Control : <code>Object</code>
Структура данных управления каналом

**Kind**: global typedef  
**Properties**

| Name | Type | Description |
| --- | --- | --- |
| name | <code>string</code> | имя канала для которого пришла команда управления |
| value | <code>\*</code> | полученное значение команды |
| dt | <code>Date</code> | метка времени |

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
| client | <code>boolean</code> | тип учетной записи "клиент" |

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

Примеры испоьзования библиотеки для типов учетной записи "опрос" и "клиент" приведены в файлах **testOpros.js** и **testClient.js** соответственно.

## Существующие ограничения

* Поддержка только каналов второго типа
* Не реализована возможность изменения значений атрибутов каналов

## Текущий статус

Весь заявленный функционал протестирован на больших нагрузках и работает. Дальнейшие планы:

* оптимизация затрат памяти и загрузки процессора
* добавление не реализованных функций
* добавление поддержки каналов первого типа (далекие планы)

## Обратная связь

Замечания и предложения отправляйте на адрес lanmon@mnppsaturn.ru или непосредственно в **Issues/Pull requests**.

* * *
&copy; 2019 ООО "МНПП Сатурн"
