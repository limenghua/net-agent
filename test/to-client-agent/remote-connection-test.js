const should = require('should');
const EventEmitter = require('events');
const net = require('net');
const RemoteConnection = require('../../to-client-agent/remote-connection');
const PackageParser = require('../../util/package-parser');
const PackageType = PackageParser.PackageType;

describe('the RemoteConnection',function(){
    it('construct as a EventEmitter',function(){
        let remoteConnecton = new RemoteConnection(6000);

        remoteConnecton.should.be.instanceof(EventEmitter);

        remoteConnecton.should.has.property('start');
        remoteConnecton.should.has.property('stop');
        remoteConnecton.should.has.property('dispatch');
    });

    it('shoud emit "ready" event when start successd',function(done){
        let remoteConnecton = new RemoteConnection(6000);
        remoteConnecton.start();

        remoteConnecton.on('ready',()=>{
            remoteConnecton.stop();
            done();
        });
    });

    it('should emit "message" events when recieve remote packages',function(done){
        let remoteConnecton = new RemoteConnection(6000);
        remoteConnecton.start();

        remoteConnecton.on('message',(header,body)=>{
            header.type.should.eql(PackageType.DATA);
            header.identity.should.eql(1);
            header.version.should.eql(1);
            
            remoteConnecton.stop();
            done();
        });

        remoteConnecton.on('ready',()=>{
            let header = {
                version:1,
                type:PackageType.DATA,
                checksum:0,
                identity:1
            };
            let buffer = PackageParser.createPackage(header,"Hello Worlds");

            let socket = new net.Socket();
            socket.connect(6000,'127.0.0.1');
            socket.on('connect',()=>{
                socket.write(buffer);
                socket.end();
            });
        });
    });
});