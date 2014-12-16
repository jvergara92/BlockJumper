var path = require('path');
var express = require('express');
var app = express();
var server = require('http').createServer(app);
app.use(express.static(path.join(__dirname, 'public')));
app.listen(8080);

// Using the filesystem module


var io = require('socket.io')(server);



// Register a callback function to run when we have an individual connection
// This is run for each individual user that connects
io.on('connection',
  // We are given a websocket object in our function
  function (socket) {

  	socket.on('jump', function(data){
  		console.log(data);
  	})
  
    console.log("We have a new client: " + socket.id);
  
    // When this user emits, client side: socket.emit('otherevent',some data);
    socket.on('mouse',
      function(data) {
        // Data comes in as whatever was sent, including objects
        console.log("Received: 'mouse' " + data.x + " " + data.y);
      
        // Send it to all other clients
        socket.broadcast.emit('mouse', data);
        
        // This is a way to send to everyone including sender
        // io.sockets.emit('message', "this goes to everyone");

      }
    );
    
    socket.on('disconnect', function() {
      console.log("Client has disconnected");
    });
  }
);