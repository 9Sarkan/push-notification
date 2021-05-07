import logging
from commons.rabbitMQ import Client

logger = logging.Logger(__name__)


def send_notification(user, payload):
    try:
        Client().send(f"user_{user}", payload)
    except Exception as e:
        logger.error(e.args[0])


def send_notification_receiver(sender, instance, created, *args, **kwargs):
    if created:
        user, payload = instance.get_notification_payload()
        send_notification(user, payload)
