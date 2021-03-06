const EventEmitter = require('events');
const Struct = require('struct');



/**
 * the Package parser.
 * @example Package struct
 *    0       8         16       24       32
 *    |--------|--------|--------|--------|
 *    |version |  type  |   checksum      |
 *    |       body lenght                 |
 *    |          identity...              |
 *    |          identity                 |
 *    |          user data body...        |
 *    |          ... ...                  | 
 * @class PackageParser
 * @extends {EventEmitter}
 */
class PackageParser extends EventEmitter {
    /**
     * Creates an instance of PackageParser.
     * @memberof PackageParser
     */
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

    /**
     * handle the input data
     * 
     * @param {Buffer | string} data 
     * @returns null
     * @memberof PackageParser
     */
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

            if (bytesConsumed < data.length || this._waitBytes===0) {
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

        let msgHeader = {version,type,identity};
        
        /**
         * message event.
         *
         * @event PackageParser#message
         * @type {object}
         * @property {object} header - the package header,include {version,type,identity} field.
         * @property {Buffer|string} body - the package body,is the payload of package.
         */      
        this.emit('message', {header:msgHeader,body:body});
    }

    /**
     * create on package use header and body
     * 
     * @static
     * @param {object} header - the package header 
     * @param {Buffer|string} body - the package body
     * @returns Buffer - new Package as Buffer
     * @memberof PackageParser
     */
    static createPackage(header, body) {
        if(typeof body === 'string'){
            body = new Buffer(body);
        }
        let headerStruct = this.createHeader();
        headerStruct.allocate();

        headerStruct.set('version', header.version);
        headerStruct.set('type', header.type);
        headerStruct.set('checksum', 0);
        headerStruct.set('length', body.length);
        headerStruct.set('identity', header.identity);

        let headerBuffer = headerStruct.buffer();

        return Buffer.concat([headerBuffer, body]);
    }

    /**
     * create a package header struct.
     * 
     * @static
     * @returns one struct of a empty header.
     * @memberof PackageParser
     */
    static createHeader() {
        return Struct()
            .word8('version')
            .word8('type')
            .word16Ule('checksum')
            .word32Ule('length')
            .word64Ule('identity');

    }
}

/**
 * Enum for package types.
 * @readonly
 * @enum {number}
 * @memberof PackageParser
 */
PackageParser.PackageType = {
    DATA: 1,
    CONNECTED: 2,
    DISCONNECTED: 3,
    ERROR: 4
};

module.exports = PackageParser;