var socket;
var block = new Block();
var players = [];
	
function setup() {
	noStroke();
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
        console.log("User:"+data.sID +" is jumping = "+data.jump);
        for (var i=0; i<players.length; i++){
        	if(players[i].id===data.sID)
        	{
        		players[i].jumping = true;
        	}
        }
      });
  socket.on('joined', function(data){
  		//Fill in empty spaces
  		for (var i=0; i<players.length; i++)
  		{
  			if (!players[i].active){
  				players[i].active = true;
  				players[i].id = data.sID;
  				var data = {
  					id:players[i].id,
  					playerNum:players[i].playerNum
  				};
  				socket.emit('playerData', data);
  				return;
  			}
  		}
  		//Else: create new
  		newPlayer(data.sID);
  		var data = {
  					id:players[players.length-1].id,
  					playerNum:players[players.length-1].playerNum
  				};
  				socket.emit('playerData', data);
  	});
  socket.on('left', function(data){
      for (var i=0; i<players.length; i++){
        if (players[i].id === data) {
        	players[i].active = false;
        }
      }
  });
}

function mousePressed() {
  // Draw some white circles
  fill(255);
  ellipse(mouseX,mouseY,80,80);

}

function newPlayer(id){
	players[players.length]=new Player(availableNum(players), id);
	console.log("new player: "+id);
}

function draw(){
	rectMode(CORNER);
  	background(100);
  	block.update();
  	for (var i=0; i<players.length; i++){
  		if (players[i].active)
  		players[i].update();
  	}
}

//Player Class
function Player(playerNum, id) {
	this.active = true;
	this.playerNum = playerNum;
	this.x = playerNum * 30 + 45;
	this.y = height-30;
	this.id = id;
	this.gravity = 1.1;
	this.speed = 18;
	this.jumping = false;
	this.score = 0;
	this.destroyCounter = 0;
	this.stalling = false;
	this.stallCount = 0;
}

Player.prototype.update = function(){
	if (this.stalling) this.stallCount++;
	if (this.stallCount > 4){
		this.stallCount = 0;
		this.stalling = false;
	}
	if (!this.collide()){
		fill(255,102,0);
		rect(this.playerNum*(width/25)+40, this.y,30,30);
	}
	else {
		fill(255);
	}
	text(this.playerNum,this.playerNum*(width/25)+45, this.y+17);
	if(this.collide()){
		console.log("player: "+this.playerNum+" had a collision");
	}
	/*else
		fill(255,255,0);*/
	this.jump();
	this.incScore();
}

Player.prototype.jump = function(){
	if (this.jumping)
    {
      this.y-=this.speed;
      this.speed-=this.gravity;
      if (this.y>=height-30)
      {
        this.y=height-30;
        this.speed =18;
        this.jumping = false;
      }
    }
}

Player.prototype.collide = function(){
    if (block.x >= this.x && block.x <= this.x+30
    && this.y+30 > block.y && block.y != 0)
    {
      this.sendScore();	
      this.score = 0;
      return true;
    }
    else
    {
      return false;
    }
}

Player.prototype.incScore = function(){
    if (block.x >= this.x && block.x <= this.x+30
    && this.y+30 < block.y && this.stalling === false)
    {
    this.score++;
    this.stalling = true;
    console.log("Player "+this.playerNum+"'s score: "+ this.score);
    this.sendScore();
    }
}

Player.prototype.sendScore = function()
{
	var data={
    	id:this.id,
    	score:this.score
    };
    socket.emit('incScore', data);
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
	fill(100,100,255);
	this.move();
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

function availableNum(arr){
	if (arr.length >0){
		for(var i=0; i<arr.length; i++){
			if (!arr[i].active){
				console.log("INHERE");
				console.log(arr[i].playerNum);
				arr[i].active = true;
				return[i+1]; //return playerNum
			}
		}
		return arr.length+1; //If all previous are active
	}
	return 1; //if there are no players
}

