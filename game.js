var canvas = null;
var context = null;

var frameIndex = 0;
var frameRate = 1000/9;

var audioBackground;
var audioJump;
var audioMessage;
var audioGameOver;

var GameOverScreen = Class.extend({
	sprite: null,
	
	init: function(){
		this.sprite = new Image();
		this.sprite.src = "img/game-over.png";
		this.sprite.onImageLoad = function (){};
	},
	
	draw: function(){
		context.drawImage(this.sprite,0,0);
	}
});

var gameOverScreen = new GameOverScreen();
var isGameOver = false;

var Player = Class.extend({
	position: {x: 0, y: 518},
	
	frameSize: {x: 42, y:44},
	
	frameIndex: {x: 0, y: 0},
	spriteSize: {width: 21, height:22},
	sprite: null,
	isJumping: false,
	finishImpulse: true,
	
	init: function(){
		this.sprite = new Image();
		this.sprite.src = "img/mario-spritesheet.png";
		this.sprite.onImageLoad = function (){};
	},
	
	idle: function() {
		if(this.frameIndex.y == 0 || this.frameIndex.y == 1)
			this.frameIndex.y = 0;
		else
			this.frameIndex.y = 2;
	
		this.frameIndex.x = 0;
	},
	
	walkTowards: function(){
		if(!this.isJumping){
			this.frameIndex.y = 0;
			this.walk();
		}
		else
			this.frameIndex.y = 1;
		this.position.x += 15;
	},
	
	walkBackwards: function(){
		if(!this.isJumping){
			this.walk();
			this.frameIndex.y = 2;
		}
		else
			this.frameIndex.y = 3;
		this.position.x -= 15;
	},
	
	jump: function (){
		if(!this.isJumping)
		{
			if(this.frameIndex.y == 0)
				this.frameIndex.y = 1;
			else
				this.frameIndex.y = 3;
			
			this.isJumping = true;
			this.finishImpulse = false;
			
			audioJump.play();
		}
	},
	
	jumping: function (){
		if(!this.finishImpulse)
		{
			this.position.y -= 10;
			this.frameIndex.x = 0;
			
			if(this.position.y <= 450)
				this.finishImpulse = true;
		}
		else
		{
			this.position.y += 10;
			this.frameIndex.x = 1;
			
			if(this.position.y >= 518)
				this.isJumping = false;
		}
	},
	
	walk: function (){
		this.frameIndex.x = (this.frameIndex.x + 1) % 2;
	},
	
	draw: function(){
		context.drawImage(this.sprite, 
		this.spriteSize.width * this.frameIndex.x, 
		this.spriteSize.height * this.frameIndex.y,
		21, 22, 
		this.position.x, 
		this.position.y,
		this.frameSize.x, this.frameSize.y);
	}
});
var player = new Player();

var Background = Class.extend({
	sprite: null,
	
	init: function(){
		this.sprite = new Image();
		this.sprite.src = "img/background.png";
		this.sprite.onImageLoad = function (){};
	},
	
	draw: function(){
		context.drawImage(this.sprite,0,0);
	}
});
var background = new Background();

var Block = Class.extend({
	position: {x: 0, y: 430},
	frameSize: {x: 30, y: 30},
	frameIndex: {x: 0},
	spriteSize: {width: 17, height:18},
	sprite: null,
	isOpen: false,
	
	init: function (xPos){
		this.position = {x: xPos, y: 430};
		this.frameIndex = {x: 0};
		this.sprite = new Image();
		this.sprite.src = "img/blocks-sprites.png";
		this.sprite.onImageLoad = function (){};
	},
	
	process: function (player){
		this.verifyCollide(player);
		if(!this.isOpen)
			this.frameIndex.x = (this.frameIndex.x + 1) % 3;
	},
	
	verifyCollide: function(player){
		if(player.position.x >= this.position.x - this.frameSize.x &&
			player.position.x <= this.position.x + this.frameSize.x &&
			player.position.y < this.position.y + this.frameSize.y)
		{
			player.finishImpulse = true;
			this.open();
		}
	},
	
	open: function(){
		this.isOpen = true;
		this.frameIndex = {x: 3};
		audioMessage.play();
		openDialog();
	},
	
	draw: function (){
	
	context.drawImage(this.sprite, 
		this.spriteSize.width * this.frameIndex.x, 
		0,
		18, 18, 
		this.position.x, 
		this.position.y,
		this.frameSize.x, this.frameSize.y);
	}
});
var blocks = [];

var IsThereDialogOpen = false;
var Dialog = Class.extend({
	sprite: null,
	isOpen: false,
	
	init: function(srcImg){
		this.sprite = new Image();
		this.sprite.src = srcImg;
		this.sprite.onImageLoad = function (){};
	},
	
	open: function (){
		this.isOpen = true;
		IsThereDialogOpen = true;
	},
	
	close: function (){
		this.isOpen = false;
		IsThereDialogOpen = false;
	},
	
	draw: function(){
		context.drawImage(this.sprite,300,80);
	}
});
var dialogs = [];


function animate(){
	context.clearRect(0, 0, canvas.width, canvas.height);
	background.draw();
	player.draw();
	
	for(var i = 0; i < blocks.length; i++)
		blocks[i].draw();
}

function update(){
	// TODO:
	
	processInput();
	
	
	if(player.isJumping)
		player.jumping();
		
	for(var i = 0; i < blocks.length; i++)
		blocks[i].process(player);
}


var keyPressed = [];
function onKeyDown(event){
	if(event.keyCode == 39) //right arrow
		keyPressed[39] = true;
	
	if(event.keyCode == 37) //right arrow
		keyPressed[37] = true;
		
	if(event.keyCode == 38)
		keyPressed[38] = true;
		
	if(IsThereDialogOpen)
	{
		if(event.keyCode == 13)
		{
			audioBackground.play();
			IsThereDialogOpen = false;
			dialogs.pop();
			
			if(dialogs.length <= 0)
			{
				audioBackground.pause();
				audioGameOver.play();
				isGameOver = true;
			}
		}
	}
}

function onKeyUp(e){
	if(event.keyCode == 39) //right arrow
		keyPressed[39] = false;
	
	if(event.keyCode == 37) //right arrow
		keyPressed[37] = false;
		
	if(event.keyCode == 38)
		keyPressed[38] = false;
}

function processInput(){
	if(keyPressed[39] || keyPressed[38] || keyPressed[37])
	{
		if(keyPressed[39]) //right arrow
			player.walkTowards();
		
		if(keyPressed[37]) //right arrow
			player.walkBackwards();
		
		if(keyPressed[38])
			player.jump();
	}
	else
	{
		if(!player.isJumping)
			player.idle();
	}
}

function gameLoop(){
	if(!isGameOver)
	{
		if(!IsThereDialogOpen){
			update();
			animate();
		}
		else
			dialogs[dialogs.length - 1].draw();
	}
	else
	{
		
		gameOverScreen.draw();
	}
}

function createBlock(xPos, imgDialog){
	blocks.push(new Block(xPos));
	dialogs.push(new Dialog(imgDialog));
}

function openDialog(){
	dialogs[dialogs.length - 1].open();
	audioBackground.pause();
}



function setup(pageCanvas){
	canvas = pageCanvas;
	context = canvas.getContext("2d");
	
	window.addEventListener("keydown",onKeyDown);
	window.addEventListener("keyup",onKeyUp);	
	
	createBlock(700, "img/dialog5.png");	
	createBlock(550, "img/dialog4.png");	
	createBlock(400, "img/dialog3.png");
	createBlock(250, "img/dialog2.png");
	createBlock(100, "img/dialog1.png");
	
	
	audioBackground = document.getElementById("audio");
	audioJump = document.getElementById("jump");
	audioMessage = document.getElementById("message");
	audioGameOver = document.getElementById("gameOver");
	
	audioBackground.volume = 0.05;
	
	keyPressed[37] = false;
	keyPressed[38] = false;
	keyPressed[39] = false;
	
	setInterval(gameLoop, frameRate);
}



