const TILE_SIZE = 64;
const MAP_NUM_ROWS = 11;
const MAP_NUM_COLS = 15;

const WINDOW_WIDTH = MAP_NUM_COLS * TILE_SIZE;
const WINDOW_HEIGHT = MAP_NUM_ROWS * TILE_SIZE;

const FOV_ANGLE = 60 * (Math.PI / 180);
const WALL_STRIP_WIDTH = 15;//can be any #px, just take wall strip width == ray width
const NUM_RAYS = WINDOW_WIDTH / WALL_STRIP_WIDTH;

const MINIMAP_SCALE_FACTOR = 0.2;

class Map{
    constructor(){
        this.grid = [
            [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
            [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 1],
            [1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 1, 0, 1],
            [1, 1, 1, 1, 0, 0, 0, 0, 0, 0, 1, 0, 1, 0, 1],
            [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 1, 0, 1],
            [1, 0, 0, 0, 0, 0, 0, 0, 1, 1, 1, 1, 1, 0, 1],
            [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
            [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
            [1, 1, 1, 1, 1, 1, 0, 0, 0, 1, 1, 1, 1, 0, 1],
            [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
            [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1]
          ];
    }

    hasWallAt(x,y){
        if(x<0||x>WINDOW_WIDTH||y<0||y>WINDOW_HEIGHT) return true;
        var mapGridIndexX = Math.floor(x/TILE_SIZE);
        var mapGridIndexY = Math.floor(y/TILE_SIZE);
        //return this.grid[mapGridIndexX][mapGridIndexY]!=0;//or ==1
        return this.grid[mapGridIndexY][mapGridIndexX] != 0;
    }

    render(){
        for(var i=0;i<MAP_NUM_ROWS;i++){
            for(var j=0;j<MAP_NUM_COLS;j++){
                //inverse coord sys, i(rows) is for y, j(cols) is fpr x
                var tileX = j * TILE_SIZE;
                var tileY = i * TILE_SIZE;
                var tileColor = this.grid[i][j] == 1 ? "#222" : "#fff"; //dark:light color
                stroke("#222"); //dark color
                fill(tileColor);
                rect(
                    MINIMAP_SCALE_FACTOR * tileX, 
                    MINIMAP_SCALE_FACTOR * tileY, 
                    MINIMAP_SCALE_FACTOR * TILE_SIZE, 
                    MINIMAP_SCALE_FACTOR * TILE_SIZE);
            }
        }stroke("red");// line to show rotation from current directn with length of 30px 
        line(this.x,this.y,//origin
            this.x+Math.cos(this.rotationAngle)*30, //adjacent side
            this.y+Math.sin(this.rotationAngle)*30 //opposite side
        );
    }
}
class Player{
    constructor(){
        this.x = WINDOW_WIDTH/2;
        this.y = WINDOW_HEIGHT/2;
        this.radius = 3;
        this.turnDirection = 0;//-1 if left, 1 if right
        this.walkDirection = 0;//-1 if back, 1 if front 
        this.rotationAngle = Math.PI/2;//init 90 deg
        this.moveSpeed = 2.0;//px per frame
        this.rotationSpeed = 2*(Math.PI/180);
    }
    update(){
        // TODO: update player posn based on turnDirectn & walkDirectn
        //console.log(this.turnDirection);//just to check
        //added to fix:
        /* keyReleased() only fires for the last key that was released, 
        not all keys that might be pressed at the same time. 
        This leads to situations like:

        Press and hold RIGHT_ARROW → sets player.turnDirection = +1.

        Press and hold UP_ARROW → sets player.walkDirection = +1.

        Release UP_ARROW → sets walkDirection = 0.

        But if RIGHT_ARROW was released before UP_ARROW, 
        keyReleased() doesn’t detect this, and turnDirection stays non-zero.

        This causes the player.update() logic to 
        keep moving the player because one of the movement states remains active.

        ✅ Robust Fix
        Track key states directly using keyIsDown() 
        in the update() function. This avoids relying on 
        the keyPressed/keyReleased events.
        */
        if (keyIsDown(LEFT_ARROW)) {
            this.turnDirection = -1;
        } else if (keyIsDown(RIGHT_ARROW)) {
            this.turnDirection = +1;
        } else {
            this.turnDirection = 0;
        }
    
        if (keyIsDown(UP_ARROW)) {
            this.walkDirection = +1;
        } else if (keyIsDown(DOWN_ARROW)) {
            this.walkDirection = -1;
        } else {
            this.walkDirection = 0;
        }
        //update directn
        this.rotationAngle += this.turnDirection*this.rotationSpeed;
        //movement - update x and y (displacement)
        var moveStep = this.walkDirection*this.moveSpeed;
        var newPlayerX = this.x + Math.cos(this.rotationAngle)*moveStep;
        var newPlayerY = this.y + Math.sin(this.rotationAngle)*moveStep;
        //only set new player posn if it isn't colliding w/ the map walls
        if(!grid.hasWallAt(newPlayerX,newPlayerY)){
            this.x = newPlayerX;
            this.y = newPlayerY;
        }
    }
    render(){
        noStroke();
        fill("red");
        circle( MINIMAP_SCALE_FACTOR * this.x, 
            MINIMAP_SCALE_FACTOR * this.y, 
            MINIMAP_SCALE_FACTOR * this.radius);
        stroke("red");// line to show rotation from current directn with length of 30px 
        line( MINIMAP_SCALE_FACTOR * this.x, MINIMAP_SCALE_FACTOR * this.y,//origin
            MINIMAP_SCALE_FACTOR * (this.x+Math.cos(this.rotationAngle)*30), //adjacent side
            MINIMAP_SCALE_FACTOR * (this.y+Math.sin(this.rotationAngle)*30) //opposite side
        );
    }
}

class Ray{
    constructor(rayAngle){
        this.rayAngle = normalizeAngle(rayAngle);
        //this.x = player.x;
        //this.y = player.y;
        this.wallHitX = 0;
        this.wallHitY = 0;
        this.distance = 0;
        this.wasHitVertical = false;

        // to identify 1 of 4 cases of diffferent ray directns
        this.isRayFacingDown = ((this.rayAngle > 0) && (this.rayAngle < Math.PI)); //b/w 0 and 180 deg
        this.isRayFacingUp = !this.isRayFacingDown;//for readibilty
        this.isRayFacingRight = ((this.rayAngle < (0.5 * Math.PI)) || (this.rayAngle > (1.5 * Math.PI))) ;//either less than 90deg or morethan 270deg
        this.isRayFacingLeft = !this.isRayFacingRight;//for readibility
    }

    cast(columnId){
        var xintercept, yintercept;
        var xstep, ystep;
        /////////----/////////////////////////////
        // HORIZONTAL RAY_GRID INTERSECTION CODE
        ///////////////////////////////////////////
        // //test
        // console.log("isRayFacingRight?", this.isRayFacingRight);
        
        var foundHorzWallHit = false;
        var horzWallHitX = 0;
        var horzWallHitY = 0;
        // find y-coord of closest hori grid intersectn
        yintercept = Math.floor(player.y / TILE_SIZE) * TILE_SIZE;
        yintercept += (this.isRayFacingDown)? TILE_SIZE : 0 ; 
        // find x-coord of closest hori grid intersectn
        xintercept = player.x + ((yintercept - player.y) / Math.tan(this.rayAngle));
        // calc the increment xstep & ystep
        ystep = TILE_SIZE;
        ystep *= (this.isRayFacingUp)? -1 : 1;

        xstep = TILE_SIZE / Math.tan(this.rayAngle);
        xstep *= (this.isRayFacingLeft && xstep > 0) ? -1 : 1;
        xstep *= (this.isRayFacingRight && xstep < 0) ? -1 : 1;

        var nextHorzTouchX = xintercept;
        var nextHorzTouchY = yintercept;
        //if(this.isRayFacingUp) nextHorzTouchY--; //one pixel lower to force it to be in previous cell
        
        //Increment xstep and ysttep until we find a wall
        while(nextHorzTouchX>=0 && nextHorzTouchX<=WINDOW_WIDTH
            && nextHorzTouchY>=0 && nextHorzTouchY<=WINDOW_HEIGHT
        ){
            if(grid.hasWallAt(nextHorzTouchX, nextHorzTouchY - (this.isRayFacingUp ? 1 : 0))){
                foundHorzWallHit = true;
                horzWallHitX = nextHorzTouchX;
                horzWallHitY = nextHorzTouchY;

                // stroke("red");
                // line(player.x, player.y, horzWallHitX, horzWallHitY);
                break;
            } else{
                nextHorzTouchX += xstep;
                nextHorzTouchY += ystep;
            }
        }

        /////////----/////////////////////////////
        // VERTICAL RAY_GRID INTERSECTION CODE
        ///////////////////////////////////////////
        // //test
        // console.log("isRayFacingRight?", this.isRayFacingRight);
        
        var foundVertWallHit = false;
        var  vertWallHitX = 0;
        var  vertWallHitY = 0;
        // find x-coord of closest vert grid intersectn
        xintercept = Math.floor(player.x / TILE_SIZE) * TILE_SIZE;
        xintercept += (this.isRayFacingRight)? TILE_SIZE : 0 ; 
        // find y-coord of closest vert grid intersectn - most important change
        yintercept = player.y + ((xintercept - player.x) * Math.tan(this.rayAngle));
        // calc the increment xstep & ystep
        xstep = TILE_SIZE;
        xstep *= (this.isRayFacingLeft)? -1 : 1;

        ystep = TILE_SIZE * Math.tan(this.rayAngle);
        ystep *= (this.isRayFacingUp && ystep > 0) ? -1 : 1;
        ystep *= (this.isRayFacingDown && ystep < 0) ? -1 : 1;

        var nextVertTouchX = xintercept;
        var nextVertTouchY = yintercept;
        //if(this.isRayFacingUp) nextVertTouchY--; //one pixel lower to force it to be in previous cell
        
        //Increment xstep and ystep until we find a wall
        while(nextVertTouchX>=0 && nextVertTouchX<=WINDOW_WIDTH
            && nextVertTouchY>=0 && nextVertTouchY<=WINDOW_HEIGHT
        ){
            if(grid.hasWallAt(nextVertTouchX - (this.isRayFacingLeft ? 1 : 0), nextVertTouchY)){
                foundVertWallHit = true;
                 vertWallHitX = nextVertTouchX;
                 vertWallHitY = nextVertTouchY;

                // stroke("red");
                // line(player.x, player.y,  vertWallHitX,  vertWallHitY);
                break;
            } else{
                nextVertTouchX += xstep;
                nextVertTouchY += ystep;
            }
        }

        //Calc hori and vert distances & choose smaller value
        var horzHitDistance = (foundHorzWallHit) ? 
                                distanceBetweenPoints(player.x,player.y,horzWallHitX,horzWallHitY)
                                : Number.MAX_VALUE;
        var vertHitDistance = (foundVertWallHit) ? 
                                distanceBetweenPoints(player.x,player.y,vertWallHitX,vertWallHitY)
                                : Number.MAX_VALUE;
        this.wallHitX = (horzHitDistance < vertHitDistance)? horzWallHitX : vertWallHitX;
        this.wallHitY = (horzHitDistance < vertHitDistance)? horzWallHitY : vertWallHitY;
        this.distance = (horzHitDistance < vertHitDistance)? horzHitDistance : vertHitDistance;
        //this.wasHitVertical = (vertHitDistance <= horzHitDistance)? true:false;
        this.wasHitVertical = (vertHitDistance < horzHitDistance);

    }

    render(){
        //stroke("yellow");
        stroke("rgba(255, 0, 0, 0.3)");
        // line(this.x,this.y,//origin
        //     this.x+Math.cos(this.rayAngle)*30, //adjacent side
        //     this.y+Math.sin(this.rayAngle)*30 //opposite side
        // );
        line( MINIMAP_SCALE_FACTOR * player.x, MINIMAP_SCALE_FACTOR * player.y,//origin
            //player.x+Math.cos(this.rayAngle)*30, //adjacent side
            //player.y+Math.sin(this.rayAngle)*30 //opposite side
            MINIMAP_SCALE_FACTOR * this.wallHitX,
            MINIMAP_SCALE_FACTOR * this.wallHitY
        );
    }
}

var grid = new Map();
var player = new Player();
var rays = [];

function normalizeAngle(angle){
    angle = angle % (2 * Math.PI);//always keep my angle val b/w o to 2pi rad (0 to 360 deg]
    if(angle <0){
        //if -ve, add 2pi to make +ve
        angle += (2 * Math.PI); 
    }
    return angle;
}

// function keyPressed(){
//     if(keyCode == UP_ARROW){
//         player.walkDirection = +1;
//     }else if(keyCode == DOWN_ARROW){
//         player.walkDirection = -1;
//     }else if(keyCode == RIGHT_ARROW){
//         player.turnDirection = +1;
//     }else if(keyCode == LEFT_ARROW){
//         player.turnDirection = -1;
//     }
// }
// function keyReleased(){
//     if(keyCode == UP_ARROW){
//         player.walkDirection = 0;
//     }else if(keyCode == DOWN_ARROW){
//         player.walkDirection = 0;
//     }else if(keyCode == RIGHT_ARROW){
//         player.turnDirection = 0;
//     }else if(keyCode == LEFT_ARROW){
//         player.turnDirection = 0;
//     }
// }

function castAllRays(){
    var columnId = 0;
    // start first ray substracting half of the FOV
    var rayAngle = player.rotationAngle - (FOV_ANGLE / 2);
    rays = [];
    // loop all columns  casting the rays
    for(var i=0; i< NUM_RAYS; i++){
    //for(var i=0; i< 1; i++){
        var ray = new Ray(rayAngle);
        ray.cast(columnId);
        rays.push(ray);
        rayAngle += FOV_ANGLE / NUM_RAYS;
        columnId++;
    }
}

function render3DProjectedWalls() {
    // loop every ray in the array of rays
    for (var i = 0; i < NUM_RAYS; i++) {
        var ray = rays[i];

        //var rayDistance = ray.distance;
        //correct fish eye/bowl effect
        //get the perpendicular distance to the wall to fix fishbowl distortion
        var correctedWallDistance = ray.distance * Math.cos(ray.rayAngle - player.rotationAngle);
        // calc the dist to the projection plane
        var distanceProjectionPlane = (WINDOW_WIDTH / 2) / Math.tan(FOV_ANGLE / 2);

        // projected wall height
        //var wallStripHeight = (TILE_SIZE / rayDistance) * distanceProjectionPlane;
        var wallStripHeight = (TILE_SIZE / correctedWallDistance) * distanceProjectionPlane;
        //fill("rgba(255, 255, 255, 1.0)");
        // compute transparency based on wall dist
        var alpha = 170 / correctedWallDistance;
        //fill("rgba(255, 255, 255, "+ alpha +")");
        //var alp = 255*alpha;
        var gray = 255 * alpha;
        fill(gray, gray, gray, 255 * alpha);
        noStroke();
        rect(
           i * WALL_STRIP_WIDTH,
           (WINDOW_HEIGHT / 2) - (wallStripHeight / 2),
           WALL_STRIP_WIDTH,
           wallStripHeight
        );
    }
}

function normalizeAngle(angle){
    angle = angle % (2 * Math.PI);//always keep my angle val b/w o to 2pi rad (0 to 360 deg]
    if(angle <0){
        //if -ve, add 2pi to make +ve
        angle += (2 * Math.PI); 
    }
    return angle;
}

function distanceBetweenPoints(x1,y1,x2,y2){
    return Math.sqrt((x2-x1)*(x2-x1) + (y2-y1)*(y2-y1));
}

function setup(){
    // TODO: initialize all objects
    createCanvas(WINDOW_WIDTH, WINDOW_HEIGHT);
}
function update(){
    // TODO: update all game objects before we render the next frame
    player.update();
    //comment out for now for testing
    castAllRays();

}
function draw(){
    // TODO: render all objects frame by frame
    clear("#212121");
    update();

    render3DProjectedWalls();

    grid.render(); 
    //player.render();
    for(ray of rays){
        ray.render();
    }
    //render player after rays
    player.render();
    //for testing
    //castAllRays();
}