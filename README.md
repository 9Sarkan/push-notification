# Push Notification
This peace of code has a node_websocket which a websocket connect to rabbitMQ, create 2 queue for user one of them for direct and
otherone for fanout after create queues consume them for messages if any message published on rabbitMQ to this queues this service 
publish them on websocket too.

## Authentication
user for connect to websocket has to send oauth2 token in header, so websocket validate this token with redis service in oauth service
you have to set token in redis as key and it's value will be user id which node websocket create queues according to user id.

## rabbitMQ.py
this file contain a class that establish connection with rabbitMQ for send messages to a specific queue.

## tasks.py
That file contain a function which car rabbitMQ class for send a message with error handled and loggers.

## docker-compose.yaml
docker compose file for create containers for rabbitMQ, redis, and node_websocket. before you call this file, you have to do below steps:
1. create secrets
2. create volumes for rabbitmq and redis
3. create an image of node_websocket with this command: `docker build -f node_websocket/dockerfile -t sporty-websocket:latest node_websocket/.`

after that steps you can deploy docker-compose file and enjoy ;)
