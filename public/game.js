var socket;
var block = new Block();
var players = [];
	
function setup() {
  	createCanvas(windowWidth, windowHeight);
  	background(100);
  	socket = io.connect('http://localhost:8080');
  	
  	socket.on('mouse',
      function(data){
        console.log("got: "+data.x+" "+data.y);
        fill(0,0,255);
        noStroke();
        ellipse(data.x,data.y,80,80);
      });
  socket.on('jump', 
      function(data){
        console.log("jumping!"+data.jump);
      });
}

function mousePressed() {
  // Draw some white circles
  fill(255);
  noStroke();
  ellipse(mouseX,mouseY,80,80);
  // Send the mouse coordinates
  sendmouse(mouseX,mouseY);
  newPlayer();
  console.log(players.length);

}

function newPlayer(){
	players[players.length]=new Player(players.length+1);
}

// Function for sending to the socket
function sendmouse(xpos, ypos) {
  // We are sending!
  console.log("sendmouse: " + xpos + " " + ypos);
  
  // Make a little object with  and y
  var data = {
    x: xpos,
    y: ypos
  };

  // Send that object to the socket
  socket.emit('mouse',data);
}

function draw(){
  	background(100);
  	block.update();
  	for (var i=0; i<players.length; i++)
  		players[i].update();
}

//Player Class
function Player(playerNum) {
	this.playerNum = playerNum;
	this.x = playerNum * 30 + 45;
	this.y = height-30;
	this.gravity = .8;
	this.speed = 0;
	this.jumping = false;
	this.score = 0;
	this.destroyCounter = 0;
	this.stallCount = 0;
}

Player.prototype.update = function(){
	rect(this.playerNum*(width/25)+40, height-30,30,30);
}

//Block Class
function Block(){
	this.x=300;
	this.y=0;
	this.speed = 0;
	this.acceleration = .1;
	this.maxSpeed = 20;
	this.waiting = false;
}

Block.prototype.update = function(){
	this.move();
	fill(100,100,255);
	rect(this.x,this.y,40,40);
	if (!(this.y>=height-40)) this.speed+=this.acceleration;
}

Block.prototype.move = function(){
	if (this.speed > this.maxSpeed && !this.waiting){
		this.maxSpeed = random(17,35);
		this.acceleration = random(-0.4, -.1);
		this.waiting = true;
	}
	if (this.speed< (-1*this.maxSpeed) && !this.waiting){
		this.maxSpeed = random(17,35);
		this.acceleration = random(.1, 0.4);
		this.waiting = true;
	}

	//Left
	if (this.x <= 0 && (this.y <=height-40 || this.y >0))
	{
		this.x = 0;
		this.y+=this.speed;
	}

	//bottom
	if (this.y>=height-40 && (this.x>0 || this.x<width-40))
	{
	if (abs(this.speed) < 10) this.speed *= 2;
		this.y = height-40;
		this.x+= this.speed;
	}

	//right
	if (this.x >= width-40 && (this.y>0 || this.y <= height-40)){
		this.x = width-40;
		this.y -= this.speed;
	}

	//top
	if (this.y <=0 && (this.x<=width || this.x >0)){
		this.y=0;
		this.x-=this.speed;
	}

	if (abs(this.speed)<abs(this.maxSpeed))
	{
		this.waiting = false;
	}
}


	
 
   