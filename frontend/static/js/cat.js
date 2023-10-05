
var calBottom = null;
var calTop= null;
var calleft= null;
var calright= null;
var FRAME = null;
var canvas = document.querySelector('#myCanvas');
let isRecalled  = false;
let isHoveringCat = false;
let lastMouseEventTime = null;
let clickListenerAdded = false;






// Function to get time elapsed since the last mouse event
function getTimeSinceLastMouseEvent() {
  if (lastMouseEventTime) {
    const currentTime = new Date();
    const elapsedTime = currentTime - lastMouseEventTime;
    return elapsedTime;
  } else {
    return 101;
  }
}



const spriteImage = new Image();
//spriteImage.src="https://purrfect_planner-1-z2375828.deta.app/setup/images/resized_walk_blink_stand_Spritesheet"
spriteImage.src="/setup/images/sleep_walk_blink_spritesheet"
//spriteImage.src="sleep_walk_blink_spritesheet.png"

const flippedspriteImage = new Image()
flippedspriteImage.src="/setup/images/flipped_sleep_walk_blink_spritesheet"
 //flippedspriteImage.src="flipped_sleep_walk_blink_spritesheet.png"
function game(){


	//console.log(isRecalled)
	const ctx = canvas.getContext('2d')

	const ROWS = 1
	const COLUMNS = 5
	const SPRITE_WIDTH = 320;
	const SPRITE_HEIGHT = 320;
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
	var CURRENT_ANIMATION = 'sleep'
	let GAMEFRAME = 0
	const STAGGERFRAMESINTIAL = 400;
	let STAGGERFRAMES = STAGGERFRAMESINTIAL;
	let toSleep = false;

	// {'name' : {'row': rowNumber, 'column' : columnMax}}
	const ANIMATIONKEY = {
		'wake' : {'row': 5, 'column': 11},
		'sleep' : {'row': 4, 'column' : 10},
		'blink' : {'row': 3, 'column' : 6},
		'pace' : {'row': 2, 'column' : 14},
		'stand': {'row': 1, 'column' : 5}
		};

	function getRandomInt(min, max) {
	  min = Math.ceil(min);
	  max = Math.floor(max);
	  return Math.floor(Math.random() * (max - min) + min); // The maximum is exclusive and the minimum is inclusive
	}


	function nextAnimationFrame(animation, FRAME){
		if (animation == 'sleep' && FRAME == 2){
			if (Math.random() * 10 < 6) {
				return 1
		}
			else {
				return 3
			}		
		
		}
		
		
		if (FRAME < ANIMATIONKEY[animation].column){
			return FRAME + 1;
		} else {
			return 1
		};		
	}
	
	
	function previousAnimationFrame(animation, FRAME){
		if (FRAME > 0){
			return FRAME - 1;
		} else {
			return  ANIMATIONKEY[animation].column
		};		
	}

	function handleMouseMove(event) {
	  isHoveringCat = false;


	  const mouseX = event.clientX - canvas.getBoundingClientRect().left;
	  const mouseY = event.clientY - canvas.getBoundingClientRect().top;
	  // Define the boundaries of your image
	  const imageX = XPOS;
	  const imageY = YPOS; 
	  const imageWidth = TARGETSPRITESIZE; 
	  const imageHeight = TARGETSPRITESIZE;
	  // Check if the mouse is within the boundaries of the image
	  if (
		mouseX >= imageX &&
		mouseX <= imageX + imageWidth &&
		mouseY >= imageY &&
		mouseY <= imageY + imageHeight
	  ) {
		isHoveringCat = true;
		console.log('Meow');
		if (CURRENT_ANIMATION != 'sleep'){
			CURRENT_ANIMATION = 'blink'
		} else {
			CURRENT_ANIMATION = 'wake'
		}
	  }
	}


	canvas.addEventListener('mousemove', handleMouseMove);


	

	function minBlinkFrames() {
	  const blinkArray = [6,6,12,18];

	  const minBlinkFrames = blinkArray[Math.floor(Math.random() * blinkArray.length)];
	  //console.log(minBlinkFrames)
	  //console.log(`next blink is ${(minBlinkFrames % 6) + 1} cycles`);
	  return minBlinkFrames;
	}

	var blinkframes = minBlinkFrames();
	const minStandFrames = ANIMATIONKEY['stand'].column - 1;
	var standframes = minStandFrames;
	let nextBlink = getRandomInt(500, 2000)
	const minsleepFrames = 5;
	let currentsleepFrames = minsleepFrames;


	function animate(){
		//console.log('Time since last mouse event (ms):', getTimeSinceLastMouseEvent());
		if (getTimeSinceLastMouseEvent() >= 100000 && !toSleep && CURRENT_ANIMATION != 'sleep' && CURRENT_ANIMATION != 'stand' && CURRENT_ANIMATION != 'wake'){
			//console.log('feeling sleepy', getTimeSinceLastMouseEvent(), CURRENT_ANIMATION)
			toSleep = true;
			CURRENT_ANIMATION = 'stand'
			FRAME = 5;

		//console.log(CURRENT_ANIMATION)
		} else if (CURRENT_ANIMATION == 'pace' && GAMEFRAME % nextBlink  == 0){
			//console.log('stop and blink')
			CURRENT_ANIMATION = 'blink'
			nextBlink = getRandomInt(1000, 5000);
			FRAME = 1;
		    //console.log(`next blink in ${nextBlink} frames`);

			
		} else if (CURRENT_ANIMATION == 'blink' && blinkframes == 0){
			CURRENT_ANIMATION = 'stand';
			FRAME = 1;
			blinkframes = minBlinkFrames();
		} else if (CURRENT_ANIMATION == 'stand' && standframes == 0 && !toSleep){
			CURRENT_ANIMATION = 'pace';
			standframes = minStandFrames;
			FRAME = 1;
		} else if (CURRENT_ANIMATION == 'sleep'  && getTimeSinceLastMouseEvent() <= 100){
		    //console.log('waking up')
			CURRENT_ANIMATION = 'wake'
			FRAME = 1;
		} else if (CURRENT_ANIMATION == 'wake' && FRAME == ANIMATIONKEY['wake'].column && !toSleep){
			CURRENT_ANIMATION = 'blink'
			standframes = minStandFrames;
			FRAME = 1;
		} 

		if (GAMEFRAME % STAGGERFRAMES == 0){
			ctx.clearRect(0,0, canvas.width, canvas.height);
			if (toSleep){
				FRAME = previousAnimationFrame(CURRENT_ANIMATION, FRAME)
			} else {
				FRAME = nextAnimationFrame(CURRENT_ANIMATION, FRAME);
			};
			//console.log(FRAME, GAMEFRAME)


			function animateCharacter() {
				function drawCharacter(image) {
					ctx.drawImage(image,
						SPRITE_WIDTH * (FRAME - 1), TOP_BUFFER + SPRITE_HEIGHT * (ANIMATIONKEY[CURRENT_ANIMATION].row - 1), // SX, SY
						SPRITE_WIDTH, SPRITE_HEIGHT, // sw, sh
						XPOS, YPOS, TARGETSPRITESIZE, TARGETSPRITESIZE); // DX, DY, DW, DH
				}

				if (CURRENT_ANIMATION == 'stand') {
					STAGGERFRAMES = 10;
					if (XDIRECTION == "RIGHT") {
						drawCharacter(spriteImage);
					} else {
						drawCharacter(flippedspriteImage);
					}
					standframes = standframes - 1;
					if (FRAME == 0 && toSleep) {
						//console.log('inverse waking');
						CURRENT_ANIMATION = 'wake';
						FRAME = ANIMATIONKEY['wake'].column + 1;
					}
				}

				if (CURRENT_ANIMATION == 'pace') {
					STAGGERFRAMES = 3;
					if (XPOS < Math.floor(calleft)) {
						XDIRECTION = "RIGHT";
					} else if (XPOS > Math.floor(calright) - TARGETSPRITESIZE - 60) {
						XDIRECTION = "LEFT";
					}

					if (XDIRECTION == "RIGHT") {
						XPOS = XPOS + 2;
						drawCharacter(spriteImage);
					} else {
						XPOS = XPOS - 2;
						drawCharacter(flippedspriteImage);
					}
				}

				if (CURRENT_ANIMATION == 'blink') {
					STAGGERFRAMES = 10;
					blinkframes = blinkframes - 1;
					if (XDIRECTION == "RIGHT") {
						drawCharacter(spriteImage);
					} else {
						drawCharacter(flippedspriteImage);
					}
				}

				if (CURRENT_ANIMATION == 'sleep') {
					STAGGERFRAMES = 50;
					if (currentsleepFrames > 0) {
						currentsleepFrames = currentsleepFrames - 1;
					}

					if (XDIRECTION == "RIGHT") {
						drawCharacter(spriteImage);
					} else {
						drawCharacter(flippedspriteImage);
					}

					if (toSleep) {
						toSleep = false;
					}
				}

				if (CURRENT_ANIMATION == 'wake') {
					STAGGERFRAMES = 5;
					if (XDIRECTION == "RIGHT") {
						drawCharacter(spriteImage);
					} else {
						drawCharacter(flippedspriteImage);
					}
					if (FRAME == 1 && toSleep) {
						CURRENT_ANIMATION = 'sleep';
						toSleep = false;
					}
				}
			}

			animateCharacter();		
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

	if (!clickListenerAdded){
		document.addEventListener('mousemove', function(event) {
			handleMouseMove(event);
			//console.log('mouseMoved');
		});

		canvas.addEventListener('click', function(event) {
			// Get the click coordinates
			handleMouseMove(event);
			lastMouseEventTime = new Date();

			const x = event.clientX;
			const y = event.clientY;


			if (x != 0  && y != 0 && isHoveringCat == false){
				// Use elementFromPoint to get the target element
				const targetElement = document.elementsFromPoint(x, y);
				console.log(targetElement);

				// Trigger a click event on the target element
				if (targetElement[1] && !isHoveringCat) {
					targetElement[1].click();
				};
			};
		});
	};

}

function showViewport() {
  //console.log('width', document.documentElement.clientWidth, window.innerWidth);
  //console.log('height', document.documentElement.clientHeight, window.innerHeight);
  // console.log('setting viewport')
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


