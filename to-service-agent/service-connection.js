const net = require('net');
const EventEmitter = require('events');
const PackageParser = require('../util/package-parser');
const PackageType = PackageParser.PackageType;
const logger = require('../util/logger');


/**
 * The tcp connection pool,to prepare many connection for after use.
 * 
 * @class ConnectionPool
 * @extends {EventEmitter}
 */
class ConnectionPool extends EventEmitter{

    /**
     * Creates an instance of ConnectionPool.
     * @param {number} port of the service to connect
     * @param {string} host of the service to connect,use ip address
     * @param {object} option  {opt.poolSize:default 100}
     * @memberof ConnectionPool
     */
    constructor(port, host, opt) {
        super();

        this.servicePort = port;
        this.serviceHost = host;
        this.opt = opt || {};
        this.opt.poolSize = this.opt.poolSize || 100;

        this.sockets = new Set();

        this.started = false;
    }

    /**
     * create connections and connect to service
     * 
     * @memberof ConnectionPool
     */
    create() {
        for (let i = 0; i < this.opt.poolSize; i++) {
            this._addOneConnection();
        }
    }

    /**
     * disconnect all connections
     * 
     * @memberof ConnectionPool
     */
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
                //this._addOneConnection();      
            }, 100); 

            console.log('socket end');

        });

        socket.on('error', (err) => {
            this.sockets.delete(socket);
            setTimeout(()=> {
                //this._addOneConnection();      
            }, 100); 

            console.log('socket error:',err);
        });
    }
    

    /**
     * pick one connection in the pool,delete connection from pool and create new one put into it.
     * 
     * @returns net.Socket
     * @memberof ConnectionPool
     */
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


    /**
     * the count of connections witch in use.
     * 
     * @returns number
     * @memberof ConnectionPool
     */
    connectionSize() {
        return this.sockets.size;
    }
}


/**
 * the service connection manager.
 * contain many connection to the certain service, ex some server
 * 
 * @class ServiceConnection
 * @extends {EventEmitter}
 */
class ServiceConnection extends EventEmitter {
    constructor() {
        super();
        this._socketMap = new Map();
        this._connectionPool = null;
    }


    /**
     * connect to the service
     * 
     * @param {number} port of service 
     * @param {string} host of service,in normal ,is the ip address.
     * @memberof ServiceConnection
     */
    connect(port, host) {
        this._connectionPool = new ConnectionPool(port,host);
        this._connectionPool.create();
        this._connectionPool.on('ready',()=>{
            this.emit('ready');
        });
    }

    
    /**
     * close all connection,and destroy the connection pool.
     * 
     * @memberof ServiceConnection
     */
    close(){
        this._connectionPool.destroye();
        this._started = false;

        for(let [identity,socket] of this._socketMap){
            socket.end();
        }
    }


    /**
     * dispatch the package witch recieve from extenal 
     * 
     * @param {object} header 
     * @param {Buffer | string} body 
     * @memberof ServiceConnection
     */
    dispatch(header,body){
        logger.headerlog(header,'service-connection');
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
        this.emit('message',{header:header,body:data});
    }

    _dispatch(identity,body){
        if(! this._socketMap.has(identity)){
            return this._dispatchError(indentity,'no connection exsist');
        }

        let socket = this._socketMap.get(identity);
        socket.write(body);
    }

    _createConnection(identity){
        let socket = this._connectionPool.pickOneConnection();
        socket.identity = identity;
        this._socketMap.set(identity,socket);

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
        if(! this._socketMap.has(identity)){
            return this._dispatchError(identity,'no connection exsist when delete');
        }

        let socket = this._socketMap.get(identity);
        this._socketMap.delete(identity);

        if(! socket.destroyed){
            socket.end();
        }
    }

    _dispatchError(identity,err){

    }

};

ServiceConnection.ConnectionPool = ConnectionPool;

module.exports = ServiceConnection;