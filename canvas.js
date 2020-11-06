////////////////////////////////////////
////////Made by Maclane Owen////////////
////////////////////////////////////////

var NAME_FONT = "600 64px Comic Sans MS, sans";

var POINTS = 100;
var POINT_RADIUS = 1.5;
var POINT_COLOR = "rgba(255,255,255,0.5)";
var LINE_COLOR = "rgba(255,255,255,0.5)";
var FILL_COLOR = "rgba(255,255,255,1)";
var BACKGROUND_COLOR = "#111111";
var TRANSPARENT = "rgba(0,0,0,0)";
var MIN_SPEED = 0.5;
var MAX_SPEED = 1.5;
var MAX_DISTANCE = 250;
var TRANSPARENCY_MULTIPLIER = 1;
var FRAMERATE_MULTIPLIER = 16.6;
var SCROLL_SMOOTHING = 0.5;
var SCROLL_MULTIPLIER = 0.66;

function main(){
    backgroundLoop();
    transitionLoop();
}

function transitionLoop(){
    console.log("Transition Canvas Loaded");

    
    var currScroll = 0;


    var canvas = document.getElementById("canvas2");
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight/2.5;

    var c = canvas.getContext("2d");
    
    var gradient = c.createLinearGradient(0,0,0,canvas.height/4);
    gradient.addColorStop(0,BACKGROUND_COLOR);
    gradient.addColorStop(1,TRANSPARENT);

    function printName(){
	let scrollPos = document.documentElement.scrollTop || document.body.scrollTop || 0;
	let adjustedPos = window.innerHeight/2+currScroll*SCROLL_MULTIPLIER-window.innerHeight
	
	currScroll += (scrollPos-currScroll)*SCROLL_SMOOTHING;
	
	c.font = NAME_FONT;
	c.fillStyle = BACKGROUND_COLOR;
	c.textAlign = "center";
	c.fillText("Maclane Owen", canvas.width/2, Math.min(canvas.height/2,adjustedPos));
	console.log(adjustedPos);
    }
    
    function animate(){
	requestAnimationFrame(animate);

	//Clear the canvas
	c.clearRect(0,0,innerWidth,innerHeight);
	c.fillStyle = gradient;
	c.fillRect(0,0,canvas.width,canvas.height/2);

	//Print name
	printName();
    }
    animate();
}

function backgroundLoop(){
    console.log("Background Canvas Loaded.");
    
    var currScroll = 0;
    
    var canvas = document.getElementById("canvas");
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    var c = canvas.getContext("2d");

    //Checks the current time. This will be used to calculate delta time
    time=Date.now();
    
    function outOfBounds(point){
	if(point.x<MAX_DISTANCE*-1 || point.x>window.innerWidth+MAX_DISTANCE)return true;
	if(point.y<MAX_DISTANCE*-1 || point.y>window.innerHeight+MAX_DISTANCE)return true;
	return false;
    }
    
    function genPath(onEdge){
	let path = {};
	
	let randX = Math.random()*window.innerWidth;
	let randY = Math.random()*window.innerHeight;

	let velX = MIN_SPEED + (MAX_SPEED-MIN_SPEED)*Math.random();
	let velY = MIN_SPEED + (MAX_SPEED-MIN_SPEED)*Math.random();

	//Chance of being on Y axis is proportional to proportion between window height and width
	let onYAxis = Math.random() > window.innerHeight/(window.innerWidth+window.innerHeight);
	
	//50-50 chance between top and bottom, or left and right, depending on primary axis
	let side = Math.random() > 0.5;
	let sideOffset = 0;
	
	//May Robert C Martin forgive me for this conditional mess
	if(onYAxis){
	    if(side) sideOffset = window.innerWidth;
	}
	else{
	    if(side) sideOffset = window.innerHeight;
	}

	if(onEdge){
	    if(onYAxis){
		path.x = sideOffset;
		path.y = randY;
		if(side)velX*=-1;
		velY*=Math.round(Math.random())*2-1;
	    }
	    else{
		path.x = randX;
		path.y = sideOffset;
		if(side)velY*=-1;
		velX*=Math.round(Math.random())*2-1;
	    }
	}
	else{
	    path.x = randX;
	    path.y = randY;
	    velX*=Math.round(Math.random())*2-1;
	    velY*=Math.round(Math.random())*2-1;
	}

	//Attach path velocities
	path.velX = velX;
	path.velY = velY;

	//console.log(velX);
	//console.log(velY);
	return path;
    }
    function getDist(x1,y1,x2,y2){
	let distX = Math.abs(x1-x2);
	let distY = Math.abs(y1-y2);

	return Math.sqrt(Math.pow(distX,2)+Math.pow(distY,2));
    }

    function drawPoint(point){
	c.beginPath();
	c.moveTo(point.x,point.y);
	
	c.strokeStyle = POINT_COLOR;
	c.arc(point.x,point.y,POINT_RADIUS,0,Math.PI*2,false);
	c.stroke();
	c.fillStyle = FILL_COLOR;
	c.fill();
    }

    function drawLine(point1,point2){
	c.beginPath();
	c.moveTo(point1.x,point1.y);

	c.strokeStyle = LINE_COLOR;
	
	c.lineTo(point2.x,point2.y);
    }

    function createPoint(onEdge){
	let path = genPath(onEdge);
	let point = {};

	//Copy values from path into point
	point.x = path.x;
	point.y = path.y;
	point.velX = path.velX;
	point.velY = path.velY;

	return point;
    };

    function connectPoints(point1,point2){
	let dist = getDist(point1.x,point1.y,point2.x,point2.y);
	if(dist>MAX_DISTANCE)return;
	//console.log(dist);
	let transparency = (MAX_DISTANCE-dist)/MAX_DISTANCE;
	transparency *= TRANSPARENCY_MULTIPLIER;
	c.strokeStyle = "rgba(255,255,255,"+transparency.toString()+")";

	c.beginPath();
	c.moveTo(point1.x,point1.y);
	c.lineTo(point2.x,point2.y);
	c.stroke();
    }

    function updatePoints(points,dt){
	//Garbage collect out of bounds elements
	for(let i=0;i<points.length;i++){
	    if(outOfBounds(points[i])){
		points[i] = null;
		points[i] = createPoint(true);
	    }
	}
	
	//Recalculate Point Positions
	for(let i=0;i<points.length;i++){
	    points[i].x += points[i].velX*(dt/FRAMERATE_MULTIPLIER);
	    points[i].y += points[i].velY*(dt/FRAMERATE_MULTIPLIER);
	}
	
	//Draw Points
	for(let i=0;i<points.length;i++){
	    drawPoint(points[i]);
	}

	//Connect Points
	for(let i=0;i<points.length-1;i++){
	    for(let j=i+1;j<points.length;j++){
		connectPoints(points[i],points[j]);
	    }	
	}

	//Connect Points To Mouse
	for(let i=0;i<points.length;i++){
	    
	}
    }

    function printName(){
	let scrollPos = document.documentElement.scrollTop || document.body.scrollTop || 0;
	currScroll += (scrollPos-currScroll)*SCROLL_SMOOTHING;
	
	c.font = NAME_FONT;
	c.fillStyle = "white";
	c.textAlign = "center";
	c.fillText("Maclane Owen", canvas.width/2, canvas.height/2+currScroll*SCROLL_MULTIPLIER);
    }
    
    function animate(){
	requestAnimationFrame(animate);

	let newTime = Date.now();
	
	//Clear the canvas
	c.clearRect(0,0,innerWidth,innerHeight);
	c.fillStyle = BACKGROUND_COLOR;
	c.fillRect(0,0,canvas.width,canvas.height);

	//Update background texture
	updatePoints(points,newTime-time);

	//Print Name
	printName();

	//Adjust new time variable
	time = newTime;
    }
    
    var points = [];
    for(let i=0;i<POINTS;i++){
	points.push(createPoint(false));
    }
    animate();
}
