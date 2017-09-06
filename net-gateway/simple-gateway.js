const net = require('net');

const server = net.createServer((socket) => {
    let proxySocket = new net.Socket();
    proxySocket.connect(9000, '127.0.0.1', () => {
        socket.pipe(proxySocket);
        proxySocket.pipe(socket);
    })
});
server.listen(6000);