const should = require('should');
const EventEmitter = require('events');
const ServiceConnection = require('../agent-client/service-connection');
const ConnectionPool = ServiceConnection.ConnectionPool;

describe('the service connect pool',function(){
    it('should constrct with service port and host',function(done){
        const echoServer = require('./echo-server');
        const server = echoServer.createServer(8000);
        const connectionPool = new ConnectionPool(8000,'127.0.0.1');

        connectionPool.create();

        setTimeout(()=>{
            let poolSize = connectionPool.connectionSize();
            poolSize.should.eql(100);

            let socket = connectionPool.pickOneConnection();

            socket.should.not.eql(null);
            poolSize = connectionPool.connectionSize();
            poolSize.should.eql(99);

            socket.end();
            server.close();
            done();
        },200);


    });

});


describe('the service-connection',function(){
    it('construct shoud be instance of EventEmitter',function(){
        const serviceConnect = new ServiceConnection();
    })
});