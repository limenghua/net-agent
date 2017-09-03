const net = require('net');

function createServer(port) {
    const server = net.createServer();
    server.listen(port);

    server.on('connection', (socket) => {
		console.log('new connection');
        socket.on('data',(data)=>{
			console.log('recv data:',data.toString());
			socket.write(data);
		});
		socket.on('close',()=>{
			console.log('connection closed');
		});
    });

    server.on('error',(err)=>{console.log("err:",err);});

    return server;
}

exports.createServer = createServer;