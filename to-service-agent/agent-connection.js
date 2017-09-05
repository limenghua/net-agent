const net = require('net');
const EventEmitter = require('events');
const PackageParser = require('../util/package-parser');
const logger = require('../util/logger');

/**
 * mananger all connections, witch connect to the agent in the cloud side
 * 
 * @class AgentConnection
 * @extends {EventEmitter}
 */
class AgentConnection extends EventEmitter {
    constructor() {
        super();
        this._socket = new net.Socket();
        this._packageParser = new PackageParser();

    }

    /**
     * connect to the agent in cloud side.
     * 
     * @param {int} port - port of the agent listen on 
     * @param {any} address - ip address of the agent
     * @memberof AgentConnection
     */
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

    /**
     * close the connection.
     * 
     * @memberof AgentConnection
     */
    close(){
        this._socket.end();
    }

    /**
     * dispatch the pakage to the agent.
     *  
     * @param {object} header 
     * @param {Buffer|string} data 
     * @memberof AgentConnection
     */
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