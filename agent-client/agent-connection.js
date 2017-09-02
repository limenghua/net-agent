const net = require('net');
const EventEmitter = require('events');
const Struct = require('struct');

class AgentConnection extends EventEmitter {
    constructor() {
        super();
        this._socket = new net.Socket();
        this._header = this._createHeader();
        this._state = 'wait-header';
        this._needByte = 0;
    }

    connect(port, address) {
        this._socket.connect(port, address);

        this._socket.on('connect', () => {
            this._init();
            this.emit('connect');
        });
    }

    _handleData(data) {

        let header = {
            type: 0,
            identity: 1
        };

        this.emit('message', header, data);
    }

    dispatch(header, data) {

    }

    _init() {
        this._socket.on('data', (data) => {
            this._handleData(data);
        });
        this._socket.on('end', () => {

        });
        this._socket.on('error', (err) => {

        });

    }

    _createHeader() {
        return Struct()
            .word8('type')
            .word32Ule('lenght')
            .word64Ule('identity');
    }
}

module.exports = AgentConnection;