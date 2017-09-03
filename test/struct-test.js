const Struct = require('struct');
const should = require('should');

describe('the stuct',function(){
    let header = Struct()
        .word32Sle('length')
        .word32Sle('address')
        .word32Sle('port');
    
    header.allocate();
    let proxy = header.fields;
    let buffer = header.buffer();
    buffer.fill(0);

    it('should be',function(){
        proxy.length.should.eql(0);
        proxy.address.should.eql(0);
        proxy.port.should.eql(0);

        buffer.writeInt32LE(10,0);
        buffer.writeInt32LE(100,4);
        buffer.writeInt32LE(1000,8);

        proxy.length.should.eql(10);
        proxy.address.should.eql(100);
        proxy.port.should.eql(1000);
        
        buffer.fill(0);
    });
});