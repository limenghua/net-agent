# 实现一种将内网服务反向暴露到外部的一种代理

一、代码下载运行:

 * git clone https://github.com/limenghua/net-agent.git
 * cd net-agent
 * npm install
 * npm start


二、功能说明

* 代理实现由含两部分组成：内网代理和公网代理
* 内网代理负责处理负责连接实际服务。
* 公网代理负责接收客户请求。
* 内网连接到公网代理的端口，通过建立的socket进行数据传输。

三、文件夹组织

```
net-agent
├─.vscode
├─demo                     ------------------ Demo
├─net-gateway
├─test                     ------------------ 测试代码
│ ├─to-client-agent
│ └─to-service-agent
├─to-client-agent              -----------------  公网代理
├─to-service-agent             -----------------  内网代理
└─util                     -----------------  公共组件，主要是Package parser

```

四、公网代理和内网代理直接的通信协议（包格式）

```
//package struct
/*
    0        8       16       24       32
    |--------|--------|--------|--------|
    |version |   type |     checksum    |
    |    body lenght                    |
    |            identity...            |
    |            identity               |
    |        user data body...          |
*/
version:8bit ,当前值为1
type: 8bit (CONNECT || DATA || DISCONNECT)
lenth:32 bit 数据包body 长度
identity 64bit ,发送数据包的连接的唯一标识符（该标识符唯一确定数据包的来源和去向，是整个协议的核心）

```

五、代码分析

* util/package-parser.js   -----包解析

六、demo 说明
```
demo 主要启动四个进程，见demo/start.bat
start node echo-service-demo.js 9000              ::在9000端口运行Echo Server
start node client-agent-demo.js 5000 6000       ::公网代理分别在5000 6000端口监听
                                                其中，5000负责连接客户端，6000负责连接内网
start node service-agent-demo.js 9000 127.0.0.1 6000 127.0.0.1
                                                ::Service 内网代理，在9000端口连接echo server，在6000端口连接公网代理
telnet 127.0.0.1 5000                                  ::telnet 到5000端口（等价于连接Echo Server 9000端口）

```

四个进程的共启动3个tcp监听端口，连接关系如下图所示，箭头表示连接方向

