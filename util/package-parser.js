const EventEmitter = require('events');
const Struct = require('struct');

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
class PackageParser extends EventEmitter {
    constructor() {
        super();
        this._state = 'wait-header'; //'wait-header' || 'wait-body'        
        this._header = PackageParser.createHeader();
        this._header.allocate();
        this._headerBuffer = this._header.buffer();
        this._headerBuffer.fill(0);
        this._headerLength = this._header.length();
        this._waitBytes = this._headerLength;
    }

    handleData(data) {
        if (this._state === 'wait-header') {
            return this._handleHeader(data);
        } else if (this._state === 'wait-body') {
            return this._handleBody(data);
        }
    }

    _handleHeader(data) {
        let offset = this._headerLength - this._waitBytes;
        this._headerBuffer.fill(data, offset);

        if (data.length >= this._waitBytes) {
            let bytesConsumed = this._waitBytes;
            this._state = 'wait-body';
            this._waitBytes = this._header.get('length');

            if (bytesConsumed < data.length) {
                return this._handleBody(data.slice(bytesConsumed));
            }
        } else {
            this._waitBytes -= data.length;
        }
    }

    _handleBody(data) {
        if (data.length >= this._waitBytes) {
            let bytesConsumed = this._waitBytes;
            this._handleMessage(this._header, data.slice(0, bytesConsumed));

            this._state = 'wait-header';
            this._waitBytes = this._headerLength;
            this._headerBuffer.fill(0);

            if (bytesConsumed < data.length) {
                this._handleHeader(data.slice(bytesConsumed));
            }
        } else {
            this._waitBytes -= data.length;
            this._handleMessage(this._header, data);
        }
    }

    _handleMessage(header, body) {
        let version = header.get('version');
        let type = header.get('type');
        let identity = header.get('identity');

        this.emit('message', {
            version: version,
            type: type,
            identity: identity
        }, body);
    }

    static createPackage(header,body){
        let headerStruct = this.createHeader();
        headerStruct.allocate();

        headerStruct.set('version',header.version);
        headerStruct.set('type',header.type);
        headerStruct.set('checksum',0);
        headerStruct.set('length',body.length);        
        headerStruct.set('identity',header.identity);

        let headerBuffer = headerStruct.buffer();

        return Buffer.concat([headerBuffer,body]);
    }

    static createHeader() {
        return Struct()
            .word8('version')
            .word8('type')
            .word16Ule('checksum')
            .word32Ule('length')
            .word64Ule('identity');

    }
}

module.exports = PackageParser;