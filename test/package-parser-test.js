const should = require('should')
const PackageParser = require('../util/package-parser');

describe('the package parser class', function () {
    it('shoud construct', function () {
        const packageParser = new PackageParser();

        const EventEmitter = require('events');
        packageParser.should.be.an.instanceof(EventEmitter);
    });

    //package struct
    /*
        0       8         16       24       32
        |--------|--------|--------|--------|
        |version |  type  |   checksum      |
        |       body lenght                 |
        |          identity...              |
        |          identity                 |
        |          user data body...        | 
    */


    it('shoud emit "message" event when parse one package successed', function (done) {
        let header = new Buffer(16);
        let body = new Buffer("Hello World");
        let length = body.length;

        header.fill(0);
        header.writeUInt8(1, 0);
        header.writeUInt8(1, 1);
        header.writeUInt16LE(5, 2)
        header.writeUInt32LE(length, 4);
        header.writeUInt32LE(5, 8);
        header.writeUInt32LE(0, 12);

        let data = Buffer.concat([header, body]);

        const packageParser = new PackageParser();
        packageParser.on('message', (header, body) => {
            header.version.should.eql(1);
            header.type.should.eql(1);

            body.length.should.eql(length);
            body.toString().should.eql("Hello World");

            done();
        });

        packageParser.handleData(data);

    });

    it('shoud can parse one package splitly', function (done) {
        let header = new Buffer(16);
        let body = new Buffer("Hello World");
        let length = body.length;

        header.fill(0);
        header.writeUInt8(1, 0);
        header.writeUInt8(3, 1);
        header.writeUInt16LE(5, 2)
        header.writeUInt32LE(length, 4);
        header.writeUInt32LE(5, 8);
        header.writeUInt32LE(0, 12);

        const packageParser = new PackageParser();
        packageParser.on('message', (header, body) => {
            header.version.should.eql(1);
            header.type.should.eql(3);
            header.identity.should.eql(5);

            body.length.should.eql(length);
            body.toString().should.eql("Hello World");

            done();
        });

        packageParser.handleData(header);
        packageParser.handleData(body);

    });

    it('should create one buffer use "header" and "body"', function () {
        let body = new Buffer("Hello World");
        let header = {
            version: 1,
            type: 2,
            checksum: 0,
            identity: 10
        };

        let buffer = PackageParser.createPackage(header, body);

        let version = buffer.readUInt8(0);
        let type = buffer.readUInt8(1);
        let checksum = buffer.readUInt16LE(2);
        let length = buffer.readUInt32LE(4);
        let identity = buffer.readUInt32LE(8);

        version.should.be.eql(1);
        type.should.be.eql(2);
        checksum.should.be.eql(0);
        length.should.be.eql(body.length);
        identity.should.be.eql(10);

        let bodyOfBuffer = buffer.slice(16);
        bodyOfBuffer.toString().should.be.eql("Hello World");
    });

    it('shoud parse multi packages in one', function (done) {
        let body1 = new Buffer("Hello World1");
        let body2 = new Buffer("Hello World2");
        let body3 = new Buffer("Hello World3");

        let header = {
            version: 1,
            type: 2,
            checksum: 0,
            identity: 10
        };

        let buffer1 = PackageParser.createPackage(header, body1);
        let buffer2 = PackageParser.createPackage(header, body2);
        let buffer3 = PackageParser.createPackage(header, body3);

        let buffer = Buffer.concat([buffer1, buffer2, buffer3]);

        const packageParser = new PackageParser();
        let nPackage = 0;
        packageParser.on('message', (header, body) => {
            header.version.should.eql(1);
            header.type.should.eql(2);
            header.identity.should.eql(10);

            nPackage++;

            if (nPackage === 3) {
                done();
            }
        });

        packageParser.handleData(buffer);

    });

    it('shoud parse multi packages in splice', function (done) {
        let body1 = new Buffer("Hello World1");
        let body2 = new Buffer("Hello World2");
        let body3 = new Buffer("Hello World3");

        let header = {
            version: 1,
            type: 2,
            checksum: 0,
            identity: 10
        };

        let buffer1 = PackageParser.createPackage(header, body1);
        let buffer2 = PackageParser.createPackage(header, body2);
        let buffer3 = PackageParser.createPackage(header, body3);

        let buffer = Buffer.concat([buffer1, buffer2, buffer3]);

        const packageParser = new PackageParser();
        let nPackage = 0;
        packageParser.on('message', (header, body) => {
            header.version.should.eql(1);
            header.type.should.eql(2);
            header.identity.should.eql(10);

            nPackage++;

            if (nPackage === 3) {
                done();
            }
        });

        let offset = 0;

        while (offset < buffer.length) {
            let bytes = Math.floor(Math.random() * (buffer.length / 3) + 1);

            if (bytes > buffer.length - offset) {
                bytes = buffer.length - offset;
            }

            packageParser.handleData(buffer.slice(offset, offset + bytes));
            offset += bytes;
        }

        packageParser.handleData(buffer);

    });


});