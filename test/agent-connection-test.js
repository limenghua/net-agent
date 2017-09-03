const net = require('net');
const should = require('should');
const AgentConnection = require('../to-service-agent/agent-connection');
const PackageParser = require('../util/package-parser');


function createTestServer(port, datasReturn) {
    const server = net.createServer();

    server.on('connection', (socket) => {
        datasReturn.forEach((data)=>{
            socket.write(data);
        });
       
        socket.end();
        server.close();
    });

    server.listen(port);
}


describe('the agent connection', function () {
    it('shoud be a instance of EventEmitter', function () {
        const agent = new AgentConnection();

        const EventEmitter = require('events');
        agent.should.be.an.instanceof(EventEmitter);
    });

    it('should emit "message" event when recvieve data',function(done){
        let body = new Buffer("Hello World");
        let header = {
            version: 1,
            type: 2,
            checksum: 0,
            identity: 10
        };

        let buffer = PackageParser.createPackage(header, body);

        createTestServer(8000,[buffer]);
        const agent = new AgentConnection();
        agent.connect(8000,'127.0.0.1');

        agent.on('message',(header,data)=>{
            header.version.should.eql(1);
            header.type.should.eql(2);
            header.identity.should.eql(10);
            data.toString().should.eql('Hello World');
            done();
        });
    });

});