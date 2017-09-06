const LocalConnection = require('./local-connection');
const RemoteConnection = require('./remote-connection');

/**
 * the agent in the client side.
 * 接受service side的agent的连接,接受Service 使用者的连接。
 * 
 * @class ClientAgent
 */
class ClientAgent{
    /**
     * Creates an instance of ClientAgent.
     * @param {number} localPort - the port listen for the service user;
     * @param {number} remotePort - the port listen for the service agent;
     * @memberof ClientAgent
     */
    constructor(localPort,remotePort){
        this._localPort = localPort;
        this._remotePort = remotePort;

        this._localConnection = new LocalConnection(localPort);
        this._remoteConnection = new RemoteConnection(remotePort);
    }

    /**
     * start the listenner
     * 
     * @memberof ClientAgent
     */
    start(){
        this._localConnection.start();
        this._remoteConnection.start();

        this._localConnection.on('message',({header,body})=>{
            this._remoteConnection.dispatch(header,body);
        });

        this._remoteConnection.on('message',({header,body})=>{
            this._localConnection.dispatch(header,body);
        });

    }

    /**
     * stop the listenner
     * 
     * @memberof ClientAgent
     */
    stop(){
        this._localConnection.stop();
        this._remoteConnection.stop();
    }
}

/**
 * create a clientAgent
 * 
 * @param {number} localPort - the port listen for the service user;
 * @param {number} remotePort - the port listen for the service agent;
 * @returns ClientAgent ojbect
 */
function createAgent(localPort,remotePort){
    return new ClientAgent(localPort,remotePort);
}

module.exports.createAgent = createAgent;