const ServiceAgent = require('../to-service-agent')

let agent = ServiceAgent.createAgent(9099,'10.10.2.243',5000,'127.0.0.1');
agent.start();