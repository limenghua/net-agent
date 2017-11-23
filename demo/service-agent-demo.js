const ServiceAgent = require('../to-service-agent');
const program = require('commander');

program
    .version('0.1.0')
    .option('-p,--service-port <n>','the port used by service(proxy server)')
    .option('-h,--service-host [value]','the host ip of service(proxy server)')
    .option('-r,--remote-port <n>','the port used by remote agent in the web server side')
    .option('-t,--remote-host [value]','the host ip of agent in the web server side')
    .parse(process.argv);

let servicePort = program.servicePort || 9099;
let serviceHost = program.serviceHost || '10.10.2.243';
let remotePort = program.remotePort || 5000;
let remoteHost = program.remoteHost || '127.0.0.1';

console.log(serviceHost,servicePort,remoteHost,remotePort);

let agent = ServiceAgent.createAgent(servicePort,serviceHost,remotePort,remoteHost);
agent.start();
console.log('connect,servicePort:',servicePort,",serviceHost:",serviceHost,",remotePort:",remotePort,",remoteHost:",remoteHost);