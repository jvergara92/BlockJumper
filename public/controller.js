var buttonColor = 255;
var ID;

function setup() {
  socket = io.connect('http://localhost:8080');
  createCanvas(windowWidth, windowHeight);
  ellipseMode(CENTER);
  background(255,100,100);
  strokeWeight(3);
  textSize(width/10);
  textAlign(CENTER);
  socket.on('mouse',
      function(data){
        console.log("got: "+data.x+" "+data.y);
        fill(0,0,255);
        noStroke();
        ellipse(data.x,data.y,80,80);
      });
  socket.on('jump', 
      function(data){
        console.log("got: jumping!"+data.jump);
      });
  socket.on('id',
    function(data){
      ID = data;
      console.log(ID);
      joined(true,ID);
    })
}

function draw() {
  fill(buttonColor);
  ellipse(width/2,height/2,width/2,width/2);
  fill(0);
  text("JUMP!",width/2,height/2);
}

function mousePressed(){
  if (mouseX > width/4 && mouseX < 3*width/4 && mouseY < height/2+width/2 && mouseY > height/2-width/2)
  {
    buttonColor =155;
    sendJump(true);
  }
}

function mouseReleased(){
  buttonColor = 255;
}

function joined(isNewAvatar,ID){
  var data = {
    newAvatar:isNewAvatar,
    sID:ID
  };
  socket.emit('joined', data);
}

function sendJump(isJumping){
  var data = {jump:isJumping};
    console.log("sending: "+data.jump);
    socket.emit('jump', data);
}