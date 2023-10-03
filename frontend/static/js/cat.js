
var calBottom = null;
var calTop= null;
var calleft= null;
var calright= null;
var FRAME = null;
var canvas = document.querySelector('#myCanvas');
let isRecalled  = false;

const spriteImage = new Image();
//spriteImage.src="https://purrfect_planner-1-z2375828.deta.app/setup/images/resized_Spritesheet"
spriteImage.src="/setup/images/resized_Spritesheet"

const flippedspriteImage = new Image()
//flippedspriteImage.src="https://purrfect_planner-1-z2375828.deta.app/setup/images/flipped_default_sprite"
flippedspriteImage.src="/setup/images/flipped_default_sprite"
function game(){


	//console.log(isRecalled)
	const ctx = canvas.getContext('2d')

	const ROWS = 1
	const COLUMNS = 2
	const SPRITE_WIDTH = spriteImage.width / COLUMNS;
	const SPRITE_HEIGHT = spriteImage.height / ROWS;
	//console.log('sprite W, H', SPRITE_WIDTH, SPRITE_HEIGHT)
	const CalHeader = document.querySelector('th.month').getBoundingClientRect()
	const HeaderBottom = CalHeader.bottom
	let x = 0;

	const TOP_BUFFER = 0
	//console.log(SPRITE_WIDTH, SPRITE_HEIGHT);
	var TARGETSPRITESIZE = Math.floor(canvas.height * 0.2);
	var XDIRECTION = 'LEFT'
	var XPOS = 0
	var YPOS = canvas.height - TARGETSPRITESIZE
	var CURRENT_ANIMATION = 'pace'
	let GAMEFRAME = 0
	const STAGGERFRAMESINTIAL = 1;
	let STAGGERFRAMES = STAGGERFRAMESINTIAL;

	// {'name' : {'row': rowNumber, 'column' : columnMax}}
	const ANIMATIONKEY = {
		'blink' : {'row': 1, 'column' : 2},
		'pace' : {'row': 1, 'column' : 1}
		};




	function nextAnimationFrame(animation, FRAME){
		if (FRAME < ANIMATIONKEY[animation].column){
			return FRAME + 1;
		} else {
			return 1
		};		
	}

	var blinkframes = 3

	function animate(){

		//console.log(CURRENT_ANIMATION)
		if (CURRENT_ANIMATION == 'pace' && GAMEFRAME % 1000 == 0 && XDIRECTION == 'LEFT'){
			//console.log('stop and blink')
			CURRENT_ANIMATION = 'blink'
			
		} else if (CURRENT_ANIMATION == 'blink' && blinkframes == 0){
			CURRENT_ANIMATION = 'pace'
			blinkframes = 3
		}

		if (GAMEFRAME % STAGGERFRAMES == 0){
			ctx.clearRect(0,0, canvas.width, canvas.height);

			FRAME = nextAnimationFrame(CURRENT_ANIMATION, FRAME);

			//console.log(FRAME, GAMEFRAME)

		
			if (CURRENT_ANIMATION == 'pace'){
				STAGGERFRAMES = STAGGERFRAMESINTIAL

			
			
				//console.log('pace')
				//console.log('pace')
					//XPOS ++;
				if (XPOS < Math.floor(calleft)){
					XDIRECTION = "RIGHT"
				} else if (XPOS > Math.floor(calright)-TARGETSPRITESIZE -10){
					XDIRECTION = "LEFT"
				};
			
				if (XDIRECTION == "RIGHT"){
					XPOS = XPOS + 3;

					ctx.drawImage(flippedspriteImage, 0, TOP_BUFFER, SPRITE_WIDTH, SPRITE_HEIGHT, XPOS, YPOS, TARGETSPRITESIZE , TARGETSPRITESIZE);

				} else {
					XPOS = XPOS - 3;
					ctx.drawImage(spriteImage, 0, TOP_BUFFER, SPRITE_WIDTH, SPRITE_HEIGHT, XPOS, YPOS, TARGETSPRITESIZE , TARGETSPRITESIZE);
					
				}
				
		
			}

			if (CURRENT_ANIMATION == 'blink'){
				STAGGERFRAMES = 60
				blinkframes = blinkframes - 1
				//console.log(blinkframes)
				ctx.drawImage(spriteImage, SPRITE_WIDTH*(FRAME - 1), TOP_BUFFER, SPRITE_WIDTH, SPRITE_HEIGHT*ANIMATIONKEY.blink.row, XPOS, YPOS, TARGETSPRITESIZE , TARGETSPRITESIZE);


			}
		
		};
		GAMEFRAME = GAMEFRAME + 1;
			
		//console.log(XDIRECTION, XPOS)
		//ctx.drawImage(spriteImage, sx, sy, sw, sh, dx, dy, dw, dh);
		//console.log(isRecalled)
		if (isRecalled == true){
			console.log('exiting')
			return	
		}
		requestAnimationFrame(animate);
		}

animate()
}

function showViewport() {
  //console.log('width', document.documentElement.clientWidth, window.innerWidth);
  //console.log('height', document.documentElement.clientHeight, window.innerHeight);
  console.log('setting viewport')
  var calendar = document.querySelector('tbody').getBoundingClientRect()
  calBottom = calendar.bottom
  calTop= calendar.top
  calleft= calendar.left
  calright=calendar.right
  //console.log(calleft, calright, calBottom, calTop)


  canvas.width = Math.floor(calright - calleft);
  canvas.height = Math.floor(calBottom - calTop);
  canvas.style.left = calleft
  canvas.style.top = calTop
  // END ANY EXISTING GAMES
  isRecalled = true;

  setTimeout(() => {

  if (isRecalled) {
	 isRecalled = false;
    game();
  }
}, 300);



}

// Initialize the game/canvas
window.onload = showViewport;
window.onresize = showViewport;  
