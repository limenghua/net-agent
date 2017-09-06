const net = require('net');

const server = net.createServer((socket)=>{
    socket.pipe(socket);
});

server.listen(9000);