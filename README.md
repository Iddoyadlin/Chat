# Scalable Chat
chat app base on websockets that can scale horizontally. RabbitMQ is used for synchronization.
Parts of the code were taken from https://socket.io/get-started/chat/ 

## How to Run
From project root directory, run in console `sudo docker-compose up --scale server=2`.

One of the workers will run on port 3000, the other on port 3001. 


