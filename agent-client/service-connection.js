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

    destroye(){

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
        this.socketMap = new Map();
        this.connectionPool = null;
    }

    connect(port, host) {
        this.connectionPool = new ConnectionPool(port,host);
    }

    close(){
        
    }

    dispatch(header,body){
        let identity = header.identity;
        let type = header.type;

        switch(type){
            case 1:
                this._dispatch(identity,body);
                break;
            case 2:
                this._createConnection(identity);
                break;
            case 3:
                this._deleteConnection(identity);
                break;
            default:
                break;
        }
    }

    handleData(socket,data){
        let identity = socket.identity;
        let header = {version:1,type:1,identity:identity};
        this.emit('message',header,data);
    }

    _dispatch(identity,body){
        if(! this.socketMap.has(identity)){
            return _dispatchError(indentity,'no connection exsist');
        }

        let socket = this.socketMap.get(identity);
        socket.write(body);
    }

    _createConnection(identity){
        let socket = this.connectionPool.pickOneConnection();
        socket.identity = identity;
        this.socketMap.set(identity,socket);

        socket.on('end',()=>{
            this._deleteConnection(identity);
        })
        socket.on('error',()=>{
            this._deleteConnection(identity);
        });
        socket.on('data',(data)=>{
            this.handleData(socket,data);
        });
    }

    _deleteConnection(identity){
        if(! this.socketMap.has(identity)){
            return _dispatchError(indentity,'no connection exsist when delete');
        }

        let socket = this.socketMap.get(identity);
        this.socketMap.delete(identity);

        if(! socket.destroyed){
            socket.end();
        }
    }

};

ServiceConnection.ConnectionPool = ConnectionPool;

module.exports = ServiceConnection;