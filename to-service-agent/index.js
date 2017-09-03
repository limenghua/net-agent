const AgentConnection = require('./agent-connection');
const ServiceConnection = require('./service-connection');

class ServiceAgent {
    constructor(servicePort, serviceHost, agentPort, agentHost) {
        this.servicePort = servicePort;
        this.serviceHost = serviceHost;
        this.agentPort = agentPort;
        this.agentHost = agentHost;

        this._agentConnection = new AgentConnection();
        this._serviceConnection = new ServiceConnection();
    }

    start() {
        this._serviceConnection.connect(this.servicePort, this.serviceHost);

        this._serviceConnection.on('ready', () => {
            this._agentConnection.connect(this.agentPort, this.agentHost);
            this._agentConnection.on('message', (header, body) => {
                this._serviceConnection.dispatch(header, body);
            });

            this._serviceConnection.on('message', (header, body) => {
                this._agentConnection.dispatch(header, body);
            });

        });
    }

    stop() {
        this._agentConnection.close();
        this._serviceConnection.close();
    }

}


function createAgent(servicePort, serviceHost, agentPort, agentHost) {
    const agent = new ServiceAgent(servicePort, serviceHost, agentPort, agentHost);
    return agent;
}

exports.createAgent = createAgent;