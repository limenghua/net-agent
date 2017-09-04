const LocalConnection = require('./local-connection');
const RemoteConnection = require('./remote-connection');

class ClientAgent{
    constructor(localPort,remotePort){
        this._localPort = localPort;
        this._remotePort = remotePort;

        this._localConnection = new LocalConnection(localPort);
        this._remoteConnection = new RemoteConnection(remotePort);
    }

    start(){
        this._localConnection.start();
        this._remoteConnection.start();

        this._localConnection.on('message',(header,body)=>{
            this._remoteConnection.dispatch(header,body);
        });

        this._remoteConnection.on('message',(header,body)=>{
            this._localConnection.dispatch(header,body);
        });

    }

    stop(){
        this._localConnection.stop();
        this._remoteConnection.stop();
    }
}

function createAgent(localPort,remotePort){
    return new ClientAgent(localPort,remotePort);
}

module.exports.createAgent = createAgent;