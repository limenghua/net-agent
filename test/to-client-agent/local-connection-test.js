const should =require('should');
const net = require('net');
const EventEmitter = require('events');
const LocalConnection = require('../../to-client-agent/local-connection');
const PackageParser = require('../../util/package-parser');
const PackageType = PackageParser.PackageType;

describe('ToClientAgent LocalConnection',function(){
    it('should construct as a EventEmitter obj',function(){
        let localConnection = new LocalConnection(3000);

        localConnection.should.be.instanceof(EventEmitter);

        localConnection.should.has.property('start');
        localConnection.should.has.property('stop');
        localConnection.should.has.property('dispatch');        
    });

    it('shoud emit message of(Package.CONNCET) when handle new connection',function(done){
        let localConnection = new LocalConnection(4000);
        localConnection.start();

        localConnection.on('message',({header,body})=>{
            header.version.should.be.eql(1);
            header.type.should.be.eql(PackageType.CONNECTED);
            header.checksum.should.eql(0);
            done();
            localConnection.stop();
        });

        let socket = new net.Socket();
        socket.connect(4000,'127.0.0.1',()=>{
            socket.end();
        });

    });

    it('shoud emit message of(Package.CONNCET DATA DISCONNECT) when handle new connection and data',function(done){
        let localConnection = new LocalConnection(4001);
        localConnection.start();

        let expectType = PackageType.CONNECTED;

        localConnection.on('message',({header,body})=>{
            header.version.should.be.eql(1);
            header.type.should.be.eql(expectType);
            header.checksum.should.eql(0);

            if(expectType === PackageType.DISCONNECTED)done();

            if(expectType ===PackageType.CONNECTED){
                expectType = PackageType.DATA;
            }
            else if(expectType ===PackageType.DATA){
                body.toString().should.be.eql('Hello World');
                expectType = PackageType.DISCONNECTED;
            }
        });

        let socket = new net.Socket();
        socket.connect(4001,'127.0.0.1',()=>{
            socket.write("Hello World");
            socket.end();
        });

    });

});