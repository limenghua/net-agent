const Struct = require('struct');

describe('the stuct',function(){
    let header = Struct()
        .word32Sle('length')
        .word32Sle('address')
        .word32Sle('port');
    
    header.allocate();
    let proxy = header.fields;
    let buffer = header.buffer();

    it('should be',function(){
        proxy.length = 10;
        proxy.address = 1060;
        proxy.port =30;

    });
});