const canvas = document.querySelector('#myCanvas');


const ctx = canvas.getContext('2d')
const CANVAS_WIDTH = window.innerWidth;
const CANVAS_HEIGHT = window.innerHeight;
canvas.width = CANVAS_WIDTH;
canvas.height = CANVAS_HEIGHT;

const spriteImage = new Image();
spriteImage.src="/setup/images/resized_Spritesheet"
const flippedspriteImage = new Image()
flippedspriteImage.src="/setup/images/flipped_default_sprite"


//console.log(CANVAS_WIDTH, CANVAS_HEIGHT, canvas.width, canvas.height)
//returns(989, 1262, 300, 150)
const ROWS = 1
const COLUMNS = 2
const SPRITE_WIDTH = spriteImage.width / COLUMNS;
const SPRITE_HEIGHT = spriteImage.height / ROWS;


spriteImage.addEventListener('load', function() {
const ROWS = 1
const COLUMNS = 2
const SPRITE_WIDTH = spriteImage.width / COLUMNS;
const SPRITE_HEIGHT = spriteImage.height / ROWS;
const CalHeader = document.querySelector('th.month').getBoundingClientRect()
const HeaderBottom = CalHeader.bottom

let x = 0;

const TOP_BUFFER = 0
//console.log(SPRITE_WIDTH, SPRITE_HEIGHT);
var XDIRECTION = 'LEFT'
var XPOS = 0
var YPOS = HeaderBottom - Math.floor(CANVAS_HEIGHT * 0.133)

function animate(){
	ctx.clearRect(0,0, CANVAS_WIDTH, CANVAS_HEIGHT);

	//XPOS ++;
	if (XPOS < CalHeader.left){
		XDIRECTION = "RIGHT"
	} else if (XPOS > CalHeader.right - SPRITE_WIDTH/3){
		XDIRECTION = "LEFT"
	};
	
	
	if (XDIRECTION == "RIGHT"){
		XPOS = XPOS + 3;

		ctx.drawImage(flippedspriteImage, 0, TOP_BUFFER, SPRITE_WIDTH, SPRITE_HEIGHT, XPOS, YPOS, Math.floor(CANVAS_WIDTH * 0.125) , Math.floor(CANVAS_HEIGHT * 0.125));

	} else {
		XPOS = XPOS - 3;
		ctx.drawImage(spriteImage, 0, TOP_BUFFER, SPRITE_WIDTH, SPRITE_HEIGHT, XPOS, YPOS, Math.floor(CANVAS_WIDTH * 0.125) , Math.floor(CANVAS_HEIGHT * 0.125));

	}
	
	
	//console.log(XDIRECTION, XPOS)
	//ctx.drawImage(spriteImage, sx, sy, sw, sh, dx, dy, dw, dh);
	requestAnimationFrame(animate);



}
animate()
});
