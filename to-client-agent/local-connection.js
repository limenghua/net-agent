const net = require('net');
const EventEmitter = require('events');
const PackageParser = require('../util/package-parser');
const PackageType = PackageParser.PackageType;
const logger = require('../util/logger');

let nextIdentity = 1;

function createIdentity(){
    nextIdentity ++;
    return nextIdentity;
}

class LocalConnection extends EventEmitter{
    constructor(port){
        super();
        this._sockets = new Map();
        this._server = new net.Server();
        this._port = port;
    }

    start(){
        this._server.listen(this._port);
        
        this._server.on('listening',()=>{
            this.emit('ready');
        });

        this._server.on('connection',(socket)=>{
            this._handleConnection(socket);

            socket.on('data',(data)=>{
                this._onData(socket,data);
            });

            socket.on('end',()=>{
                this._onEnd(socket);
            });

            socket.on('error',(err)=>{
                this._onError(socket,err);
            });
        });
    }

    stop(){
        for(let [identiti,socket] of this._sockets){
            socket.end();
        }
        this._sockets.clear();
        this._server.close();
    }

    dispatch(header,body){
        logger.headerlog(header,'local-connection');        
        let identity = header.identity;
        let type = header.type;

        switch(type){
        case PackageType.DATA:
            this._dispatch(identity,body);
            break;
        case PackageType.DISCONNECTED:
            _disconnect(identity);
            break;
        };
    }

    _dispatch(identity,body){
        let socket = this._sockets.get(identity);
        if(socket){
            socket.write(body);
        }
    }

    _disconnect(identity){
        let socket = this._sockets.get(identity);
        if(socket){
            socket.end();
        }
    }

    _handleConnection(socket){
        let identity = createIdentity(socket);
        socket.identity = identity;
        this._sockets.set(identity,socket);

        this._onConnect(identity,socket);
    }

    _onConnect(identity,socket){
        let header = {
            version:1,
            type:PackageType.CONNECTED,
            checksum:0,            
            identity:identity,            
        }

        this.emit('message',{header:header,body:""});
    }

    _onData(socket,data){
        let identity = socket.identity;
        let header ={
            version:1,
            type:PackageType.DATA,
            checksum:0,            
            identity:identity
        }
        this.emit('message',{header:header,body:data});
    }

    _onEnd(socket){
        this._deleteConnection(socket);
    }

    _onError(socket){
        this._deleteConnection(socket);
    }

    _deleteConnection(socket){
        let identity = socket.identity;
        this._sockets.delete(identity);

        let header ={
            version:1,
            type:PackageType.DISCONNECTED,
            checksum:0,
            identity,identity
        };
        this.emit('message',{header:header,body:""});    
    }

    _createIdentity(socket){
        return createIdentity();
    }
}

module.exports = LocalConnection;

