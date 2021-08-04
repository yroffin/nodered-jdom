var Crawler = require("crawler");

const jsdom = require("jsdom");
const { JSDOM } = jsdom;

module.exports = function (RED) {
    function JdomNode(config) {
        RED.nodes.createNode(this, config);
        var node = this;

        const virtualConsole = new jsdom.VirtualConsole();
        virtualConsole.on("info", (msg) => { node.info(msg) });
        virtualConsole.on("error", (msg) => { node.error(msg) });
        virtualConsole.on("warn", (msg) => { node.warn(msg) });

        const crawler = new Crawler({
            // Set crawler config
            strictSSL: true,
            jQuery: jsdom,
            http2: true,
            referer: true,
            maxConnections: 10
        });

        node.on('input', function (msg) {
            (async () => {
                try {
                    // retrieve html
                    // Queue just one URL
                    crawler.queue([{
                        // Extract data from payload
                        headers: msg.payload.headers,
                        uri: `${msg.payload.url}${msg.payload.path}?${msg.payload.query}`,
                        method: msg.payload.method,

                        // The global callback won't be called
                        callback: function (error, res, done) {
                            if (error) {
                                node.error(error);
                            } else {
                                //node.log(`body: ${res.body}`);
                                const dom = new JSDOM(res.body, {
                                    url: `${msg.payload.url}${msg.payload.path}?${msg.payload.query}`,
                                    runScripts: "dangerously",
                                    resources: "usable",
                                    includeNodeLocations: true,
                                    storageQuota: 10000000,
                                    virtualConsole
                                });
                                // send result
                                node.send({
                                    payload: {
                                        body: res.body,
                                        raw: dom.serialize(),
                                        dom: dom
                                    }
                                });
                            }
                            done();
                        }
                    }]);
                } catch (error) {
                    node.error(error);
                }
            })();
        });
    }
    RED.nodes.registerType("jdom", JdomNode);
}