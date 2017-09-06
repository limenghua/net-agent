const should = require('should');
const EventEmitter = require('events');
const ServiceConnection = require('../../to-service-agent/service-connection');
const ConnectionPool = ServiceConnection.ConnectionPool;
const echoServer = require('../echo-server');
const PackageType = require('../../util/package-parser').PackageType;

describe('the service connect pool',function(){
    it('should constrct with service port and host',function(done){

        const server = echoServer.createServer(8000);
        const connectionPool = new ConnectionPool(8000,'127.0.0.1');

        connectionPool.create();

        connectionPool.on('ready',()=>{
            let poolSize = connectionPool.connectionSize();
            poolSize.should.eql(100);

            let socket = connectionPool.pickOneConnection();

            socket.should.not.eql(null);
            poolSize = connectionPool.connectionSize();
            poolSize.should.eql(99);

            socket.end();
            server.close();
            connectionPool.destroye();
            done();
        });

    });

});


describe('the service-connection',function(){
    it('construct shoud be instance of EventEmitter',function(){
        const serviceConnect = new ServiceConnection();
        serviceConnect.should.be.instanceof(EventEmitter);
    });

    it('shoud route the package from service and client',function(done){
        const server = echoServer.createServer(8001);
        const serviceConnect = new ServiceConnection();
        serviceConnect.connect(8001,'127.0.0.1');

        serviceConnect.on('ready',()=>{
            let connectHeader = {version:1,type:PackageType.CONNECTED,identity:1};
            let dataHeader = {version:1,type:PackageType.DATA,identity:1};

            serviceConnect.dispatch(connectHeader,"");
            serviceConnect.dispatch(dataHeader,"Hello World");
        });

        serviceConnect.on('message',({header,body})=>{
            header.identity.should.eql(1);

            body.toString().should.eql('Hello World');

            let disConnectHeader = {version:1,type:PackageType.DISCONNECTED,identity:1};
            serviceConnect.dispatch(disConnectHeader,"");

            server.close();
            serviceConnect.close();
            done();
        });

    });
});