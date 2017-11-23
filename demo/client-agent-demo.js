const ClientAgent = require('../to-client-agent');
const program = require('commander');

program
    .version('0.1.0')
    .option('-l,--local-port <n>','The local port listened for webserver connect in the worker side:default 9099')
    .option('-r,--remote-port <n>','The remote port listend for agent connection in the proxyServer side:defaul 9000')
    .parse(process.argv);

let localPort = program.localPort || 9099;
let remotePort = program.remotePort || 9000;

clientAgent = ClientAgent.createAgent(localPort,remotePort);
clientAgent.start();
console.log('agent run on:localPort:',localPort,",remotePort:",remotePort);
