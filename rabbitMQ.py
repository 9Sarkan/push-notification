import os

import pika
from commons.utils import get_env, get_docker_secret


class Client:
    __instance = None

    def __new__(cls, *args, **kwargs):
        if cls.__instance == None:
            cls.__instance = super(Client, cls).__new__(Client, *args, **kwargs)
        return cls.__instance

    def __init__(self):
        username = get_docker_secret("rabbitmq-user", "django")
        password = get_docker_secret("rabbitmq-passwd", "adminadmin")
        host = get_env("RABBIT_MQ_HOST", "localhost")
        port = get_env("RABBIT_MQ_PORT", 5672)

        crendentials = pika.PlainCredentials(username, password)
        connection = pika.BlockingConnection(
            pika.ConnectionParameters(host=host, port=port, credentials=crendentials)
        )
        channel = connection.channel()
        self.channel = channel

    def close(self):
        self.channel.close()

    def send(self, queue, body, exchange="amq.direct", routing_key="hello"):
        self.channel.queue_declare(queue=queue, durable=True)
        self.channel.queue_bind(exchange=exchange, queue=queue, routing_key=routing_key)
        self.channel.basic_publish(exchange, routing_key=routing_key, body=body)
