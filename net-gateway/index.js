const net = require('net');

function createServer(localPort, remoteAddress, remotePort) {
    const server = net.createServer();
    server.listen(localPort);

    server.on('connection', handleConnection);

    function handleConnection(socket) {
        let client = new net.Socket();
        client.connect(remotePort,remoteAddress, function () {
            pipeSocket(socket, client);
        });
        client.on('error', () => {
            socket.end();
        });
    }

    function pipeSocket(socketIn, socketOut) {
        socketIn.pipe(socketOut);
        socketOut.pipe(socketIn);

        socketIn.on('close', () => {
            if (!socketOut.destroyed) {
                socketOut.end();
            }
        });
        socketOut.on('close', () => {
            if (!socketIn.destroyed) {
                socketIn.end();
            }
        });
    }
}

exports.createServer = createServer;