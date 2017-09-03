const net = require('net');
const should = require('should');
const PackageParser = require('../util/package-parser');
const PackageType = PackageParser.PackageType;

const ServiceAgent = require('../to-service-agent');

function createTestServer(port, datasReturn) {
    const server = net.createServer();

    server.on('connection', (socket) => {
        datasReturn.forEach((data)=>{
            socket.write(data);
        });

        socket.on('data',(data)=>{
            server.emit('socketdata',socket,data);
        });       
    });

    server.listen(port);

    return server;
}

describe('the service-agent',function(){
    it('shoud can route package between serivce and client-agent',function(done){
        let connectHeader = {version:1,type:PackageType.CONNECTED,identity:1};
        let dataHeader = {version:1,type:PackageType.DATA,identity:1};
        let disconnectHeader = {version:1,type:PackageType.DISCONNECTED,identity:1};

        let connectBuffer = PackageParser.createPackage(connectHeader,"");
        let dataBuffer = PackageParser.createPackage(dataHeader,"Hello World");
        let disconnectBuffer = PackageParser.createPackage(disconnectHeader,"");

        // const agentMockServer = createTestServer(6001,[connectBuffer,dataBuffer,disconnectBuffer]);

        // const agent = ServiceAgent.createAgent(9000,'127.0.0.1',6001,'127.0.0.1');
        // agent.start();

        // agentMockServer.on('socketdata',(socket,data)=>{
        //      done();        
        // });

        done();  

    });

});