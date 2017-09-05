var log4js = require('log4js');

log4js.configure({
    appenders: { console: { type: 'console' } },
    categories: { default: { appenders: [ 'console' ], level: 'info' } }
  });

var logger = log4js.getLogger();
logger.level = 'debug';

logger.headerlog =  function(){
    let totalPackages = 0;
    let lastSecondsPackages = 0;
    let packagePerSecond = 0;

    setInterval(()=>{
        packagePerSecond = totalPackages - lastSecondsPackages;
        lastSecondsPackages = totalPackages;
    },1000);

    return function(header,name){
        if(header.type ===1)totalPackages ++;

        logger.debug('header of type:%d,identity:%d,module:%s,totalPackage:%d, %d packages/s'
            ,header.type,header.identity,name,totalPackages,packagePerSecond);
    }
}();



module.exports = logger;