var app = require('express')();
var http = require('http').Server(app);
var io = require('socket.io')(http);
const port = 3000;
const rabbitmq = 'rabbitmq';
const exchange = 'chat';
const amqp = require('amqplib/callback_api');

var room = ''; //global for setting current user room#

app.get('/', function (req, res) {
    res.sendFile(__dirname + '/index.html');
});

consume();
io.on('connection', function (socket) {
    socket.on('chat message', function (msg) {
        publish(msg);
    });
    socket.on('room number', function (msg) {
        room = msg.toString();
        console.log('setting room to ' + room)

    })
});

http.listen(port, function () {
    console.log('listening on *:' + port);
});



//region publish-consume
function publish(msg) {
    amqp.connect('amqp://' + rabbitmq, function (error0, connection) {
        if (error0) {
            throw error0;
        }
        connection.createChannel(function (error1, channel) {
            if (error1) {
                throw error1;
            }

            channel.assertExchange(exchange, 'fanout', {
                durable: false
            });
            channel.publish(exchange, '', Buffer.from(JSON.stringify(msg)));
            console.log("Sent %s", JSON.stringify(msg));
        });
    });
}

function consume() {

    amqp.connect('amqp://' + rabbitmq, function (error0, connection) {
        if (error0) {
            throw error0;
        }
        connection.createChannel(function (error1, channel) {
            if (error1) {
                throw error1;
            }
            channel.assertExchange(exchange, 'fanout', {
                durable: false
            });

            channel.assertQueue('', {
                exclusive: false
            });
            console.log(" [*] Waiting for messages in %s. To exit press CTRL+C", '');
            channel.bindQueue('', exchange, '');

            channel.consume('', function (msg) {
                msg = JSON.parse(msg.content);
                console.log("consuming msg from room %s with current room %s", msg.r.toString(), room);
                if (room === msg.r.toString()) { //all workers listen receive all messages unfortunately. do not emit if not necessary.
                    io.emit('chat message' + room, msg.m)
                }

            }, {
                noAck: true
            });
        });

    });
}
//endregion