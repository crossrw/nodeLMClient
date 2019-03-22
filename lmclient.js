/**
 * @project LMClient
 * @file Класс клиента сервера LM
 * @copyright ООО МНПП Сатурн
 */

const EventEmitter = require('events');
const net = require('net');

const clientHiVersion = 0;                  // версия клиента
const clientLoVersion = 1;

// значения свойства quality канала
const stOk              = 0;                // ok
const stTempOff         = 1;                // выключен (не опрашивается)
const stOff             = 2;                // состояние не определено (нет данных)
const stError           = 3;                // неисправность
const stFailure         = 4;                // неисправность
const stWrong           = 5;                // значение недостоверно
const stNotConnected    = 6;                // датчик не подключен
const stBadConnection   = 7;                // неисправность канала связи
const stRegFailure      = 8;                // неисправен регистратор

// значения поддерживаемых типов данных
const VT_EMPTY          = 0;
const VT_I2             = 2;
const VT_I4             = 3;
const VT_R4             = 4;
const VT_R8             = 5;
const VT_DATE           = 7;
const VT_BOOL           = 11;
const VT_I1             = 16;
const VT_UI1            = 17;
const VT_UI2            = 18;
const VT_UI4            = 19;
const VT_STRING         = 256;
const VT_ARRAY          = 4096;
const VT_MASK           = 4095;
const validTypes = [VT_EMPTY, VT_I2, VT_I4, VT_R4, VT_R8, VT_DATE, VT_BOOL, VT_I1, VT_UI1, VT_UI2, VT_UI4, VT_STRING];

// идентификаторы атрибутов
const ATTR_EUType           = 7;
const ATTR_EUInfo1          = 9;
const ATTR_EUInfo2          = 10;
const ATTR_EUInfo3          = 11;
const ATTR_UNITS            = 100;
const ATTR_COMMENT          = 101;
const ATTR_HIGHEU           = 102;
const ATTR_LOEU             = 103;
const ATTR_HIGHIRANGE       = 104;
const ATTR_LOIRANGE         = 105;
const ATTR_CONCLOSELABEL    = 106;
const ATTR_CONOPENLABEL     = 107;
const ATTR_TIMEZONE         = 108;
const ATTR_QUALITYEXPRESSION= 109;
const ATTR_VALUEEXPRESSION  = 110;
const ATTR_PERCENTDB        = 111;
const ATTR_PREFIX           = 112;
const ATTR_FGCOLOR          = 201;
const ATTR_BGCOLOR          = 202;
const ATTR_BLINK            = 203;
const ATTR_BMPFILE          = 204;
const ATTR_SOUNDFILE        = 205;
const ATTR_ALARMMESSAGE     = 301;
const ATTR_ALARMAREALIST    = 302;
const ATTR_PRIMALARMAREA    = 303;
const ATTR_CONDLOGIC        = 304;
const ATTR_LIMITEXCEEDED    = 305;
const ATTR_DEADBAND         = 306;
const ATTR_HIHILIMIT        = 307;
const ATTR_HILIMIT          = 308;
const ATTR_LOLIMIT          = 309;
const ATTR_LOLOLIMIT        = 310;
const ATTR_RATECHANGELIMIT  = 311;
const ATTR_DEVIATIONLIMIT   = 312;
const ATTR_WATCHLIMIT       = 314;
const ATTR_DESCRIPTION      = 5000;
const ATTR_CONQUALITY       = 5001;
const ATTR_FORMAT           = 5002;
const ATTR_MASKED           = 5003;
const ATTR_DTYPE            = 5004;
const ATTR_SYSM             = 5005;
const ATTR_ALARMID          = 5006;
const ATTR_DEVICE           = 5007;
const ATTR_USERTAG          = 5008;
const ATTR_SIGNIFICATION    = 5009;
const ATTR_NAMUR            = 5010;
const ATTR_TAMPER           = 5011;
const ATTR_VALUECHEXPRESSION= 5012;
const ATTR_BESTRECEIVER     = 5014;
const ATTR_BESTREPEATER     = 5015;
const ATTR_STORAGENUMBER    = 5200;
const ATTR_TARIFNUMBER      = 5201;
const ATTR_UNITNUMBER       = 5202;

// типы атрибутов
const validAttributes = {};
validAttributes[ATTR_EUType]             = VT_I2;
validAttributes[ATTR_EUInfo1]            = VT_R8 + VT_ARRAY;
validAttributes[ATTR_EUInfo2]            = VT_STRING + VT_ARRAY;
validAttributes[ATTR_EUInfo3]            = VT_I4;
validAttributes[ATTR_UNITS]              = VT_STRING;
validAttributes[ATTR_COMMENT]            = VT_STRING;
validAttributes[ATTR_HIGHEU]             = VT_R8;
validAttributes[ATTR_LOEU]               = VT_R8;
validAttributes[ATTR_HIGHIRANGE]         = VT_R8;
validAttributes[ATTR_LOIRANGE]           = VT_R8;
validAttributes[ATTR_CONCLOSELABEL]      = VT_STRING;
validAttributes[ATTR_CONOPENLABEL]       = VT_STRING;
validAttributes[ATTR_TIMEZONE]           = VT_I4;
validAttributes[ATTR_QUALITYEXPRESSION]  = VT_STRING;
validAttributes[ATTR_VALUEEXPRESSION]    = VT_STRING;
validAttributes[ATTR_PERCENTDB]          = VT_R4;
validAttributes[ATTR_PREFIX]             = VT_STRING;
validAttributes[ATTR_FGCOLOR]            = VT_I4;
validAttributes[ATTR_BGCOLOR]            = VT_I4;
validAttributes[ATTR_BLINK]              = VT_BOOL;
validAttributes[ATTR_BMPFILE]            = VT_STRING;
validAttributes[ATTR_SOUNDFILE]          = VT_STRING;
validAttributes[ATTR_ALARMMESSAGE]       = VT_STRING;
validAttributes[ATTR_ALARMAREALIST]      = VT_STRING + VT_ARRAY;
validAttributes[ATTR_PRIMALARMAREA]      = VT_STRING;
validAttributes[ATTR_CONDLOGIC]          = VT_STRING;
validAttributes[ATTR_LIMITEXCEEDED]      = VT_STRING;
validAttributes[ATTR_DEADBAND]           = VT_R8;
validAttributes[ATTR_HIHILIMIT]          = VT_R8;
validAttributes[ATTR_HILIMIT]            = VT_R8;
validAttributes[ATTR_LOLIMIT]            = VT_R8;
validAttributes[ATTR_LOLOLIMIT]          = VT_R8;
validAttributes[ATTR_RATECHANGELIMIT]    = VT_R8;
validAttributes[ATTR_DEVIATIONLIMIT]     = VT_R8;
validAttributes[ATTR_WATCHLIMIT]         = VT_BOOL;
validAttributes[ATTR_DESCRIPTION]        = VT_STRING;
validAttributes[ATTR_CONQUALITY]         = VT_I2;
validAttributes[ATTR_FORMAT]             = VT_STRING;
validAttributes[ATTR_MASKED]             = VT_BOOL;
validAttributes[ATTR_DTYPE]              = VT_UI1;
validAttributes[ATTR_SYSM]               = VT_UI1;
validAttributes[ATTR_ALARMID]            = VT_I4 + VT_ARRAY;
validAttributes[ATTR_DEVICE]             = VT_UI1;
validAttributes[ATTR_USERTAG]            = VT_STRING;
validAttributes[ATTR_SIGNIFICATION]      = VT_UI1;
validAttributes[ATTR_NAMUR]              = VT_BOOL;
validAttributes[ATTR_TAMPER]             = VT_BOOL;
validAttributes[ATTR_VALUECHEXPRESSION]  = VT_STRING;
validAttributes[ATTR_BESTRECEIVER]       = VT_UI2;
validAttributes[ATTR_BESTREPEATER]       = VT_UI4;
validAttributes[ATTR_STORAGENUMBER]      = VT_UI4;
validAttributes[ATTR_TARIFNUMBER]        = VT_UI4;
validAttributes[ATTR_UNITNUMBER]         = VT_UI4;

/**
 * Канал сервера
 * @typedef {Object} Channel2
 * @property {string} name - наименование
 * @property {number} number - числовой идентификатор на сервере
 * @property {number} type - тип
 * @property {*} value - значение
 * @property {number} quality - качество
 * @property {Date} dt - время изменения
 * @property {boolean} needRegister - необходимо зарегистрировать
 * @property {boolean} needSend - необходимо передать
 * @property {boolean} active - активен
 * @property {boolean} writeEnable - разрешение записи
 * @property {boolean} saveServer - сохранять значение на сервере при откоючении источника
 * @property {Object.<number, Attribute>} attributes - массив атрибутов    
 * @property {number} [creator] - идентификатор создателя канала
 * @property {number} [owner] - источник значения для канала
 * @property {number} [groups] - принадлежность группам каналов
 */
/**
 * Атрибут канала
 * @typedef {Object} Attribute
 * @property {number} id - идентификатор
 * @property {*} value - значение
 * @property {Date} dt - дата изменения
 * @property {boolean} fromServer - получен от сервера
 */
/**
 * Структура данных управления каналом
 * @typedef {Object} Control
 * @property {string} name - имя канала для которого пришла команда управления
 * @property {*} value - полученное значение команды
 * @property {Date} dt - метка времени
 */
/**
 * Значение переменного типа
 * @private
 * @typedef {Object} VarType
 * @property {(number|string|boolean|number[]|string[]|boolean[])} value - значение
 * @property {number} type - тип
 * @property {number} size - размер
 */
/**
 * Параметры подключения к серверу
 * @typedef {Object} ConnectOptions
 * @property {string} host - адрес сервера
 * @property {number} port - номер TCP порта
 * @property {string} login - логин
 * @property {string} password - пароль
 * @property {boolean} reconnect - автоматически переподключаться при ошибках и разрывах связи
 * @property {boolean} opros - тип учетной записи "опрос"
 * @property {boolean} client - тип учетной записи "клиент"
 */
/**
 * Параметры задаваемые при создании канала
 * @typedef {Object} ChannelOptions
 * @property {string} [units] - единицы измерения
 * @property {string} [comment] - текстовое описание
 * @property {number} [signification] - назначение
 * @property {boolean} [saveValue] - сохранять значение на сервере при отключении опросчика
 * @property {Array.<string>} [enum] - массив строк, соответствующих значению канала
 * @property {Array.<number>} [bounds] - массив из двух элементов [нижняя граница, верхняя граница]
 * @property {number} [percentDeadband] - величина "мертвой зоны" изменения значения канала в процентах
 */

const win1251Map = {0: 0, 1: 1, 2: 2, 3: 3, 4: 4, 5: 5, 6: 6, 7: 7, 8: 8, 9: 9, 10: 10, 11: 11, 12: 12, 13: 13, 14: 14, 15: 15, 16: 16, 17: 17, 18: 18, 19: 19, 20: 20, 21: 21, 22: 22, 23: 23, 24: 24, 25: 25, 26: 26, 27: 27, 28: 28, 29: 29, 30: 30, 31: 31, 32: 32, 33: 33, 34: 34, 35: 35, 36: 36, 37: 37, 38: 38, 39: 39, 40: 40, 41: 41, 42: 42, 43: 43, 44: 44, 45: 45, 46: 46, 47: 47, 48: 48, 49: 49, 50: 50, 51: 51, 52: 52, 53: 53, 54: 54, 55: 55, 56: 56, 57: 57, 58: 58, 59: 59, 60: 60, 61: 61, 62: 62, 63: 63, 64: 64, 65: 65, 66: 66, 67: 67, 68: 68, 69: 69, 70: 70, 71: 71, 72: 72, 73: 73, 74: 74, 75: 75, 76: 76, 77: 77, 78: 78, 79: 79, 80: 80, 81: 81, 82: 82, 83: 83, 84: 84, 85: 85, 86: 86, 87: 87, 88: 88, 89: 89, 90: 90, 91: 91, 92: 92, 93: 93, 94: 94, 95: 95, 96: 96, 97: 97, 98: 98, 99: 99, 100: 100, 101: 101, 102: 102, 103: 103, 104: 104, 105: 105, 106: 106, 107: 107, 108: 108, 109: 109, 110: 110, 111: 111, 112: 112, 113: 113, 114: 114, 115: 115, 116: 116, 117: 117, 118: 118, 119: 119, 120: 120, 121: 121, 122: 122, 123: 123, 124: 124, 125: 125, 126: 126, 127: 127, 1027: 129, 8225: 135, 1046: 198, 8222: 132, 1047: 199, 1168: 165, 1048: 200, 1113: 154, 1049: 201, 1045: 197, 1050: 202, 1028: 170, 160: 160, 1040: 192, 1051: 203, 164: 164, 166: 166, 167: 167, 169: 169, 171: 171, 172: 172, 173: 173, 174: 174, 1053: 205, 176: 176, 177: 177, 1114: 156, 181: 181, 182: 182, 183: 183, 8221: 148, 187: 187, 1029: 189, 1056: 208, 1057: 209, 1058: 210, 8364: 136, 1112: 188, 1115: 158, 1059: 211, 1060: 212, 1030: 178, 1061: 213, 1062: 214, 1063: 215, 1116: 157, 1064: 216, 1065: 217, 1031: 175, 1066: 218, 1067: 219, 1068: 220, 1069: 221, 1070: 222, 1032: 163, 8226: 149, 1071: 223, 1072: 224, 8482: 153, 1073: 225, 8240: 137, 1118: 162, 1074: 226, 1110: 179, 8230: 133, 1075: 227, 1033: 138, 1076: 228, 1077: 229, 8211: 150, 1078: 230, 1119: 159, 1079: 231, 1042: 194, 1080: 232, 1034: 140, 1025: 168, 1081: 233, 1082: 234, 8212: 151, 1083: 235, 1169: 180, 1084: 236, 1052: 204, 1085: 237, 1035: 142, 1086: 238, 1087: 239, 1088: 240, 1089: 241, 1090: 242, 1036: 141, 1041: 193, 1091: 243, 1092: 244, 8224: 134, 1093: 245, 8470: 185, 1094: 246, 1054: 206, 1095: 247, 1096: 248, 8249: 139, 1097: 249, 1098: 250, 1044: 196, 1099: 251, 1111: 191, 1055: 207, 1100: 252, 1038: 161, 8220: 147, 1101: 253, 8250: 155, 1102: 254, 8216: 145, 1103: 255, 1043: 195, 1105: 184, 1039: 143, 1026: 128, 1106: 144, 8218: 130, 1107: 131, 8217: 146, 1108: 186, 1109: 190};
/**
 * Преобразование строки UTF-8 в Windows-1251
 * @private
 * @param {string} s - исходная строка
 * @returns {string}
 */
function utf8ToWin1251(s) {
    var L = [];
    for (var i=0; i < s.length; i++) {
        var ord = s.charCodeAt(i);
        if (ord in win1251Map) L.push(String.fromCharCode(win1251Map[ord]));
    }
    return L.join('');
}

var utf8Map = {0:'\u0402',1:'\u0403',2:'\u201A',3:'\u0453',4:'\u201E',5:'\u2026',6:'\u2020',7:'\u2021',8:'\u20AC',9:'\u2030',10:'\u0409',11:'\u2039',12:'\u040A',13:'\u040C',14:'\u040B',15:'\u040F',16:'\u0452',17:'\u2018',18:'\u2019',19:'\u201C',20:'\u201D',21:'\u2022',22:'\u2013',23:'\u2014',24:'\x98',25:'\u2122',26:'\u0459',27:'\u203A',28:'\u045A',29:'\u045C',30:'\u045B',31:'\u045F',32:'\xA0',33:'\u040E',34:'\u045E',35:'\u0408',36:'\xA4',37:'\u0490',38:'\xA6',39:'\xA7',40:'\u0401',41:'\xA9',42:'\u0404',43:'\xAB',44:'\xAC',45:'\xAD',46:'\xAE',47:'\u0407',48:'\xB0',49:'\xB1',50:'\u0406',51:'\u0456',52:'\u0491',53:'\xB5',54:'\xB6',55:'\xB7',56:'\u0451',57:'\u2116',58:'\u0454',59:'\xBB',60:'\u0458',61:'\u0405',62:'\u0455',63:'\u0457',64:'\u0410',65:'\u0411',66:'\u0412',67:'\u0413',68:'\u0414',69:'\u0415',70:'\u0416',71:'\u0417',72:'\u0418',73:'\u0419',74:'\u041A',75:'\u041B',76:'\u041C',77:'\u041D',78:'\u041E',79:'\u041F',80:'\u0420',81:'\u0421',82:'\u0422',83:'\u0423',84:'\u0424',85:'\u0425',86:'\u0426',87:'\u0427',88:'\u0428',89:'\u0429',90:'\u042A',91:'\u042B',92:'\u042C',93:'\u042D',94:'\u042E',95:'\u042F',96:'\u0430',97:'\u0431',98:'\u0432',99:'\u0433',100:'\u0434',101:'\u0435',102:'\u0436',103:'\u0437',104:'\u0438',105:'\u0439',106:'\u043A',107:'\u043B',108:'\u043C',109:'\u043D',110:'\u043E',111:'\u043F',112:'\u0440',113:'\u0441',114:'\u0442',115:'\u0443',116:'\u0444',117:'\u0445',118:'\u0446',119:'\u0447',120:'\u0448',121:'\u0449',122:'\u044A',123:'\u044B',124:'\u044C',125:'\u044D',126:'\u044E',127:'\u044F'};
/**
 * Преобразование строки Windows-1251 в UTF-8 
 * @private
 * @param {string} s - исходная строка
 * @returns {string}
 */
function win1251toUtf8(s) {
    var L = [];
    for (let i = 0; i < s.length; i++) {
        var ord = s.charCodeAt(i);
        if (ord >= 128) {
            ord = ord - 128;
            if(ord in utf8Map) L.push(utf8Map[ord]);
        } else {
            L.push(String.fromCharCode(ord));
        }
    }
    return L.join('');
}
/**
 * Событие формируется при начале подключения к серверу.
 * @event LMClient#connecting
 * @property {string} host - адрес сервера к которому происходит подключение
 * @property {number} port - номер TCP-порта сервера
*/
/**
 * Событие формируется когда соединение с сервером установлено.
 * @event LMClient#connect
*/
/**
 * Событие формируется когда соединение с сервером разорвано.
 * @event LMClient#disconnect
 * @property {boolean} err - признак того, что соединение разорвано в результате ошибки
*/
/**
 * Событие формируется когда клиент успешно зарегистрировался на сервере.
 * @event LMClient#loggedIn
 * @property {number} serverId - идентификатор клиента на сервере
 * @property {string} version - версия сервера в формате "hi.lo"
*/
/**
 * Событие формируется при успешном выполнении проверки связи с сервером.
 * @event LMClient#checkConnection
 * @property {number} delay - задержка в миллисекундах при ответе сервера на команду проверки связи
 * 
*/
/**
 * Событие формируется при получении от сервера команды синхронизации времени.
 * @event LMClient#timeSynchronize
 * @property {Date} time - значение времени полученное от сервера
*/
/**
 * Событие формируется при получении от сервера команды записи в канал управления. Для подтверждения получения и обработки этого события
 * необходимо установить полученное значение канала вызовом setValue(name, value).
 * @example
 * client.on('control', function(control){
 *   console.log('receive control "' + control.name + '" value="' + control.value + '"');
 *   client.setValue(control.name, control.value); // подтверждаем прием
 * });
 * @event LMClient#control
 * @property {Control} control - полученная команда управления каналом
 */
/**
 * Событие формируется при получении клиентом от сервера нового значения канала. При отключении от сервера событие формируется для всех ранее полученных
 * от него каналов с установленным свойством quality в значение stOff.
 * Событие используется при работе в режиме учетной записи "клиент".
 * @event LMClient#channel
 * @property {Channel2} channel - объект состояние канала
*/
/**
 * Уведомление о добавлении нового канала.
 * Уведомление формируется только для учетных записей типа "клиент" в случае добавления нового канала другим клиентом сервера.
 * Значение и метка времени канала сразу после его добавления не определено.
 * @event LMClient#add
 * @property {Channel2} channel - новый канал
*/

/**
 * Уведомление о изменении настроек (свойств или атрибутов) канала.
 * Измениться могут перечень и значения атрибутов, значения свойств active, writeEnable и saveServer.
 * Изменение значения самого канала не приводит к появлению данного уведомления. Уведомление формируется
 * только для учетных записей типа "клиент".
 * @event LMClient#change
 * @property {Channel2} channel - измененный канал
*/
/**
 * Уведомление об удалении канала с именем "name" или его атрибута с идентификатором "attrId".
 * Если аргумент "attrId" не определен, то событие сообщает об удалении канала "name". 
 * В противном случае событие сообщает об удалении атрибута "attrId".
 * Уведомление формируется только для учетных записей типа "клиент".
 * @example
 * client.on('delete', function(name, attrId){
 *   if(attrId === undefined) console.log('channel "' + name + '" was removed');
 *   else console.log('attribute ' + attrId + ' was removed from channel "' + name + '" deleted');
 * });
 * @event LMClient#delete
 * @property {string} name - имя канала
 * @property {number} [attrId] - идентификатор атрибута
*/
/**
 * Событие формируется при возникновении ошибки. Программа должна содержать обработчик этого события.
 * @event LMClient#error
 * @property {Error} error - ошибка
*/
/**
 * @class Класс клиента сервера LM
 * @fires LMClient#connecting
 * @fires LMClient#connect
 * @fires LMClient#disconnect
 * @fires LMClient#loggedIn
 * @fires LMClient#checkConnection
 * @fires LMClient#timeSynchronize
 * @fires LMClient#control
 * @fires LMClient#channel
 * @fires LMClient#add
 * @fires LMClient#change
 * @fires LMClient#delete
 * @fires LMClient#error
 */
class LMClient extends EventEmitter {
    /**
     * Конструктор класса.
     * Создает новый экземпляр класса подключения к серверу. В параметрах конструктора указываются
     * настройки используемые при подключении к серверу.
     * @constructor
     * @param {ConnectOptions} options Параметры подключения к серверу
     */
    constructor(options = {}) {
        super();
        //
        this.options = Object.assign({}, {
            host:       '127.0.0.1',                // адрес сервера
            port:       3000,                       // порт сервера
            login:      '',                         // логин
            password:   '',                         // пароль
            reconnect:  true,                       // автоматически переподключаться при ошибках и разрывах связи
            opros:      true,                       // тип учетной записи "опрос"
            client:     false                       // тип учетной записи "клиент" (не поддерживается)
        }, options);
        //
        this.socket = null;
        /** 
         * приемный буфер
         * @private
         * @type {Buffer}
         * */
        this.inbuf = Buffer.allocUnsafe(0);
        //
        this.waitStatus = 0;                        // признак ожидания запрошенного статуса
        /**
         * Текущее состояние регистрации на сервере.
         * Значение true соответствует тому, что клиент успешно подключен и зарегестрирован на сервере.
         * @public
         * @type {boolean}
         */
        this.loggedIn = false;                      // клиент зарегистрирован на сервере
        /**
         * Текущее состояние подключения к серверу.
         * Значение true соответствует тому, что клиент установил соединение с сервером. Состояние регистрации можно
         * проконтролировать через свойство loggedIn.
         * @public
         * @type {boolean}
         */
        this.connected = false;
        this.serverVersion = 0;                     // версия сервера
        this.serverTimeBias = 0;                    // смещение времени сервера
        this.reconnectTimer = null;                 // таймер повторных соединений
        this.checkConnTimer = null;                 // таймер проверки связи
        /**
         * Интервал проверки связи с сервером в мс. 
         * Значение по умолчанию 480000 мс (8 минут).
         * @public
         * @type {number}
         */
        this.checkConnectInterval = 480000;
        /**
         * Ассоциативный массив каналов. Элементы массива является экземплярами класса Channel2, ключом в массиве является имена каналов.
         * Программа не должна изменять состояния каналов напрямую в массиве. Для изменения используйте вызовы методов класса.
         * @example
         * // пример обращения к каналу по имени:
         * var channel = lmclient.channels['my_channel_name'];
         * // пример получения массива имен всех каналов:
         * var names = Object.keys(lmclient.channels);
         * // общее количество каналов
         * var count = names.length;    
         * @public
         * @readonly
         * @type {Object.<string, Channel2>}
         */
        this.channels = {};
        /**
         * ассоциативный массив номеров каналов на сервере
         * @private
         * @type {Object.<number, string>}
         */
        this.channelsNumbers = {};
    }
    /**
     * Подключение и регистрация на сервере LM.
     * Метод начинает процедуру подключения и регистрации к серверу системы LanMon. При подключении используются
     * параметры указанные при создании класса. Если в параметрах указано значение reconnect: true, то соединение
     * будет автоматически восстанавливаться в случаях обрыва связи или ошибок.
     * @public
     */
    connect() {
        var _this = this;
        //
        this.socket = new net.Socket();
        this.emit('connecting', this.options.host, this.options.port);
        this.socket.connect(this.options.port, this.options.host, function (){
            // соединение установлено
            _this.connected = true;
            _this.emit('connect');
            // отправка данных регистрации
            _this._sendRegisterStruct();
        });
        this.socket.on('error', function(err){
            // ошибка при соединении или в процессе работы
            _this.emit('error', err);
            _this._disconnect();
        });
        this.socket.on('data', data => this._onReceiveData(data));
        this.socket.on('close', function(err){
            // соединение разорвано сервером
            _this.emit('disconnect', err);
            if(_this.connected) {
                _this._disconnect();
            }
        });
    }
    /**
     * Отключиться от сервера.
     * Метод разрывает соединение с сервером если оно было ранее установлено вызовом метода connect().
     * @public
     */
    disconnect() {
        var _this = this;
        this.connected = false;
        this.loggedIn = false;
        this.waitStatus = 0;
        // сброс таймера перепоключений
        if(this.reconnectTimer) {
            clearTimeout(this.reconnectTimer);
            this.reconnectTimer = null;
        }
        // сброс таймера проверки связи
        if(this.checkConnTimer) {
            clearInterval(this.checkConnTimer);
            this.checkConnTimer = null;
        }
        // сброс состояния каналов
        Object.keys(this.channels).forEach(name => {
            /** @type {Channel2} */
            let channel = _this.channels[name];
            if('creator' in channel) {
                // канал полученный от сервера в режиме "клиент"
                if(channel.quality != stOff) {
                    channel.quality = stOff;
                    this.emit('channel', channel);
                }
            } else {
                // канал созданный мной
                channel.needRegister = true;
                channel.needSend = ('value' in channel);
                channel.active = false;
                channel.number = -1;
            }
        });
        // сброс номеров каналов
        this.channelsNumbers = {};
        // закрытие сокета
        this.socket.destroy();
        // сброс приемного буфера
        this._truncateInBuf();
    }
    /**
     * Добавление нового канала.
     * Метод добавляет новый канал для регистрации и передачи данных на сервер.
     * Метод используется при подключении с типом учетной записи "опрос".
     * Метод может быть вызван при любом состоянии подключения к сервреру.
     * Метод возвращает значение false если канал с указанным именем уже существует или
     * если указан некорректный тип данных.
     * @public
     * @param {string} name Имя канала
     * @param {number} type Тип канала
     * @param {boolean} writeEnable Разрешение записи значений
     * @param {ChannelOptions} options Параметры канала
     * @returns {boolean} 
     */
    add(name, type, writeEnable, options = {}) {
        // добавление каналов только в режиме опрос
        if(!this.options.opros) return false;
        // проверка на корректность типа данных
        if(!validTypes.includes(type & VT_MASK)) return false;
        // проверка на дублирование имени
        if(name in this.channels) return false;
        // создаем канал
        /** @type {Channel2} */
        var channel = {
            'name': name,
            'type': type,
            'dt': new Date(),
            'needRegister': true,
            'needSend': false,
            'active': false,
            'writeEnable': writeEnable || false,
            'saveServer': options.saveValue || false,
            'number': -1,
            'attributes': {}
        };
        // добавляем атрибуты
        if(typeof options.units === 'string') {
            channel.attributes[ATTR_UNITS] = this._createAttribute(ATTR_UNITS, options.units);
        }
        if(typeof options.comment === 'string') {
            channel.attributes[ATTR_COMMENT] = this._createAttribute(ATTR_COMMENT, options.comment);
        }
        if(typeof options.signification === 'number') {
            channel.attributes[ATTR_SIGNIFICATION] = this._createAttribute(ATTR_SIGNIFICATION, options.signification);
        }
        if(('bounds' in options) && Array.isArray(options.bounds)) {
            channel.attributes[ATTR_EUType] = this._createAttribute(ATTR_EUType, 1);
            channel.attributes[ATTR_EUInfo1] = this._createAttribute(ATTR_EUInfo1, options.bounds);
        } else
        if(('enum' in options) && Array.isArray(options.enum)) {
            channel.attributes[ATTR_EUType] = this._createAttribute(ATTR_EUType, 2);
            channel.attributes[ATTR_EUInfo2] = this._createAttribute(ATTR_EUInfo2, options.enum);
        }
        if('percentDeadband' in options) {
            channel.attributes[ATTR_PERCENTDB] = this._createAttribute(ATTR_PERCENTDB, options.percentDeadband);
        }
        // добавляем канал
        this.channels[name] = channel;
        // передача на сервер
        if(this.loggedIn) this._sendAll();
        //
        return true;
    }
    /**
     * Удаление канала или атрибута канала.
     * Метод выполняет передачу на сервер запроса на удаление канала или отдельного атрибута канала.
     * При наличии соотвествующих прав доступа клиента, сервер выполняет удаление соответствующей сущности и рассылет уведомления всем
     * подключенным к нему клиентам, в том числе и вам. При удачном удалении через некоторое время после вызова метода клиент получит 
     * уведомление {@link LMClient#delete}.
     * Метод используется при подключении с типом учетной записи "клиент".
     * @public
     * @todo пока не реализовано !
     * @param {string} name - имя канала
     * @param {number} [attrId] - идентификатор атрибута
     */
    delete(name, attrId) {
        if(!this.options.client) return false;
        // проверка на наличие канала
        if(!(name in this.channels)) return false;
        let channel = this.channels[name];

        return true;
    }
    /**
     * Установка значения канала.
     * Метод устанавливает значение для ранее созданного канала. Тип и значение параметра value должен соответствовать типу
     * канала указанному при его создании. Установленное значение канала будет передано на сервер. Кроме того, метод
     * устанавливает свойство канала quality (качество) в значение stOk. Метод используется при подключении с 
     * типом учетной записи "опрос". Метод может быть вызван при любом состоянии подключения к сервреру.
     * Метод возвращает значение false если канал с указанным именем не найден или указан некорректный тип учетной записи.
     * @public
     * @param {string} name Имя канала
     * @param {*} value Новое значение канала
     * @returns {boolean}
     */
    setValue(name, value) {
        // установка значения только в режиме опрос
        if(!this.options.opros) return false;
        // проверка на наличие канала
        if(!(name in this.channels)) return false;
        let channel = this.channels[name];
        // проверка на изменения
        if((channel.quality == stOk) && (channel.value == value)) return true;
        // фильтрация значений с плавающей точкой
        try {
            if(((channel.type == VT_R4)||(channel.type == VT_R8))&&(channel.quality == stOk)&&(ATTR_PERCENTDB in channel.attributes)) {
                if((ATTR_EUType in channel.attributes)&&(channel.attributes[ATTR_EUType].value == 1)&&(ATTR_EUInfo1 in channel.attributes)) {
                    // верхний и нижний диапазоны заданы
                    let minmax = channel.attributes[ATTR_EUInfo1].value;
                    if(Math.abs(channel.value - value) < Math.abs(minmax[0] - minmax[1])/100 * channel.attributes[ATTR_PERCENTDB].value) {
                        return true;
                    }
                } else {
                    // верхний и нижний диапазоны не заданы
                    if(Math.abs(channel.value - value) < Math.abs(channel.value/100 * channel.attributes[ATTR_PERCENTDB].value)) {
                        return true;
                    }
                }
            }
        } catch(err) {
            // empty
        }
        // устанавливаем новое значение
        channel.value = value;
        channel.quality = stOk;
        channel.dt = new Date();
        channel.needSend = true;
        // передача на сервер
        if(this.loggedIn) this._sendAll();
        //
        return true;
    }
    /**
     * Установка качества канала.
     * Метод устанавливает значение свойства качество для ранее созданного канала. Метод используется при подключении с 
     * типом учетной записи "опрос". Значение качества канала stOk автоматически устанавливается при установке
     * значения канала методом setValue(name, value) и отдельно устанавливать его не требуется.
     * Метод может быть вызван при любом состоянии подключения к сервреру.
     * Метод возвращает значение false если канал с указанным именем не найден, указано некорректное значение качества или 
     * тип учетной записи.
     * @public
     * @param {string} name Имя канала
     * @param {number} quality Новое значение качества
     * @returns {boolean}
     */
    setQuality(name, quality) {
        // качество stOk устанавливать нельзя, вместо этого нужно установить значение канала
        if(quality == stOk) return false;
        // проверка на наличие канала
        if(!(name in this.channels)) return false;
        let channel = this.channels[name];
        if(channel.quality == quality) return true;
        //
        channel.quality = quality;
        channel.dt = new Date();
        channel.needSend = true;
        // передача на сервер
        if(this.loggedIn) this._sendAll();
        //
        return true;
    }
    /**
     * Формирование команды управления каналом. 
     * Метод используется при подключении с типом учетной записи "клиент".
     * Для выполнения управления каналом должны выполняться следующие условия: клиент должен быть подключен и зарегистрирован на сервере,
     * канал должен быть существующим, канал должен быть создан другим клиентом (опросчиком), у канала должны быть установлены признаки 
     * активности и разрешения записи значений, тип значения value должен быть совместим с типом канала.
     * При выполнении перечисленных выше условий метод возвращает true, иначе - false.
     * Метод не устанавливает значение канала, полученную команду управления сервер пересылает клиенту типа "опрос", который сформировал этот канал.
     * @todo проверить работу
     * @param {string} name Имя канала
     * @param {*} value Значение команды управления
     * @return {boolean}
     */
    sendControl(name, value) {
        if(!(this.options.client && this.loggedIn)) return false;
        return this._sendControlStruct(name, value);
    }
    /**
     * Отключение от сервера с последующим возможным повторным подключением
     * @private
     */
    _disconnect() {
        this.disconnect();
        //
        if(this.options.reconnect) {
            this.reconnectTimer = setTimeout(() => this.connect(), 10000);
        }
    }
    /**
     * Пришли данные от сервера
     * @private
     * @param {Buffer} data - буфер с данными
     */
    _onReceiveData(data) {
        // что-то пришло от сервера
        // добавляем принятые данные в глобальный буфер
        this.inbuf = Buffer.concat([this.inbuf, data]);
        // указатель на начало очередной структуры
        let offset = 0;
        // цикл обработки структур
        for(;;) {
            if(this.inbuf.length <= offset) {
                // в буфере ничего нового нет
                this._truncateInBuf(offset);
                return;
            }
            // читаем команду
            let cmd = this.inbuf.readUInt8(offset);
            // определяем размер структуры
            let size = this._structSize(cmd);
            if(size === 0) {
                // размер структуры присутствует в самой структуре
                if(this.inbuf.length < offset + 3) {
                    this._truncateInBuf(offset);
                    return;
                }
                // размер структуры
                size = this.inbuf.readUInt16LE(offset + 1);
            }
            // проверка наличия в буфере очередной структуры ЦЕЛИКОМ
            if(this.inbuf.length < offset + size) {
                this._truncateInBuf(offset);
                return;
            }
            // в буфере есть очередная структура ЦЕЛИКОМ
            // console.log('receive cmd:' + cmd + ' size:' + size);
            try {
                this._parseCommand(this.inbuf, cmd, offset);
                // выполнение разбора буфера может вызвать отключение от сервера, проверяем статус подключения
                if(!this.connected) return;
            } catch(error) {
                this.emit('error', new Error('ошибка при разборе полученной структуры ' + cmd), error);
                // this._disconnect();
            }
            // перенос указателя на начало следующей структуры
            offset += size;
        }
    }
    /**
     * Обрезание обработанных команд во входном буфере.
     * Если параметр offset не указан, то сбрасывает размер буфера до 0.
     * @private
     * @param {number} [offset] - смещение не обработанных команд
     */
    _truncateInBuf(offset) {
        if(offset === undefined) offset = this.inbuf.length;
        if(this.inbuf.length > 0) {
            this.inbuf = this.inbuf.slice(offset);
        }
    }
    /**
     * Разбор очередной принятой структуры
     * @private
     * @param {Buffer} data - буфер с данными структуры
     * @param {number} cmd - команда (она же находится в буфере по смещению offset)
     * @param {number} offset - смещение в буфере
     */
    _parseCommand(data, cmd, offset) {
        // пропускаем поле команды
        offset++;
        //
        switch(cmd) {
            case 2:
                // старый ответ на регистрацию
                break;
            case 7:
                // конфигурация A1
                break;
            case 8:
                // конфигурация A2
                break;
            case 9:
                // конфигурация A3
                break;
            case 10:
                // конфигурация A4 старая
                break;
            case 20:
                // информация о состоянии канала 1
                break;
            case 21:
                // управление каналом 1
                break;
            case 22: {
                // синхронизация времени
                // ServerTime       VT_DATE
                let serverDateTime = data.readDoubleLE(offset);
                // Reserved         VT_UI1[6]
                this.emit('timeSynchronize', this._dateTimeToDate(serverDateTime));
                break;
            }
            case 23:
                // извещение клиентам
                // Message          VT_UI1
                // Reserved         VT_UI1[3]
                break;
            case 34:
                // конфигурация A4 новая
                break;
            case 43: {
                // ответ на регистрацию клиента
                // Id               VT_I4
                let clientId = data.readInt32LE(offset);
                offset += 4;
                // Reserved1        VT_UI1
                offset++;
                // ServerTime       VT_DATE
                let serverDateTime = data.readDoubleLE(offset);
                offset += 8;
                // HiVer            VT_UI1
                let hiVer = data.readUInt8(offset++);
                // LoVer            VT_UI1
                let loVer = data.readUInt8(offset++);
                // Reserved2        VT_UI2
                // Reserved3        VT_UI2
                offset += 4;
                // RefusalReason    VT_UI1
                let refusalReason = data.readUInt8(offset++);
                // ServerTimeBias   VT_I2
                this.serverTimeBias = data.readInt16LE(offset);
                offset += 2;
                // Reserved4        VT_UI2
                offset += 2;
                // разбор
                if(refusalReason === 0) {
                    // регистрация успешна
                    this.loggedIn = true;
                    this.emit('loggedIn', clientId, hiVer.toString(10) + '.' + loVer.toString(10));
                    this.emit('timeSynchronize', this._dateTimeToDate(serverDateTime));
                    // установка таймера проверки соединения
                    this.checkConnTimer = setInterval(() => this._checkConnection(), this.checkConnectInterval);
                    //
                    if(this.options.client) {
                        // запрос всех каналов
                        this._sendRequestAllChannels();
                    }
                    // передача каналов на сервер
                    this._sendAll();
                } else {
                    // отказ в регистрации
                    let msg;
                    switch(refusalReason) {
                        case 1:
                            msg = 'тип учетной записи на сервере не совпадает с запрошенным';
                            break;
                        case 2:
                            msg = 'учетная запись уже подключена с другого адреса';
                            break;
                        case 3:
                            msg = 'ресурсы учетной записи заняты';
                            break;
                        case 4:
                            msg = 'неверный логин или пароль';
                            break;
                        default:
                            msg = 'ошибка ' + refusalReason + 'при регистрации на сервере';
                    }
                    this.emit('error', new Error(msg));
                    this._disconnect();
                }
                break;
            }
            case 53: {
                // ответ на запрос всех каналов (получение количествоа каналов)
                // Size             VT_UI2
                // let size = data.readUInt16LE(offset);
                // offset += 2;
                // let tagCount = data.readUInt32LE(offset);
                // offset += 4;
                break;
            }
            case 54: {
                // ответ на запрос всех каналов (продолжение)
                /** @type {Channel2} */
                let channel = this._createEmptyChannel();
                // Size             VT_UI2
                // let size = data.readUInt16LE(offset);
                offset += 2;
                // Flags            VT_UI1      флаги
                let flags = data.readUInt8(offset++);
                channel.active = !!(flags&1);
                channel.writeEnable = !!(flags&8);
                channel.saveServer = !!(flags&16);
                // Id               VT_STRING   имя канала
                let channelNameLen = data.readUInt16LE(offset);
                offset += 2;
                channel.name = win1251toUtf8(data.toString('binary', offset, offset + channelNameLen));
                offset += channelNameLen;
                // Number           VT_UI4      идентификатор канала на сервере
                channel.number = data.readUInt32LE(offset);
                offset += 4;
                // Creator          VT_I2       создатель канала
                channel.creator = data.readInt16LE(offset);
                offset += 2;
                // Type             VT_UI2      тип данных канала
                channel.type = data.readUInt16LE(offset);
                offset += 2;
                // AttributeCount   VT_UI2      количество атрибутов
                let attrCount = data.readUInt16LE(offset);
                offset += 2;
                // Attributes       []          массив атрибутов
                for(let i=0; i < attrCount; i++) {
                    // чтение атрибута
                    /** @type {Attribute} */
                    let attr = {fromServer: true};
                    // AttributeId      VT_UI2
                    attr.id = data.readUInt16LE(offset);
                    offset += 2;
                    // AttributeType    VT_UI2
                    // AttributeValue   VARTYPE
                    let vtv = this._readVarTypeValue(data, offset);
                    attr.value = vtv.value;
                    offset += vtv.size;
                    // Owner            VT_I2
                    attr.owner = data.readInt16LE(offset);
                    offset += 2;
                    // AttributeDT      VT_R8
                    attr.dt = this._dateTimeToDate(data.readDoubleLE(offset));
                    offset += 8;
                    // добавляем атрибут к каналу
                    channel.attributes[attr.id] = attr;
                }
                // Owner            VT_I2       источник значения канала
                channel.owner = data.readUInt16LE(offset);
                offset += 2;
                // TimeStamp        VT_R8       метка времени канала
                channel.dt = this._dateTimeToDate(data.readDoubleLE(offset));
                offset += 8;
                // Quality          VT_UI1      качество канала
                channel.quality = data.readUInt8(offset++);
                // Value            VARTYPE     значение канала
                let vt = this._readVarTypeValue(data, offset, channel.type);
                channel.value = vt.value;
                offset += vt.size;
                // Groups           VT_UI4      принадлежность группам каналов
                channel.groups = data.readUInt32LE(offset);
                offset += 4;
                // сохраняем канал
                this.channels[channel.name] = channel;
                this.channelsNumbers[channel.number] = channel.name;
                // отправляем событие
                this.emit('channel', channel);
                //
                break;
            }
            case 57: {
                // получение состояния канала клиентом от сервера при его изменении или получение опросчиком команды управления
                // Size             VT_UI2
                // let size = data.readUInt16LE(offset);
                offset += 2;
                // Flag             VT_UI1
                let flags = data.readUInt8(offset++);
                let channelName;
                // Id или Number    VT_STRING или VT_UI4
                if(flags & 1) {
                    // Number
                    channelName = this._channelNameByNumber(data.readUInt32LE(offset));
                    offset += 4;
                } else {
                    // Id
                    let channelNameLen = data.readUInt16LE(offset);
                    offset += 2;
                    channelName = win1251toUtf8(data.toString('binary', offset, offset + channelNameLen));
                    offset += channelNameLen;
                }
                // TimeStamp        VT_R8
                let channelTime = this._dateTimeToDate(data.readDoubleLE(offset));
                offset += 8;
                // Quality          VT_UI1
                let quality = data.readUInt8(offset++);
                // Type             VT_UI2
                // Value            VARTYPE
                let cvt = this._readVarTypeValue(data, offset);
                offset += cvt.size;
                // Owner            VT_I2
                let owner = data.readInt16LE(offset);
                offset += 2;
                // такой канал есть?
                if(!(channelName in this.channels)) break;
                if(flags & 8) {
                    // пришла команда управления каналом
                    if(quality == stOk) {
                        // посыляем уведомление
                        this.emit('control', {
                            'name':     channelName,
                            'value':    cvt.value,
                            'dt':       channelTime,
                        });
                    }
                } else {
                    // пришло изменение состояния канала (режим клиент)
                    let channel = this.channels[channelName];
                    channel.value = cvt.value;
                    channel.quality = quality;
                    channel.dt = channelTime;
                    channel.owner = owner;
                    // посыляем уведомление
                    this.emit('channel', channel);
                }
                //
                break;
            }
            case 58: {
                // получение состояния атрибута канала клиентом или опросчиком от сервера при его изменении (команда 56 + Owner)
                // Size             VT_UI2
                // let size = data.readUInt16LE(offset);
                offset += 2;
                // Flag             VT_UI1
                let flags = data.readUInt8(offset++);
                // Id или Number    VT_STRING или VT_UI4
                let channelName;
                if(flags & 1) {
                    // Number
                    channelName = this._channelNameByNumber(data.readUInt32LE(offset));
                    offset += 4;
                    // если канал не найден, то его имя будет null
                } else {
                    // Id
                    let channelNameLen = data.readUInt16LE(offset);
                    offset += 2;
                    channelName = win1251toUtf8(data.toString('binary', offset, offset + channelNameLen));
                    offset += channelNameLen;
                }
                // AttributeId      VT_UI2
                let attrId = data.readUInt16LE(offset);
                offset += 2;
                // AttributeType    VT_UI2
                let vtv = this._readVarTypeValue(data, offset);
                offset += vtv.size;
                // AttributeDT      VT_R8
                let attrTime = this._dateTimeToDate(data.readDoubleLE(offset));
                offset += 8;
                // сохраняем атрибут
                if(typeof channelName === 'string') {
                    // если имя канала не null
                    this.channels[channelName].attributes[attrId] = {
                        'id':       attrId,
                        'value':    vtv.value,
                        'dt':       attrTime,
                        'fromServer': true
                    };
                }
                // Owner            VT_I2
                offset += 2;
                break;
            }
            case 59: {
                // получение описания канала со всеми атрибутами от сервера при его изменении или добавлении
                // похоже на команду 54, но нет значения канала
                /** @type {Channel2} */
                let channel = this._createEmptyChannel();
                // Size             VT_UI2
                offset += 2;
                // Flags            VT_UI1      флаги
                let flags = data.readUInt8(offset++);
                channel.active = !!(flags&1);
                channel.writeEnable = !!(flags&8);
                channel.saveServer = !!(flags&16);
                // Id               VT_STRING
                let channelNameLen = data.readUInt16LE(offset);
                offset += 2;
                channel.name = win1251toUtf8(data.toString('binary', offset, offset + channelNameLen));
                offset += channelNameLen;
                // Number           VT_UI4
                channel.number = data.readUInt32LE(offset);
                offset += 4;
                // Creator          VT_I2
                channel.creator = data.readInt16LE(offset);
                offset += 2;
                // Type             VT_UI2      тип данных канала
                channel.type = data.readUInt16LE(offset);
                offset += 2;
                // AttributeCount   VT_UI2      количество атрибутов
                let attrCount = data.readUInt16LE(offset);
                offset += 2;
                // Attributes       []          массив атрибутов
                for(let i=0; i < attrCount; i++) {
                    // чтение атрибута
                    /** @type {Attribute} */
                    let attr = {
                        fromServer: true
                    };
                    // AttributeId      VT_UI2
                    attr.id = data.readUInt16LE(offset);
                    offset += 2;
                    // AttributeType    VT_UI2
                    // AttributeValue   VARTYPE
                    let vtv = this._readVarTypeValue(data, offset);
                    attr.value = vtv.value;
                    offset += vtv.size;
                    // Owner            VT_I2
                    attr.owner = data.readInt16LE(offset);
                    offset += 2;
                    // AttributeDT      VT_R8
                    attr.dt = this._dateTimeToDate(data.readDoubleLE(offset));
                    offset += 8;
                    // добавляем атрибут к каналу
                    channel.attributes[attr.id] = attr;
                }
                // Groups           VT_UI4
                channel.groups = data.readUInt32LE(offset);
                offset += 4;
                // разбор
                if(channel.name in this.channels) {
                    // канал уже существует, изменились настройки
                    // поменяться могут атрибуты и флаги
                    let ch = this.channels[channel.name];
                    //
                    ch.active = channel.active;
                    ch.writeEnable = channel.writeEnable;
                    ch.saveServer = channel.saveServer;
                    ch.groups = channel.groups;
                    ch.attributes = channel.attributes;
                    // уведомление о изменении
                    this.emit('change', ch);
                } else {
                    // добавлен новый канал
                    channel.dt = new Date();
                    this.channels[channel.name] = channel;
                    this.channelsNumbers[channel.number] = channel.name;
                    // уведомление о добавлении канала
                    this.emit('add', channel);
                }
                break;
            }
            case 60: {
                // ответ на регистрацию канала 2 на сервере, изменение активности канала на сервере
                // Size             VT_UI2
                // let size = data.readUInt16LE(offset);
                offset += 2;
                // Flag             VT_UI1
                let flags = data.readUInt8(offset++);
                // Id               VT_STRING
                let channelNameLen = data.readUInt16LE(offset);
                offset += 2;
                let channelName = win1251toUtf8(data.toString('binary', offset, offset + channelNameLen));
                offset += channelNameLen;
                // Number           VT_UI4
                let channelNumber = data.readUInt32LE(offset);
                offset += 4;
                // AttributeCount   VT_UI2
                var attrCount = data.readUInt16LE(offset);
                offset += 2;
                // Attributes
                var recAttributes = [];
                for(let i=0; i<attrCount; i++) {
                    // идентификатор атрибута
                    let attrId = data.readUInt16LE(offset);
                    offset += 2;
                    // тип значения атрибута
                    let vtv = this._readVarTypeValue(data, offset);
                    offset += vtv.size;
                    // время атрибута
                    let attrTime = this._dateTimeToDate(data.readDoubleLE(offset));
                    offset += 8;
                    // сохраняем атрибут
                    recAttributes.push({
                        'id':       attrId,
                        'value':    vtv.value,
                        'dt':       attrTime,
                        'fromServer': true
                    });
                }
                // разбор принятого
                if(channelName in this.channels) {
                    // такой канал у нас есть
                    this.channelsNumbers[channelNumber] = channelName;
                    let channel = this.channels[channelName];
                    channel.number = channelNumber;
                    let oldActive = channel.active;
                    channel.active = !!(flags & 1);
                    // записываем принятые атрибуты
                    for(let i=0; i<recAttributes.length; i++) {
                        channel.attributes[recAttributes[i].id] = recAttributes[i];
                    }
                    // проверка на смену активности
                    if(channel.active && !oldActive) {
                        if(channel.needSend) {
                            // если появилась активность, то передаем значение канала
                            this._sendChannel(channel);
                            channel.needSend = false;
                        }
                    }
                }
                //
                break;
            }
            case 61: {
                // удаление канала / изменение активности канала / удаление атрибута
                // Size             VT_UI2
                // let size = data.readUInt16LE(offset);
                offset += 2;
                // Flag             VT_UI1
                let flags = data.readUInt8(offset++);
                // Number или Id    VT_UI4 или VT_STRING
                let channelName;
                if(flags & 1) {
                    // Number       VT_UI4
                    channelName = this._channelNameByNumber(data.readUInt32LE(offset));
                    offset += 4;
                    // если канал не найден, то его имя будет null
                } else {
                    // Id           VT_STRING
                    let channelNameLen = data.readUInt16LE(offset);
                    offset += 2;
                    channelName = win1251toUtf8(data.toString('binary', offset, offset + channelNameLen));
                    offset += channelNameLen;
                }
                // AttrId           VT_UI2
                let attrId = data.readUInt16LE(offset);
                // проверка наличия канала
                if(channelName === null) break;
                if(!(channelName in this.channels)) break;
                let channel = this.channels[channelName];
                //
                if(flags & 2) {
                    // удаление канала
                    delete this.channelsNumbers[channel.number];
                    delete this.channels[channelName];
                    // событие удаления канала
                    this.emit('delete', channelName)
                } else
                if(flags & 4) {
                    // удаление атрибута
                    if(attrId in channel.attributes) {
                        delete channel.attributes[attrId];
                        // событие удаления атрибута
                        this.emit('delete', channelName, attrId);
                    }
                } else 
                if(flags & 8) {
                    // изменение активности канала
                    let oldActive = channel.active;
                    channel.active = !!(flags & 16);
                    // проверка на смену активности
                    if(channel.active && !oldActive) {
                        if(channel.needSend) {
                            // если появилась активность, то передаем значение канала
                            this._sendChannel(channel);
                            channel.needSend = false;
                        }
                    }
                }
                // (flags & 16) - подтверждение моей команды на удаление канала/атрибута
                break;
            }
            case 63: {
                // ответ на запрос данных сервера в произвольном формате
                break;
            }
            case 66: {
                // ответ на удаление канала / удаление атрибута / изменение активности канала / изменение маски групп каналов
                // расширенный вариант команды 61
                // Cmd              VT_UI1
                // Size             VT_UI2
                // let size = data.readUInt16LE(offset);
                offset += 2;
                // Flag             VT_UI1
                let flags = data.readUInt8(offset++);
                // Number или Id    VT_UI4 или VT_STRING
                let channelName;
                if(flags & 1) {
                    // Number       VT_UI4
                    channelName = this._channelNameByNumber(data.readUInt32LE(offset));
                    offset += 4;
                    // если канал не найден, то его имя будет null
                } else {
                    // Id           VT_STRING
                    let channelNameLen = data.readUInt16LE(offset);
                    offset += 2;
                    channelName = win1251toUtf8(data.toString('binary', offset, offset + channelNameLen));
                    offset += channelNameLen;
                }
                // ActionType       VT_UI1
                let actionType = data.readUInt8(offset++);
                // ActionData       VT_UI4
                let actionData = data.readUInt32(offset);
                offset += 4;
                // проверка наличия канала
                if(channelName === null) break;
                if(!(channelName in this.channels)) break;
                let channel = this.channels[channelName];
                //
                switch(actionType) {
                    case 1: {
                        // удаление канала
                        delete this.channelsNumbers[channel.number];
                        delete this.channels[channelName];
                        // событие удаления канала
                        this.emit('delete', channelName)
                        break;
                    }
                    case 2: {
                        // удаление атрибута
                        if(actionData in channel.attributes) {
                            delete channel.attributes[actionData];
                            // событие удаления атрибута
                            this.emit('delete', channelName, actionData);
                        }
                        break;
                    }
                    case 3: {
                        // изменение активности канала
                        let oldActive = channel.active;
                        channel.active = !!actionData;
                        // проверка на смену активности
                        if(channel.active && !oldActive) {
                            if(channel.needSend) {
                                // если появилась активность, то передаем значение канала
                                this._sendChannel(channel);
                                channel.needSend = false;
                            }
                        }
                        break;
                    }
                    case 4: {
                        // изменение маски групп каналов
                        channel.groups = actionData;
                        break;
                    }
                }
                break;
            }
            case 100: {
                // ответ на запрос статуса
                // Error            VT_UI2
                // An               VT_UI2
                // Reserve          VT_UI1[8]
                // если ожидаю ответа, то посылаю событие с задержкой
                if(this.waitStatus) {
                    this.emit('checkConnection', Date.now() - this.waitStatus);
                    this.waitStatus = 0;
                }
                break;
            }
        }
    }
    /**
     * Возвращает размер структуры команды по номеру.
     * Результат 0 означает, что размер структуры присутствует в самой структуре
     * @private
     * @param {number} cmd - идентификатор команды
     * @returns {number}
     */
    _structSize(cmd) {
        switch (cmd) {
            case 2:
                return 16;
            case 7:
                return 53;
            case 8:
                return 55;
            case 9:
                return 57;
            case 10:
                return 60;
            case 20:
                return 41;
            case 21:
                return 39;
            case 22:
                return 15;
            case 23:
                return 5;
            case 24:
                return 1;
            case 25:
                return 10;
            case 34:
                return 99;
            case 43:
                return 25;
            case 100:
                return 13;
            default:
                return 0;
        }
    }
    /**
     * Отправка структуры управления каналом
     * @private
     * @param {string} name 
     * @param {*} value 
     * @returns {boolean}
     */
    _sendControlStruct(name, value) {
        // Cmd          UI1     55
        // Size         UI2
        // Flag         UI1
        // Number       UI4
        // TimeStamp    R8
        // Quality      UI1
        // Type         UI2
        // Value        VARTYPE
        if(!(name in this.channels)) return false;
        let channel = this.channels[name];
        if(!(channel.active && channel.writeEnable && ('creator' in channel))) return false;
        //
        var buf = Buffer.allocUnsafe(4096);
        // Cmd          UI1     55
        let offset = buf.writeUInt8(55, 0);
        // Size         UI2     пока пропускаем
        offset += 2;
        // Flag         UI1     00001101
        offset = buf.writeUInt8(13, offset);
        // Number       UI4
        offset = buf.writeUInt32LE(channel.number, offset);
        // TimeStamp    R8
        offset = buf.writeDoubleLE(this._dateToDateTime(new Date()), offset);
        // Quality      UI1
        offset = buf.writeUInt8(stOk, offset);
        // Type         UI2
        // Value        VARTYPE
        offset += this._writeVarTypeValue(value, channel.type).copy(buf, offset);
        // Size         UI2
        buf.writeUInt16LE(offset, 1);
        // передача
        this.socket.write(buf.slice(0, offset));
    }
    /**
     * Отправка структуры регистрации
     * @private
     */
    _sendRegisterStruct() {
        // Cmd:         UI1     42
        // Type:        UI1     2-опрос, 4-клиент
        // Name:        I1[40]  логин (ASCIIZ)
        // Pass:        I1[20]  пароль (ASCIIZ)
        // HiVer        UI1
        // LoVer        UI1
        // Flags        UI1
        // Reserved:    UI1[7]  должны быть 0
        var buf = Buffer.alloc(72);
        //
        let offset = buf.writeUInt8(42, 0);
        //
        let role = 0;
        if(this.options.opros) role += 2;
        if(this.options.client) role += 4;
        offset = buf.writeUInt8(role, offset);
        //
        buf.write(this._asciiz(this.options.login, 40), offset, 40, 'ascii');
        offset += 40;
        //
        buf.write(this._asciiz(this.options.password, 20), offset, 20, 'ascii');
        offset += 20;
        //
        offset = buf.writeUInt8(clientHiVersion, offset);
        offset = buf.writeUInt8(clientLoVersion, offset);
        // флаги 00000100
        offset = buf.writeUInt8(4, offset);
        // передача
        this.socket.write(buf);
    }
    /**
     * Запуск процедуры проверки связи с сервером
     * @private
     */
    _checkConnection() {
        if(this.waitStatus) {
            // если установлен признак проверки связи с сервером и ответ не пришел значит все плохо
            this.emit('error', new Error('нет ответа при проверке соединения с сервером'));
            this._disconnect();
        } else {
            // передаю пакет запроса статуса
            this._sendRequestStatus();
            // фиксирую время отправки
            this.waitStatus = Date.now();
        }
    }
    /**
     * Отправка запроса статуса
     * @private
     */
    _sendRequestStatus() {
        // Cmd:         UI1     18
        var buf = Buffer.allocUnsafe(1);
        buf.writeUInt8(18, 0);
        // передача
        this.socket.write(buf);
    }
    /**
     * Отправка запроса описаний и значений всех каналов, используется в режиме клиента
     * @private
     */
    _sendRequestAllChannels() {
        // Cmd          UI1     52
        // Size         UI2     4
        // Regim        UI1     
        var buf = Buffer.allocUnsafe(4);
        buf.writeUInt8(52, 0);
        buf.writeUInt16LE(4, 1);
        buf.writeUInt8(1, 3);
        // передача
        this.socket.write(buf);
    }
    /**
     * Отправка всего: регистрация каналов, значений, атрибутов...
     * @private
     */
    _sendAll() {
        Object.keys(this.channels).forEach(name => {
            let channel = this.channels[name];
            // регистрация каналов
            if(channel.needRegister) {
                this._registerChannel(channel);
                channel.needRegister = false;
            }
            // отправка данных
            if(channel.needSend && channel.active) {
                this._sendChannel(channel);
                channel.needSend = false;
            }
        });
    }
    /**
     * Регистрация канала на сервере
     * @private
     * @param {Channel2} channel регистрируемый канал
     */
    _registerChannel(channel) {
        // Cmd          UI1         51      команда
        // Size         UI2                 размер
        // Flag         UI2                 флаги
        // Name         VT_STRING           имя канала
        // Type         UI2                 тип канала
        // AttrCount    UI2                 количество атрибутов
        // Attributes                       массив атрибутов
        var buf = Buffer.allocUnsafe(4096);
        // команда
        var offset = buf.writeUInt8(51, 0);
        // размер структуры пока не пишем
        offset += 2;
        // флаги
        var flags = 2 + 4 + 16 + 32 + 128;          // жду ответа + чужие атрибуты + оповещения + изменения атрибутов + время в TDateTime
        if(channel.writeEnable) flags += 8;         // разрешение записи
        if(channel.saveServer) flags += 512;        // сохранять на сервере
        offset = buf.writeUInt16LE(flags, offset);
        // имя канала
        offset += this._vt_string(channel.name).copy(buf, offset);
        // тип
        offset = buf.writeUInt16LE(channel.type, offset);
        // количество атрибутов запишем потом, когда будет ясно их количество
        var attrCountOffset = offset;
        var attrCount = 0;
        offset += 2;
        // цикл по атрибутам
        Object.keys(channel.attributes).forEach(attrId => {
            let attr = channel.attributes[attrId];
            if(!attr.fromServer) {
                // отправляем только те атрибуты, которые не были присланы с сервера
                offset += this._attributeToBuffer(attr).copy(buf, offset);
                attrCount++;
            }
        });
        // пишем количество атрибутов
        buf.writeUInt16LE(attrCount, attrCountOffset);
        // добавляем размер структуры
        buf.writeUInt16LE(offset, 1);
        // передача на сервер
        this.socket.write(buf.slice(0, offset));
    }
    /**
     * Отправка канала на сервер
     * @private
     * @param {Channel2} channel 
     */
    _sendChannel(channel) {
        // Cmd              UI1         55                  команда
        // Size             UI2                             размер
        // Flag             UI1                             флаги
        // Id или Number    VT_STRING или VT_UI4            имя канала
        // Time             R8                              дата и время
        // Quality          UI1
        // Type             UI2
        // Value            VARTYPE
        var buf = Buffer.allocUnsafe(4096);
        // команда
        var offset = buf.writeUInt8(55, 0);
        // размер структуры пока не пишем
        offset += 2;
        // флаги
        var flags = (channel.number>=0)?5:4;
        offset = buf.writeUInt8(flags, offset);
        // имя канала
        if(channel.number >= 0) {
            // номер канала
            offset = buf.writeUInt32LE(channel.number, offset);
        } else {
            // имя канала
            offset += this._vt_string(channel.name).copy(buf, offset);
        }
        // время
        offset = buf.writeDoubleLE(this._dateToDateTime(channel.dt), offset);
        // качество
        offset = buf.writeUInt8(channel.quality, offset);
        if(channel.quality === stOk) {
            // тип и значение
            offset += this._writeVarTypeValue(channel.value, channel.type).copy(buf, offset);
        } else {
            // если качество <> 0, то пишем пустое значение
            offset += this._writeVarTypeValue(0, VT_EMPTY).copy(buf, offset);
        }
        // добавляем размер структуры
        buf.writeUInt16LE(offset, 1);
        // передача на сервер
        this.socket.write(buf.slice(0, offset));
    }
    /**
     * Создание объекта атрибута канала
     * @private
     * @param {number} id - идентификатор атрибута
     * @param {*} value - значение атрибута
     * @returns {Attribute}
     */
    _createAttribute(id, value) {
        return {
            'id':           id,
            'value':        value,
            'dt':           new Date(),
            'fromServer':   false
        };
    }
    /**
     * Запись атрибута в буфер
     * @private
     * @param {Attribute} attr - атрибут
     * @returns {Buffer}
     */
    _attributeToBuffer(attr) {
        var buf = Buffer.allocUnsafe(1024);
        // проверка типа атрибута
        if(!(attr.id in validAttributes)) throw new Error('атрибут с неизвестным идентификатором id:' + attr.id);
        var attrType = validAttributes[attr.id];
        // id
        var offset = buf.writeUInt16LE(attr.id, 0);
        // значение атрибута
        offset += this._writeVarTypeValue(attr.value, attrType).copy(buf, offset);
        // время последнего изменения
        offset = buf.writeDoubleLE(this._dateToDateTime(attr.dt), offset);
        // возвращаем нужный кусок буфера
        return buf.slice(0, offset);
    }
    /**
     * Чтение значения переменного типа из буфера
     * @private
     * @param {Buffer} buf - буфер
     * @param {number} offset - смещение в буфере
     * @param {number} [type] - тип (необязательный параметр), если не указан, то тип читается из буфера
     * @returns {VarType} 
     */
    _readVarTypeValue(buf, offset, type) {
        let start = offset;
        /** @type {VarType} */
        let result = {};
        //
        if(type === undefined) {
            // если тип не указан, то читаем его из буфера
            result.type = buf.readUInt16LE(offset);
            offset += 2;
        } else {
            result.type = type;
        }
        //
        if(result.type & VT_ARRAY) {
            // одномерный массив, читаем количество элементов
            let len = buf.readUInt16LE(offset);
            offset += 2;
            //
            result.value = [];
            for(let i=0; i<len; i++) {
                // элементы массива
                let vtv = this._readVarTypeValuePrimitive(buf, offset, result.type & VT_MASK);
                result.value.push(vtv.value);
                offset += vtv.size;
            }
        } else {
            // простая переменная
            let vtv = this._readVarTypeValuePrimitive(buf, offset, result.type);
            result.value = vtv.value;
            offset += vtv.size;
        }
        //
        result.size = offset - start;
        return result;
    }
    /**
     * Чтение простого типа данных (не массива) из буфера
     * @private
     * @param {Buffer} buf - буфер
     * @param {number} offset - смещение в буфере
     * @param {number} type - тип данных
     * @returns {VarType} 
     */
    _readVarTypeValuePrimitive(buf, offset, type) {
        let start = offset;
        let result = {};
        //
        switch(type) {
            case VT_EMPTY: {
                result.value = null;
                break;
            }
            case VT_I2: {
                result.value = buf.readInt16LE(offset);
                offset += 2;
                break;
            }
            case VT_I4: {
                result.value = buf.readInt32LE(offset);
                offset += 4;
                break;
            }
            case VT_R4: {
                result.value = buf.readFloatLE(offset);
                offset += 4;
                break;
            }
            case VT_R8: {
                result.value = buf.readDoubleLE(offset);
                offset += 8;
                break;
            }
            case VT_DATE: {
                result.value = this._dateTimeToDate(buf.readDoubleLE(offset));
                offset += 8;
                break;
            }
            case VT_BOOL: {
                result.value = buf.readInt16LE(offset) == -1;
                offset += 2;
                break;
            }
            case VT_I1: {
                result.value = buf.readInt8(offset);
                offset += 1;
                break;
            }
            case VT_UI1: {
                result.value = buf.readUInt8(offset);
                offset += 1;
                break;
            }
            case VT_UI2: {
                result.value = buf.readUInt16LE(offset);
                offset += 2;
                break;
            }
            case VT_UI4: {
                result.value = buf.readUInt32LE(offset);
                offset += 4;
                break;
            }
            case VT_STRING: {
                let len = buf.readUInt16LE(offset);
                offset += 2;
                result.value = win1251toUtf8(buf.toString('binary', offset, offset + len));
                offset += len;
                break;
            }
            default:
                throw new Error('неподдерживаемый тип данных type:' + type);
        }
        result.size = offset - start;
        return result;
    }
    /**
     * Запись значения переменного типа в буфер
     * @private
     * @param {*} value значение
     * @param {number} type тип
     * @returns {Buffer}
     */
    _writeVarTypeValue(value, type) {
        /** @type {Buffer} */
        var buf = Buffer.allocUnsafe(4096);
        // запись типа переменной
        var offset = buf.writeUInt16LE(type, 0);
        //
        if((type & VT_ARRAY) && Array.isArray(value)) {
            // одномерный массив, кладем количество элементов
            offset = buf.writeUInt16LE(value.length, offset);
            //
            for(let i=0; i<value.length; i++) {
                // элементы массива
                offset += this._writeVarTypeValuePrimitive(value[i], type & VT_MASK).copy(buf, offset);
            }
        } else {
            // простая переменная
            offset += this._writeVarTypeValuePrimitive(value, type & VT_MASK).copy(buf, offset);
        }
        // возвращаем кусок буфера
        return buf.slice(0, offset);
    }
    /**
     * Запись значения простого переменного типа (не массива) в буфер
     * @private
     * @param {*} value значение
     * @param {number} type тип
     * @returns {Buffer}
     */
    _writeVarTypeValuePrimitive(value, type) {
        /** @type {Buffer} */
        var buf = Buffer.allocUnsafe(1024);
        var offset = 0;
        //
        switch(type) {
            case VT_EMPTY:
                break;
            case VT_I2:
                offset = buf.writeInt16LE(value, offset);
                break;
            case VT_I4:
                offset = buf.writeInt32LE(value, offset);
                break;
            case VT_R4:
                offset = buf.writeFloatLE(value, offset);
                break;
            case VT_R8:
                offset = buf.writeDoubleLE(value, offset);
                break;
            case VT_DATE:
                if(typeof value.getMonth === 'function') {
                    offset = buf.writeDoubleLE(this._dateToDateTime(value), offset);
                } else {
                    offset = buf.writeDoubleLE(value, offset);
                }
                break;
            case VT_BOOL:
                if(value) {
                    offset = buf.writeInt16LE(-1, offset);
                } else {
                    offset = buf.writeInt16LE(0, offset);
                }
                break;
            case VT_I1:
                offset = buf.writeInt8(value, offset);
                break;
            case VT_UI1:
                offset = buf.writeUInt8(value, offset);
                break;
            case VT_UI2:
                offset = buf.writeUInt16LE(value, offset);
                break;
            case VT_UI4:
                offset = buf.writeUInt32LE(value, offset);
                break;
            case VT_STRING:
                offset += this._vt_string(value).copy(buf, offset);
                break;
            default:
                throw new Error('неподдерживаемый тип данных type:' + type);
        }
        // возвращаем кусок буфера
        return buf.slice(0, offset);
    }
    /**
     * Преобразование строки в ASCIIZ
     * @private
     * @param {string} str строка
     * @param {number} len нужная длинна
     * @returns {string}
     */
    _asciiz(str, len) {
        str = utf8ToWin1251(str);
        //
        if(str.length >= len) str = str.substring(0, len);
        while(str.length < len) str += '\0';
        return str;
    }
    /**
     * Запись строки в буфер в соответствии с форматом VT_STRING
     * @private
     * @param {string} str строка
     * @returns {Buffer}
     */
    _vt_string(str) {
        str = utf8ToWin1251(str);
        //
        var buf = Buffer.allocUnsafe(str.length + 2);
        buf.writeUInt16LE(str.length, 0);
        buf.write(str, 2, 'binary');
        return buf;
    }
    /**
     * Возвращает объект Date для указанной даты и времени с учетом time zone сервера
     * @private
     * @param {number} serverDateTime время сервера в формате TDateTime
     * @returns {Date}
     */
    _dateTimeToDate(serverDateTime) {
        return new Date((serverDateTime - 25569)*86400000 + this.serverTimeBias*60000);
    }
    /**
     * Преобразование объекта Date в тип TDateTime
     * @private
     * @param {Date} date объект
     * @returns {number}
     */
    _dateToDateTime(date) {
        return (date.valueOf() - this.serverTimeBias*60000)/86400000 + 25569;
    }
    /**
     * Возвращает имя канала по его номеру
     * @private
     * @param {number} number номер канала
     * @returns {string}
     */
    _channelNameByNumber(number) {
        if(number in this.channelsNumbers) {
            return this.channelsNumbers[number];
        } else {
            return null;
        }
    }
    /**
     * Создает пустой канал
     * @private
     * @returns {Channel2}
     */
    _createEmptyChannel() {
        return {
            name: '',
            quality: stOff,
            needRegister: false,
            needSend: false,
            active: false,
            writeEnable: false,
            saveServer: false,
            attributes: {}
        }
    }
}

module.exports = {
    'LMClient': LMClient,
    //
    'stOk':             stOk,
    'stError':          stError,
    'stFailure':        stFailure,
    'stWrong':          stWrong,
    'stNotConnected':   stNotConnected,
    'stTempOff':        stTempOff,
    'stOff':            stOff,
    'stBadConnection':  stBadConnection,
    'stRegFailure':     stRegFailure,
    //
    'VT_EMPTY':         VT_EMPTY,
    'VT_I2':            VT_I2,
    'VT_I4':            VT_I4,
    'VT_R4':            VT_R4,
    'VT_R8':            VT_R8,
    'VT_DATE':          VT_DATE,
    'VT_BOOL':          VT_BOOL,
    'VT_I1':            VT_I1,
    'VT_UI1':           VT_UI1,
    'VT_UI2':           VT_UI2,
    'VT_UI4':           VT_UI4,
    'VT_STRING':        VT_STRING,
    'VT_ARRAY':         VT_ARRAY
};
