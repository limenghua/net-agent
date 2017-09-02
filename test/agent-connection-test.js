const net = require('net');
const should = require('should');
const AgentClient = require('../agent-client');
const AgentConnection = AgentClient.AgentConnection;

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
        createTestServer(8000,['hello']);
        const agent = new AgentConnection();
        agent.connect(8000,'127.0.0.1');

        agent.on('message',(header,data)=>{
            header.type.should.eql(0);
            header.identity.should.eql(1);
            data.toString().should.eql('hello');
            done();
        });

        //done();
    });

});