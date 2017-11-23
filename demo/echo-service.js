const net = require('net');

let args = process.argv.splice(2);
let port = parseInt(args) || 6000;


let index = 1;

function createServer() {
    const server = net.createServer();

    server.on('connection', (socket) => {
		console.log(index,' new connection');
        index ++;
        socket.on('data',(data)=>{
			console.log('recv data:',data.toString());
			socket.write(data);
		});
		socket.on('close',()=>{
			console.log('connection closed');
		});
		socket.on('error',(err)=>{
			console.log('error:',err);
		});
    });

    server.on('error',(err)=>{console.log("err:",err);});
    return server;
}

let server = createServer();
server.listen(port);
console.log('echo service listen on ',port);