const net = require('net');
const EventEmitter = require('events');

class ConnectionPool {
    constructor(port, host, opt) {
        this.servicePort = port;
        this.serviceHost = host;
        this.opt = opt || {};

        this.sockets = new Set();
        this.poolSize = this.opt.poolSize || 100;
    }

    create() {
        for (let i = 0; i < this.poolSize; i++) {
            this._addOneConnection();
        }
    }

    _addOneConnection() {
        let socket = new net.Socket();
        socket.connect(this.servicePort, this.serviceHost);
        socket.on('connect', () => {
            //console.log('socket connected');
            this.sockets.add(socket);
        });

        socket.on('end', () => {
            if (this.sockets.has(socket)) {
                this.sockets.delete(socket);
                this._addOneConnection();
            }

            console.log('socket end');

        });

        socket.on('error', (err) => {
            if (this.sockets.has(socket)) {
                this.sockets.delete(socket);
                this._addOneConnection();
            }
            console.log('socket error:',err);
        });
    }

    pickOneConnection() {
        let socket = null;
        for (let sock of this.sockets) {
            socket = sock;
            break;
        }

        this._addOneConnection();

        if (socket !== null) {
            this.sockets.delete(socket);
        }

        return socket;
    }

    connectionSize() {
        return this.sockets.size;
    }
}

class ServiceConnection extends EventEmitter {
    constructor() {
        super();
    }

    connect(port, host) {

    }

};

ServiceConnection.ConnectionPool = ConnectionPool;

module.exports = ServiceConnection;