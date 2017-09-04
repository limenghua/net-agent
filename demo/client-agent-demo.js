const ClientAgent = require('../to-client-agent');
let args = process.argv.splice(2);

let localPort = parseInt(args[0]) || 9099;
let remotePort = parseInt(args[1]) || 5000;

clientAgent = ClientAgent.createAgent(localPort,remotePort);
clientAgent.start();
console.log('agent run on:localPort:',localPort,",remotePort:",remotePort);
