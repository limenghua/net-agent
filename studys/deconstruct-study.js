const should = require('should');

describe('study the deconstruct',function(){
    it('shoud construct one object',function(){
        let a = 5,b=6;
        let obj = {a,b};
        obj.should.has.property('a');
        obj.should.has.property('b');

        obj.a.should.eql(5);
        obj.b.should.eql(6);
    });

    it('should deconstruc varb from struct obj',function(){
        let obj = {a:5,b:6};
        let {a,b} = obj;
        
        a.should.eql(5);
        b.should.eql(6);

    });

    it('shoud deconstruct varable use function',function(done){
        let obj ={a:5,b:6};
        let v =function (object){
            object.a.should.eql(5);
            object.b.should.eql(6);
            let {a,b}=obj;

            a.should.eql(5);
            b.should.eql(6);
            done();
        }(obj);

    });

    it('shoud can use deconstruct when function define',function(done){
        let obj ={a:5,b:6};
        let fun = ({a,b})=>{
            a.should.eql(5);
            b.should.eql(6);
            done();
        };
        fun(obj);
    });
})