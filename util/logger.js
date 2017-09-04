var log4js = require('log4js');

log4js.configure({
    appenders: { console: { type: 'console' } },
    categories: { default: { appenders: [ 'console' ], level: 'info' } }
  });

var logger = log4js.getLogger();
logger.level = 'debug';

logger.headerlog =  function(header,name){
    logger.debug('header of type:%d,identity:%d,module:%s',header.type,header.identity,name);
}

module.exports = logger;