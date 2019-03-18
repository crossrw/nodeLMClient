/*jshint esversion: 6 */
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
validAttributes[ATTR_EUType]             = VT_STRING;
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
 * Канал сервера (тип2)
 * @typedef {Object} Сhannel2
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
 * @property {Object}  attributes - массив атрибутов
 */
/**
 * Атрибут канал (тип2)
 * @typedef {Object} Attribute
 * @property {number} id - идентификатор
 * @property {*} value - значение
 * @property {Date} dt - дата изменения
 * @property {boolean} fromServer - получен от сервера
 */
/**
 * Значение переменного типа
 * @typedef {Object} VarType
 * @property {(number|string|boolean|number[]|string[]|boolean[])} value - значение
 * @property {number} type - тип
 * @property {number} size - размер
 */

const win1251Map = {0: 0, 1: 1, 2: 2, 3: 3, 4: 4, 5: 5, 6: 6, 7: 7, 8: 8, 9: 9, 10: 10, 11: 11, 12: 12, 13: 13, 14: 14, 15: 15, 16: 16, 17: 17, 18: 18, 19: 19, 20: 20, 21: 21, 22: 22, 23: 23, 24: 24, 25: 25, 26: 26, 27: 27, 28: 28, 29: 29, 30: 30, 31: 31, 32: 32, 33: 33, 34: 34, 35: 35, 36: 36, 37: 37, 38: 38, 39: 39, 40: 40, 41: 41, 42: 42, 43: 43, 44: 44, 45: 45, 46: 46, 47: 47, 48: 48, 49: 49, 50: 50, 51: 51, 52: 52, 53: 53, 54: 54, 55: 55, 56: 56, 57: 57, 58: 58, 59: 59, 60: 60, 61: 61, 62: 62, 63: 63, 64: 64, 65: 65, 66: 66, 67: 67, 68: 68, 69: 69, 70: 70, 71: 71, 72: 72, 73: 73, 74: 74, 75: 75, 76: 76, 77: 77, 78: 78, 79: 79, 80: 80, 81: 81, 82: 82, 83: 83, 84: 84, 85: 85, 86: 86, 87: 87, 88: 88, 89: 89, 90: 90, 91: 91, 92: 92, 93: 93, 94: 94, 95: 95, 96: 96, 97: 97, 98: 98, 99: 99, 100: 100, 101: 101, 102: 102, 103: 103, 104: 104, 105: 105, 106: 106, 107: 107, 108: 108, 109: 109, 110: 110, 111: 111, 112: 112, 113: 113, 114: 114, 115: 115, 116: 116, 117: 117, 118: 118, 119: 119, 120: 120, 121: 121, 122: 122, 123: 123, 124: 124, 125: 125, 126: 126, 127: 127, 1027: 129, 8225: 135, 1046: 198, 8222: 132, 1047: 199, 1168: 165, 1048: 200, 1113: 154, 1049: 201, 1045: 197, 1050: 202, 1028: 170, 160: 160, 1040: 192, 1051: 203, 164: 164, 166: 166, 167: 167, 169: 169, 171: 171, 172: 172, 173: 173, 174: 174, 1053: 205, 176: 176, 177: 177, 1114: 156, 181: 181, 182: 182, 183: 183, 8221: 148, 187: 187, 1029: 189, 1056: 208, 1057: 209, 1058: 210, 8364: 136, 1112: 188, 1115: 158, 1059: 211, 1060: 212, 1030: 178, 1061: 213, 1062: 214, 1063: 215, 1116: 157, 1064: 216, 1065: 217, 1031: 175, 1066: 218, 1067: 219, 1068: 220, 1069: 221, 1070: 222, 1032: 163, 8226: 149, 1071: 223, 1072: 224, 8482: 153, 1073: 225, 8240: 137, 1118: 162, 1074: 226, 1110: 179, 8230: 133, 1075: 227, 1033: 138, 1076: 228, 1077: 229, 8211: 150, 1078: 230, 1119: 159, 1079: 231, 1042: 194, 1080: 232, 1034: 140, 1025: 168, 1081: 233, 1082: 234, 8212: 151, 1083: 235, 1169: 180, 1084: 236, 1052: 204, 1085: 237, 1035: 142, 1086: 238, 1087: 239, 1088: 240, 1089: 241, 1090: 242, 1036: 141, 1041: 193, 1091: 243, 1092: 244, 8224: 134, 1093: 245, 8470: 185, 1094: 246, 1054: 206, 1095: 247, 1096: 248, 8249: 139, 1097: 249, 1098: 250, 1044: 196, 1099: 251, 1111: 191, 1055: 207, 1100: 252, 1038: 161, 8220: 147, 1101: 253, 8250: 155, 1102: 254, 8216: 145, 1103: 255, 1043: 195, 1105: 184, 1039: 143, 1026: 128, 1106: 144, 8218: 130, 1107: 131, 8217: 146, 1108: 186, 1109: 190};
/**
 * Преобразование строки UTF-8 в Windows-1251
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
 * @class Класс клиента сервера LM
 * @event LMClient#connecting
 * @event LMClient#connect
 * @event LMClient#disconnect
 * @event LMClient#loggedIn
 * @event LMClient#checkConnection
 * @event LMClient#timeSynchronize
 * @event LMClient#data
 * @event LMClient#error
 */
class LMClient extends EventEmitter {
    /**
     * Конструктор
     * @param {Object} options Параметры подключения к серверу
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
        //
        this.waitStatus = 0;                        // признак ожидания запрошенного статуса
        this.loggedIn = false;                      // клиент зарегистрирован на сервере
        this.connected = false;                     // клиент подключен к серверу
        this.serverVersion = 0;                     // версия сервера
        this.serverTimeBias = 0;                    // смещение времени сервера
        this.reconnectTimer = null;                 // таймер повторных соединений
        this.checkConnTimer = null;                 // таймер проверки связи
        this.checkConnectInterval = 480000;         // интервал проверки связи с сервером в мс
        /**
         * ассоциативный массив каналов
         * @type {Object}
         */
        this.channels = {};
        /**
         * ассоциативный массив номеров каналов на сервере
         * @type {Object}
         */
        this.channelsNumbers = {};
    }
    /**
     * Подключение и регистрация на сервере LM
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
     * Отключиться от сервера
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
            channel.needRegister = true;
            channel.needSend = ('value' in _this.channels[name]);
            channel.active = false;
            channel.number = -1;
        });
        // сброс номеров каналов
        this.channelsNumbers = {};
        // закрытие сокета
        this.socket.destroy();
    }
    /**
     * Добавляем канал
     * @param {string} name Имя канала
     * @param {number} type Тип канала
     * @param {string} [units] Единицы измерения
     * @param {string} [comment] Текстовое описание
     * @param {number} [signification=0] Назначение
     * @param {boolean} [writeEnable=false] Разрешение записи значений
     * @param {boolean} [saveServer=false] Сохранять значение на сервере при отключении источника
     * @returns {boolean}
     */
    addChannel(name, type, units, comment, signification, writeEnable, saveServer) {
        // проверка на корректность типа данных
        if(type > 8191) return false;
        if(!validTypes.includes(type & 4095)) return false;
        // проверка на дублирование имени
        if(name in this.channels) return false;
        // создаем канал
        var channel = {
            'name': name,
            'type': type,
            'dt': new Date(),
            'needRegister': true,
            'needSend': false,
            'active': false,
            'writeEnable': writeEnable || false,
            'saveServer': saveServer || false,
            'number': -1,
            'attributes': {}
        };
        // атрибуты
        if(typeof units === 'string' && units.length > 0) {
            channel.attributes[ATTR_UNITS] = this._createAttribute(ATTR_UNITS, units);
        }
        if(typeof comment === 'string' && comment.length > 0) {
            channel.attributes[ATTR_COMMENT] = this._createAttribute(ATTR_COMMENT, comment);
        }
        if(typeof signification === 'number' && signification > 0) {
            channel.attributes[ATTR_SIGNIFICATION] = this._createAttribute(ATTR_SIGNIFICATION, signification);
        }
        // добавляем канал
        this.channels[name] = channel;
        // передача на сервер
        if(this.loggedIn) this._sendAll();
        //
        return true;
    }
    /**
     * Установка значения канала
     * @param {string} name Имя канала
     * @param {*} value Новое значение канала
     */
    setValue(name, value) {
        // проверка на наличие канала
        if(!(name in this.channels)) return false;
        let channel = this.channels[name];
        // проверка на изменения
        if((channel.quality == stOk) && (channel.value == value)) return true;
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
     * Установка качества канала
     * @param {string} name Имя канала
     * @param {number} quality Новое значение качества
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
     * Отключение от сервера с последующим возможным повторным подключением
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
     * @param {Buffer} data буфер с данными
     */
    _onReceiveData(data) {
        // что-то пришло от сервера
        // console.log('receive data length:' + data.length);
        var size = 0;
        var flags = 0;
        var offset = 0;
        var channelName = '';
        var channelNumber = 0;
        var channelNameLen = 0;
        var serverDateTime = 0;
        try {
            while (offset < data.length) {
                // читаю команду
                var cmd = data.readUInt8(offset++);

                console.log('receive command:' + cmd);

                switch(cmd) {
                    case 2:
                        // старый ответ на регистрацию
                        offset += 15;
                        break;
                    case 7:
                        // конфигурация A1
                        offset += 52;
                        break;
                    case 8:
                        // конфигурация A2
                        offset += 54;
                        break;
                    case 9:
                        // конфигурация A3
                        offset += 56;
                        break;
                    case 10:
                        // конфигурация A4 старая
                        offset += 59;
                        break;
                    case 20:
                        // информация о состоянии канала 1
                        offset += 40;
                        break;
                    case 21:
                        // управление каналом 1
                        offset += 38;
                        break;
                    case 22:
                        // синхронизация времени
                        // ServerTime       VT_DATE
                        serverDateTime = data.readDoubleLE(offset);
                        offset += 8;
                        // Reserved         VT_UI1[6]
                        offset += 6;
                        //
                        this.emit('timeSynchronize', this._dateTimeToDate(serverDateTime));
                        break;
                    case 23:
                        // извещение клиентам
                        // Message          VT_UI1
                        // Reserved         VT_UI1[3]
                        offset += 4;
                        break;
                    case 34:
                        // конфигурация A4 новая
                        offset += 98;
                        break;
                    case 43:
                        // ответ на регистрацию клиента
                        // Id               VT_I4
                        var clientId = data.readInt32LE(offset);
                        offset += 4;
                        // Reserved1        VT_UI1
                        offset++;
                        // ServerTime       VT_DATE
                        serverDateTime = data.readDoubleLE(offset);
                        offset += 8;
                        // HiVer            VT_UI1
                        var hiVer = data.readUInt8(offset++);
                        // LoVer            VT_UI1
                        var loVer = data.readUInt8(offset++);
                        // Reserved2        VT_UI2
                        // Reserved3        VT_UI2
                        offset += 4;
                        // RefusalReason    VT_UI1
                        var refusalReason = data.readUInt8(offset++);
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
                    case 53:
                        // ответ на запрос всех каналов (начало)
                        size = data.readUInt16LE(offset);
                        offset += 2;
                        //
                        offset += (size - 3);
                        break;
                    case 54:
                        // ответ на запрос всех каналов (продолжение)
                        size = data.readUInt16LE(offset);
                        offset += 2;
                        //
                        offset += (size - 3);
                        break;
                    case 57:
                        // получение состояния канала клиентом от сервера при его изменении или получение опросчиком команды управления
                        // Size             VT_UI2
                        size = data.readUInt16LE(offset);
                        offset += 2;
                        // Flag             VT_UI1
                        flags = data.readUInt8(offset++);
                        // Id или Number    VT_STRING или VT_UI4
                        if(flags & 1) {
                            // Number
                            channelName = this._channelNameByNumber(data.readUInt32LE(offset));
                            offset += 4;
                        } else {
                            // Id
                            channelNameLen = data.readUInt16LE(offset);
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
                        offset += 2;
                        // отправляем уведомление
                        if((channelName in this.channels) && (quality == stOk)) {
                            this.emit('data', {
                                'name':     channelName,
                                'value':    cvt.value,
                                'dt':       channelTime,
                            });
                        }
                        //
                        break;
                    case 58:
                        // получение состояния атрибута канала клиентом или опросчиком от сервера при его изменении (команда 56 + Owner)
                        // Size             VT_UI2
                        size = data.readUInt16LE(offset);
                        offset += 2;
                        // Flag             VT_UI1
                        flags = data.readUInt8(offset++);
                        // Id или Number    VT_STRING или VT_UI4
                        if(flags & 1) {
                            // Number
                            channelName = this._channelNameByNumber(data.readUInt32LE(offset));
                            offset += 4;
                            // если канал не найден, то его имя будет null
                        } else {
                            // Id
                            channelNameLen = data.readUInt16LE(offset);
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
                    case 59:
                        // получение описания канала со всеми атрибутами от сервера при его изменении кем-либо
                        size = data.readUInt16LE(offset);
                        offset += 2;
                        //
                        offset += (size - 3);
                        break;
                    case 60:
                        // ответ на регистрацию канала 2 на сервере, изменение активности канала на сервере
                        // Size             VT_UI2
                        size = data.readUInt16LE(offset);
                        offset += 2;
                        // Flag             VT_UI1
                        flags = data.readUInt8(offset++);
                        // Id               VT_STRING
                        channelNameLen = data.readUInt16LE(offset);
                        offset += 2;
                        channelName = win1251toUtf8(data.toString('binary', offset, offset + channelNameLen));
                        offset += channelNameLen;
                        // Number           VT_UI4
                        channelNumber = data.readUInt32LE(offset);
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
                            channel.active = !!(flags & 1);
                            // записываем принятые атрибуты
                            for(let i=0; i<recAttributes.length; i++) {
                                channel.attributes[recAttributes[i].id] = recAttributes[i];
                            }
                        }
                        //
                        break;
                    case 63:
                        // ответ на запрос данных сервера в произвольном формате
                        size = data.readUInt16LE(offset);
                        offset += 2;
                        //
                        offset += (size - 3);
                        break;
                    case 66:
                        // ответ на удаление канала / удаление атрибута / изменение активности канала / изменение маски групп каналов
                        size = data.readUInt16LE(offset);
                        offset += 2;
                        //
                        offset += (size - 3);
                        break;
                    case 100:
                        // ответ на запрос статуса
                        // Error            VT_UI2
                        // An               VT_UI2
                        // Reserve          VT_UI1[8]
                        offset += 12;
                        // если ожидаю ответа, то посылаю событие с задержкой
                        if(this.waitStatus) {
                            this.emit('checkConnection', Date.now() - this.waitStatus);
                            this.waitStatus = 0;
                        }
                        break;
                    default:
                        // какая-то непонятная команда
                        size = data.readUInt16LE(offset);
                        offset += 2;
                        //
                        offset += (size - 3);
                }
            }
        } catch(error) {
            this.emit('error', new Error('ошибка при разборе полученной структуры'), error);
            this._disconnect();
        }
    }
    /**
     * Отправка структуры регистрации
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
        var offset = buf.writeUInt8(42, 0);
        offset = buf.writeUInt8(2, offset);
        buf.write(this._asciiz(this.options.login, 40), offset, 40, 'ascii');
        offset += 40;
        buf.write(this._asciiz(this.options.password, 20), offset, 20, 'ascii');
        offset += 20;
        offset = buf.writeUInt8(clientHiVersion, offset);
        offset = buf.writeUInt8(clientLoVersion, offset);
        offset = buf.writeUInt8(0, offset);
        // передача
        this.socket.write(buf);
    }
    /**
     * Запуск процедуры проверки связи с сервером
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
     */
    _sendRequestStatus() {
        // Cmd:         UI1     18
        var buf = Buffer.alloc(1);
        buf.writeUInt8(18, 0);
        // передача
        this.socket.write(buf);
    }
    /**
     * Отправка всего: регистрация каналов, значений, атрибутов...
     */
    _sendAll() {
        // регистрация каналов
        Object.keys(this.channels).forEach(name => {
            let channel = this.channels[name];
            if(channel.needRegister) {
                this._registerChannel(channel);
                channel.needRegister = false;
            }
        });
        // отправка данных
        Object.keys(this.channels).forEach(name => {
            let channel = this.channels[name];
            if(channel.needSend && channel.active) {
                this._sendChannel(channel);
                channel.needSend = false;
            }
        });
    }
    /**
     * Регистрация канала на сервере
     * @param {Сhannel2} channel регистрируемый канал
     */
    _registerChannel(channel) {
        // Cmd          UI1         51      команда
        // Size         UI2                 размер
        // Flag         UI2                 флаги
        // Name         VT_STRING           имя канала
        // Type         UI2                 тип канала
        // AttrCount    UI2                 количество атрибутов
        // Attributes                       массив атрибутов
        var buf = Buffer.alloc(4096);
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
     * @param {Attribute} attr - атрибут
     * @returns {Buffer}
     */
    _attributeToBuffer(attr) {
        var buf = Buffer.alloc(1024);
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
     * @param {Buffer} buf - буфер
     * @param {number} offset - смещение в буфере
     * @returns {VarType} 
     */
    _readVarTypeValue(buf, offset) {
        var start = offset;
        var result = {};
        result.type = buf.readUInt16LE(offset);
        offset += 2;
        //
        switch(result.type) {
            case VT_EMPTY:
                result.value = null;
                break;
            case VT_I2:
                result.value = buf.readInt16LE(offset);
                offset += 2;
                break;
            case VT_I4:
                result.value = buf.readInt32LE(offset);
                offset += 4;
                break;
            case VT_R4:
                result.value = buf.readFloatLE(offset);
                offset += 4;
                break;
            case VT_R8:
                result.value = buf.readDoubleLE(offset);
                offset += 8;
                break;
            case VT_DATE:
                result.value = this._dateTimeToDate(buf.readDoubleLE(offset));
                offset += 8;
                break;
            case VT_BOOL:
                result.value = buf.readInt16LE(offset) == -1;
                offset += 2;
                break;
            case VT_I1:
                result.value = buf.readInt8(offset);
                offset += 1;
                break;
            case VT_UI1:
                result.value = buf.readUInt8(offset);
                offset += 1;
                break;
            case VT_UI2:
                result.value = buf.readUInt16LE(offset);
                offset += 2;
                break;
            case VT_UI4:
                result.value = buf.readUInt32LE(offset);
                offset += 4;
                break;
            case VT_STRING:
                var len = buf.readUInt16LE(offset);
                offset += 2;
                result.value = win1251toUtf8(buf.toString('binary', offset, offset + len));
                offset += len;
                break;
            default:
                /** @todo поддержка массивов !!! */
                throw new Error('неподдерживаемый тип данных type:' + result.type);
        }
        result.size = offset - start;
        return result;
    }
    /**
     * Запись значения переменного типа в буфер
     * @param {*} value значение
     * @param {number} type тип
     * @returns {Buffer}
     */
    _writeVarTypeValue(value, type) {
        /** @type {Buffer} */
        var buf = Buffer.alloc(1024);
        // запись типа переменной
        var offset = buf.writeUInt16LE(type, 0);
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
                /** @todo поддержка массивов !!! */
                throw new Error('неподдерживаемый тип данных type:' + result.type);
        }
        // возвращаем кусок буфера
        return buf.slice(0, offset);
    }
    /**
     * Преобразование строки в ASCIIZ
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
     * @param {string} str строка
     * @returns {Buffer}
     */
    _vt_string(str) {
        str = utf8ToWin1251(str);
        //
        var buf = Buffer.alloc(str.length + 2);
        buf.writeUInt16LE(str.length, 0);
        buf.write(str, 2, 'binary');
        return buf;
    }
    /**
     * Возвращает объект Date для указанной даты и времени с учетом time zone сервера
     * @param {number} serverDateTime время сервера в формате TDateTime
     * @returns {Date}
     */
    _dateTimeToDate(serverDateTime) {
        return new Date((serverDateTime - 25569)*86400000 + this.serverTimeBias*60000);
    }
    /**
     * Преобразование объекта Date в тип TDateTime
     * @param {Date} date объект
     * @returns {number}
     */
    _dateToDateTime(date) {
        return (date.valueOf() - this.serverTimeBias*60000)/86400000 + 25569;
    }
    /**
     * Возвращает имя канала по его номеру
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
}

module.exports = {
    'LMClient': LMClient,
    //
    'stOk':             stOk,
    'stError':          stError,
    'stFailure':        stFailure,
    'stWrong':          stWrong,
    'stNotConnected':   stNotConnected,
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
