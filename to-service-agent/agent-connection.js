const net = require('net');
const EventEmitter = require('events');
const PackageParser = require('../util/package-parser');
const logger = require('../util/logger');

class AgentConnection extends EventEmitter {
    constructor() {
        super();
        this._socket = new net.Socket();
        this._packageParser = new PackageParser();

    }

    connect(port, address) {
        this._socket.connect(port, address);

        this._socket.on('connect', () => {
            this._init();
            this.emit('connect');
        });

        this._packageParser.on('message',(header,data)=>{
            this.emit('message',header,data);
        });
    }

    close(){
        this._socket.end();
    }


    dispatch(header, data) {
        logger.headerlog(header,'agent-connection');
        let buffer = PackageParser.createPackage(header,data);
        this._socket.write(buffer);
    }

    _init() {
        this.on('data',(data)=>{
            this._packageParser.handleData(data);
        });

        this._socket.on('data', (data) => {
            this.emit('data',data);
        });

        this._socket.on('end', () => {
            console.log('socket end.');
        });

        this._socket.on('error', (err) => {
            console.log('socket error:',err);
        });

    }

}

module.exports = AgentConnection;