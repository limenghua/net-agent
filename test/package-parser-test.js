const should = require('should')
const PackageParser = require('../util/package-parser');

describe('the package parser class',function(){
    it('shoud construct',function(){
        const packageParser = new PackageParser();

        const EventEmitter = require('events');
        packageParser.should.be.an.instanceof(EventEmitter);
    });

    //package struct
    /*
        0       8         16       24       32
        |--------|--------|--------|--------|
        |    version      |       type      |
        |       body lenght                 |
        |          identity...              |
        |          identity                 |
        |          user data body...        | 
    */


    it('shoud emit "message" event when parse one package successed',function(done){
        let header = new Buffer(16);
        let body = new Buffer("Hello World");
        let length = body.length;

        header.fill(0);
        header.writeUInt8(1,0);
        header.writeUInt8(1,1);
        header.writeUInt16LE(5,2)
        header.writeUInt32LE(length,4);
        header.writeUInt32LE(5,8);
        header.writeUInt32LE(0,12);

        let data = Buffer.concat([header,body]);

        const packageParser = new PackageParser();
        packageParser.on('message',(header,body)=>{
            header.version.should.eql(1);
            header.type.should.eql(1);
            
            body.length.should.eql(length);
            body.toString().should.eql("Hello World");

            done();
        });

        packageParser.handleData(data);
        
    })

    it('shoud can parse one package splitly',function(done){
        let header = new Buffer(16);
        let body = new Buffer("Hello World");
        let length = body.length;

        header.fill(0);
        header.writeUInt8(1,0);
        header.writeUInt8(3,1);
        header.writeUInt16LE(5,2)
        header.writeUInt32LE(length,4);
        header.writeUInt32LE(5,8);
        header.writeUInt32LE(0,12);

        const packageParser = new PackageParser();
        packageParser.on('message',(header,body)=>{
            header.version.should.eql(1);
            header.type.should.eql(3);
            header.identity.should.eql(5);
            
            body.length.should.eql(length);
            body.toString().should.eql("Hello World");

            done();
        });

        packageParser.handleData(header);
        packageParser.handleData(body);
        
    })


});
