const net = require('net');

function createServer(port) {
    const server = net.createServer();
    server.listen(port);

    server.on('connection', (socket) => {
        socket.pipe(socket);
    });

    server.on('error',(err)=>{console.log("err:",err);});

    return server;
}

exports.createServer = createServer;