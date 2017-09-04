const net = require('net');
const EventEmitter = require('events');
const PackageParser = require('../util/package-parser');
const PackageType = PackageParser.PackageType;

class RemoteConnection extends EventEmitter{
    constructor(port){
        super();
        this._port = port;
        this._server = net.createServer();
        this._sockets = new Set();
    }

    start(){
        this._server.listen(this._port);

        this._server.on('listening',()=>{
            this.emit('ready');
        });

        this._server.on('connection',(socket)=>{
            this._handleConnection(socket);
        });
    }

    stop(){
        for(let socket of this._sockets){
            socket.end();
        }
        this._sockets.clear();
        this._server.close();
    }

    dispatch(header,body){
        let identity = header.identity;
        const data = PackageParser.createPackage(header,body);

        let socket = this._getConnection(identity);
        if(socket){
            socket.write(data);
        }
    }

    _handleConnection(socket){
        this._sockets.add(socket);
        let packageParser = new PackageParser();

        packageParser.on('message',(header,body)=>{
            this.emit('message',header,body);
        });

        socket.on('data',(data)=>{
            packageParser.handleData(data);
        });

        socket.on('end',()=>{
            this._deleteConnection(socket);
        });

        socket.on('error',()=>{
            this._deleteConnection(socket);
        });
    }

    _deleteConnection(socket){
        this._sockets.delete(socket);
    }

    _getConnection(identity){
        let socket = null;
        for(let sock of this._sockets){
            socket = sock;
            break;
        }
        return socket;
    }
}


module.exports = RemoteConnection;
