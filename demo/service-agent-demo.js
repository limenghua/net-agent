const ServiceAgent = require('../to-service-agent')

let args = process.argv.splice(2);

let servicePort = parseInt(args[0]) || 9099;
let serviceHost = args[1] || '10.10.2.243';
let remotePort = parseInt(args[2]) || 5000;
let remoteHost = args[3] || '127.0.0.1';

let agent = ServiceAgent.createAgent(servicePort,serviceHost,remotePort,remoteHost);
agent.start();
console.log('connect,servicePort:',servicePort,",serviceHost:",serviceHost,",remotePort:",remotePort,",remoteHost:",remoteHost);