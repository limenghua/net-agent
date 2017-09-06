const should = require('should');
const net = require('net');

const ClientAgent = require('../../to-client-agent');
const PackageParser = require('../../util/package-parser');
const PackageType = PackageParser.PackageType;

describe('the ClientAgent',function(){
    it('should route package between two clients',function(done){
        let agent = ClientAgent.createAgent(3000,3001);
        agent.start();

        let localSocket = new net.Socket();
        let remoteSocket = new net.Socket();

        remoteSocket.connect(3001,'127.0.0.1');
        remoteSocket.on('connect',()=>{
            localSocket.connect(3000,'127.0.0.1');
            localSocket.on('connect',()=>{
                localSocket.write("Hello World1");
                localSocket.end();
            });
        });

        let packageParser = new PackageParser();
        remoteSocket.on('data',(data)=>{
            packageParser.handleData(data);
        });
        packageParser.on('message',({header,body})=>{
            if(header.type === PackageType.DATA){
                body.toString().should.eql("Hello World1");
                agent.stop();
                done();
            }
        });
    });
});