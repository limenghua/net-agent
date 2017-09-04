const ServiceAgent = require('../to-service-agent')

let agent = ServiceAgent.createAgent(6000,'127.0.0.1',5000,'127.0.0.1');
agent.start();