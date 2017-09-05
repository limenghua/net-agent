const AgentConnection = require('./agent-connection');
const ServiceConnection = require('./service-connection');

/**
 * the agent in the customer side.
 * run as two client,connect to the service port and the agent port in the cloud.
 * route the patch between two side.
 * 
 * @class ServiceAgent
 */
class ServiceAgent {
    /**
     * Creates an instance of ServiceAgent.
     * @param {number} servicePort - the port of the service in the customer side, some servcie as 'proxyServer' 
     * @param {string} serviceHost - the host of the servcie,more times ,is the ip address.
     * @param {number} agentPort - the port of the agent in the cloud side.
     * @param {string} agentHost - the host of the agent in the cloud side.
     * @memberof ServiceAgent
     */
    constructor(servicePort, serviceHost, agentPort, agentHost) {
        this.servicePort = servicePort;
        this.serviceHost = serviceHost;
        this.agentPort = agentPort;
        this.agentHost = agentHost;

        this._agentConnection = new AgentConnection();
        this._serviceConnection = new ServiceConnection();
    }

    /**
     * start the agent,will auto connect the service and the agent in the cloud.
     * 
     * @memberof ServiceAgent
     */
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

    /**
     * stop the agent.will close all the connections auto.
     * 
     * @memberof ServiceAgent
     */
    stop() {
        this._agentConnection.close();
        this._serviceConnection.close();
    }

}

/**
 * create the service agent,you must manual call the start() to begin the work.
 * 
 * @param {number} servicePort - the port of the service in the customer side, some servcie as 'proxyServer' 
 * @param {string} serviceHost - the host of the servcie,more times ,is the ip address.
 * @param {number} agentPort - the port of the agent in the cloud side.
 * @param {string} agentHost - the host of the agent in the cloud side.
 * @returns the ServiceAgent object
 */
function createAgent(servicePort, serviceHost, agentPort, agentHost) {
    const agent = new ServiceAgent(servicePort, serviceHost, agentPort, agentHost);
    return agent;
}

exports.createAgent = createAgent;