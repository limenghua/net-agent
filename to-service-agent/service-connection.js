const net = require('net');
const EventEmitter = require('events');
const PackageParser = require('../util/package-parser');
const PackageType = PackageParser.PackageType;

class ConnectionPool extends EventEmitter{
    constructor(port, host, opt) {
        super();

        this.servicePort = port;
        this.serviceHost = host;
        this.opt = opt || {};
        this.opt.poolSize = this.opt.poolSize || 100;

        this.sockets = new Set();


        this.started = false;
    }

    create() {
        for (let i = 0; i < this.opt.poolSize; i++) {
            this._addOneConnection();
        }
    }

    destroye(){
        for(let socket of this.sockets){
            if(! socket.destroyed){
                socket.destroy();
            }
        }

        this.sockets.clear();
    }

    _addOneConnection() {
        if(this.sockets.size >= this.opt.poolSize)return;

        let socket = new net.Socket();
        socket.connect(this.servicePort, this.serviceHost);
        socket.on('connect', () => {
            //console.log('socket connected');
            this.sockets.add(socket);
            if(! this.started && this.sockets.size === this.opt.poolSize){
                this.started = true;
                this.emit('ready');
            }
        });

        socket.on('end', () => {
            this.sockets.delete(socket);
            setTimeout(()=> {
                this._addOneConnection();      
            }, 100); 

            console.log('socket end');

        });

        socket.on('error', (err) => {
            this.sockets.delete(socket);
            setTimeout(()=> {
                this._addOneConnection();      
            }, 100); 

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
        this.connectionPool.create();
        this.connectionPool.on('ready',()=>{
            this.emit('ready');
        });
    }

    close(){
        this.connectionPool.destroye();
        this.started = false;
    }

    dispatch(header,body){
        let identity = header.identity;
        let type = header.type;

        switch(type){
            case PackageType.DATA:
                this._dispatch(identity,body);
                break;
            case PackageType.CONNECTED:
                this._createConnection(identity);
                break;
            case PackageType.DISCONNECTED:
                this._deleteConnection(identity);
                break;
            default:
                break;
        }
    }

    _handleData(socket,data){
        let identity = socket.identity;
        let header = {version:1,type:PackageType.DATA,identity:identity};
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
            this._handleData(socket,data);
        });
    }

    _deleteConnection(identity){
        if(! this.socketMap.has(identity)){
            return this._dispatchError(identity,'no connection exsist when delete');
        }

        let socket = this.socketMap.get(identity);
        this.socketMap.delete(identity);

        if(! socket.destroyed){
            socket.end();
        }
    }

    _dispatchError(identity,err){

    }

};

ServiceConnection.ConnectionPool = ConnectionPool;

module.exports = ServiceConnection;