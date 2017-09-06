const net = require('net');
const EventEmitter = require('events');
const PackageParser = require('../util/package-parser');
const PackageType = PackageParser.PackageType;
const logger = require('../util/logger')

/**
 * manager the connections witch connect from the costumer side(the service locate).
 * 
 * @class RemoteConnection
 * @extends {EventEmitter}
 */
class RemoteConnection extends EventEmitter{
    /**
     * Creates an instance of RemoteConnection.
     * @param {number} port - listen port
     * @memberof RemoteConnection
     */
    constructor(port){
        super();
        this._port = port;
        this._server = net.createServer();
        this._sockets = new Set();
    }

    /**
     * start the listenner.
     * 
     * @memberof RemoteConnection
     */
    start(){
        this._server.listen(this._port);

        /**
        * ready event. once listen start successd,this event emit.
        * @event RemoteConnection#ready
        */     
        this._server.on('listening',()=>{          
            this.emit('ready');
        });

        this._server.on('connection',(socket)=>{
            this._handleConnection(socket);
        });
    }

    /**
     * disconnect all the connection,and stop the listenner.
     * 
     * @memberof RemoteConnection
     */
    stop(){
        for(let socket of this._sockets){
            socket.end();
        }
        this._sockets.clear();
        this._server.close();
    }

    /**
     * dispatch the package.
     * 
     * @param {object} header 
     * @param {Buffer|string} body 
     * @memberof RemoteConnection
     */
    dispatch(header,body){
        logger.headerlog(header,'remote-connection');
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

        packageParser.on('message',(message)=>{
            this.emit('message',message);
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
