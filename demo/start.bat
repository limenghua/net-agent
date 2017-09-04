start node echo-service-demo.js 9000
start node client-agent-demo.js 5000 6000

ping 127.0.0.1 -n 4

start node service-agent-demo.js 9000 127.0.0.1 6000 127.0.0.1

ping 127.0.0.1 -n 4

telnet 127.0.0.1 5000


