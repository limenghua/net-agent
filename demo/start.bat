start node echo-service-demo.js 9000
start node client-agent-demo.js --local-port 5000 --remote-port 6000

ping 127.0.0.1 -n 4

start node service-agent-demo.js --service-port 9000 --service-host 127.0.0.1 --remote-port 6000 --remote-host 127.0.0.1

ping 127.0.0.1 -n 4

telnet 127.0.0.1 5000


