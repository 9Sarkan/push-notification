const WebSocket = require("ws");
const amqp = require("amqplib/callback_api");

const secrets = require("./secrets");
const redis = require("./redis");

const rabbitmqHost = process.env.RABBIT_MQ_HOST || "127.0.0.1";
const rabbitmqPort = process.env.RABBIT_MQ_PORT || 5672;
const rabbitmqUser =
    secrets.read("rabbitmq-user") || process.env.RABBIT_MQ_USER || "guest";
const rabbitmqPasswd =
    secrets.read("rabbitmq-passwd") || process.env.RABBIT_MQ_PASSWD || "guest";

const opt = {
    hostname: rabbitmqHost,
    port: rabbitmqPort,
    username: rabbitmqUser,
    password: rabbitmqPasswd,
};

const socketConnections = "socket_connections";

amqp.connect(opt, function(error0, rabbitConnection) {
    if (error0) {
        throw error0;
    }

    redis.client.del(socketConnections);

    const wss = new WebSocket.Server({ host: "localhost", port: 8080 });

    wss.on("connection", function connection(ws, request, client) {
        token = request.headers.authorization;
        try {
            token = token.split(" ");
        } catch {
            ws.close();
            return;
        }
        if (token[0] != "Bearer") {
            ws.close();
            return;
        }
        var key = "TOKEN:" + token[1];
        redis.client.get(key, function(err, userID) {
            if (err || userID == null) {
                ws.close();
                return;
            }
            redis.client.sismember(
                socketConnections,
                token[1],
                (err, replyNumber) => {
                    if (err || replyNumber === 1) {
                        ws.close();
                        return;
                    }
                    redis.client.sadd(socketConnections, token[1]);

                    rabbitConnection.createChannel((error1, channel) => {
                        if (error1) {
                            throw error1;
                        }
                        var queuePublic = "user_fanout_" + userID;
                        var queuePrivate = "user_" + userID;

                        channel.assertQueue(queuePublic, {
                            durable: true,
                        });
                        channel.assertQueue(queuePrivate, {
                            durable: true,
                        });

                        channel.bindQueue(queuePublic, "amq.fanout", "");

                        channel.consume(
                            queuePrivate,
                            (message) => {
                                ws.send(message.content.toString());
                            }, { noAck: true }
                        );
                        channel.consume(
                            queuePublic,
                            (message) => {
                                ws.send(message.content.toString());
                            }, { noAck: true }
                        );
                        ws.on("close", () => {
                            redis.client.srem(socketConnections, token[1]);
                            channel.close();
                        });
                    });
                }
            );
        });
    });
});