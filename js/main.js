 /* Javascript */
//Ground
const ground = $('#ground');
const scoreContainer = $('#score');
const gameOverWindow = $('.gameover');
const resetScoreBtn = $('.reset-score');
resetScoreBtn.on('click', function(){
    localStorage.removeItem('highestScore');
    resetScoreBtn.append('<p>Done!</p>');
    setTimeout(function(){resetScoreBtn.find('p').remove()}, 5000);
});

//Ground limits
let allowedLimitY = 800;
let allowedLimitX = 800;

//Box dimensions
const unit = 16;
const box = $('<div class="box"></div>');
let colorGrading = 0;
let stepsSinceCollision = 0;

//My snake
let snake = [];

//starting position
snake[0] = {
    x : unit * 24,
    y : unit * 24
}

//Add event listener for arrow key press
document.addEventListener('keydown', setDirection);
let key;
function setDirection(event) {
    let pressedKey = event.keyCode;
    
    if (pressedKey == 37 && key != "right") {
        key = "left"
    } else if (pressedKey == 38 && key != "down") {
        key = "up"
    } else if (pressedKey == 39 && key != "left") {
        key = "right"
    } else if (pressedKey == 40 && key != "up") {
        key = "down"
    }
}

//-----FOOD-START-----//
let food = {};
let specialFoodCollider = {};
let foodTimeoutConstraint;
let foodTimer;
let specialFoodTimeoutConstraint;
let specialFoodTimer;
let specialFoodRespawnTime = 0;
let specialFoodExists = false;
let bestScore = parseInt(localStorage.getItem('highestScore')) || 0;
let newBest = false;

let initNewFoodTimer = function () {
    foodTimeoutConstraint =   Math.floor(randomIntFromInterval(40, 70));
    foodTimer = 0;
    console.log('New food timeout: ' + (foodTimeoutConstraint * 50) / 1000 + ' secs');
    console.log('Timer starts from: ' + foodTimer); //Just to verify :D
};

let initNewSpecialFoodTimer = function () {
    
    specialFoodTimeoutConstraint =   Math.floor(randomIntFromInterval(40, 70)); //Step intervals taken for time to reach 4-7 secs
    specialFoodTimer = 0;
    specialFoodRespawnTime = 0;
    console.log('New special food timeout: ' + (foodTimeoutConstraint * 50) / 1000 + ' secs');
    console.log('Timer starts from: ' + foodTimer); //Just to verify :D
};

let resetFood = function(){
    $('.food').remove();
    food = {
        x : Math.floor(Math.random() * (allowedLimitX / unit - 1)) * unit, // Needs to be this way so unit jumps are respected
        y : Math.floor(Math.random() * (allowedLimitY / unit - 1)) * unit // Needs to be this way so unit jumps are respected
    }
    ground.append('<div class="food ' + '" style="top:' + food.y + 'px; left:' + food.x + 'px"></div>');
    initNewFoodTimer();
};

let randomColor = function ()
{
    var randomColor = '#' + Math.floor(Math.random() * 16777215).toString(16); //Base 16 code
    return randomColor;
};

let resetSpecialFood = function() {
    
    specialFoodExists = true;
    specialFoodCollider = {
        x : Math.floor(Math.random() * (allowedLimitX / unit - 1)) * unit, // Needs to be this way so unit jumps are respected
        y : Math.floor(Math.random() * (allowedLimitY / unit - 1)) * unit // Needs to be this way so unit jumps are respected
    }
    ground.append('<div class="special-food" style="top:' + (specialFoodCollider.y - 6) + 'px; left:' + (specialFoodCollider.x - 6) + 'px; background-color:' + randomColor() + '"></div>');
    initNewSpecialFoodTimer();
};

function autoCollision (headPos, bodyArr) {
    for(let i = 1; i < bodyArr.length; i++) {
        if(headPos.x == bodyArr[i].x && headPos.y == bodyArr[i].y) {
            console.log('collision!');
            return true;
        }
    }
    return false;
};

let restartGame = function() {
    location.reload(true);
}

let displayGameOver = function() {
    gameOverWindow.show();
    gameOverWindow.find('.final-score').text(score);
    if(newBest) {
        gameOverWindow.find('.best').show();
    } else {
        gameOverWindow.find('.best').hide();
    }
    localStorage.setItem('highestScore', bestScore.toString());
};

resetFood();

//-----FOOD-END-----//

let relocateSnake = function(correctionAxis) {
    for (let i = 0; i < snake.length; i++) {
        snake[i][correctionAxis] -= 112;
    }
}


//Score
let score = 0;

//MAIN FUNCTION
function render() {
    //Removes previous Snake instance
    let lastSnakeState = $('.box');
    lastSnakeState.remove();
    
    //checks if food time is up
    if(foodTimer >= foodTimeoutConstraint) {
        resetFood();
    }

    if (specialFoodRespawnTime == 70) {
        resetSpecialFood();
    }

    // Regulates special food timeout
    if(specialFoodExists && specialFoodTimer >= specialFoodTimeoutConstraint) {
        
        $('.special-food').remove();
        delete specialFoodCollider.x;
        delete specialFoodCollider.y;
        specialFoodExists = false;
        specialFoodRespawnTime = 0;
    }

    //Builds new Snake instance
    for(let i = 0; i < snake.length; i++) {
        let multiplier = 100 / snake.length;
        ground.append('<div class="box" style="top:' + snake[i].y + 'px; left:' + snake[i].x + 'px; background-color: hsla(80, 61%, ' + i * multiplier + '%, 1)"></div>');
    }
    
    //Need to get the actual head position to calculate new position
    let headX = snake[0].x;
    let headY = snake[0].y;
    let actualHeadPosition = {
        x: headX,
        y: headY
    }
    
    switch (key) {
        case "up":
            headY -= unit;
            break;
        case "down":
            headY += unit;
            break;
        case "right":
            headX += unit;
            break;
        case "left":
            headX -= unit;
            break;
    };
    
    //Bite self
    if (snake.length > 1 && autoCollision(actualHeadPosition, snake)) {
        displayGameOver();
        clearInterval(step);
    }

    //Add head
    snake.unshift({
        x: headX,
        y: headY
    });

    //Collision with boundaries
    if(headX < 0 || headX > allowedLimitX - unit || headY < 0 || headY > allowedLimitY - unit) {
        
        snake.reverse();
        switch (key) {
            case "left":
                key = "right";
                allowedLimitX -= 112;
                break;
            case "right":
                key = "left";
                relocateSnake('x');
                allowedLimitX -= 112;
                break;
            case "up":
                key = "down";
                allowedLimitY -= 112;
                break;
            default:
                key = "up";
                relocateSnake('y');
                allowedLimitY -= 112;
                break;
        }
        resetFood();
        setTimeout(function(){
            ground.css({
                "width": allowedLimitX + 'px',
                "height": allowedLimitY + 'px'
            });
        }, 50);
        if(stepsSinceCollision <= 3) {
            clearInterval(step);
            displayGameOver();
            console.log('game over!')
        };
        stepsSinceCollision = 0;
    }

    //eats food
    if (headX == food.x && headY == food.y) {
        score += 1;
        scoreContainer.text('Score: ' + score);
        if (score > bestScore) {
            bestScore = score;
            newBest = true;
            scoreContainer.css('color','green');
        }
        resetFood();
        console.log(score);
    } else if (headX == specialFoodCollider.x && headY == specialFoodCollider.y) {
        debugger
        score += 9;
        delete specialFoodCollider.x;
        delete specialFoodCollider.y;
        scoreContainer.text('Score: ' + score);
        if (score > bestScore) {
            bestScore = score;
            newBest = true;
            scoreContainer.css('color','green');
        }
        $('.special-food').remove();
        specialFoodExists = false;
        specialFoodRespawnTime = 0;
        let tailX = snake[snake.length - 1].x;
        let tailY = snake[snake.length - 1].y;

        switch (key) {
            case "up":
                tailY += unit;
                break;
            case "down":
                tailY -= unit;
                break;
            case "right":
                tailX -= unit;
                break;
            case "left":
                tailX += unit;
                break;
        };

        snake.push({
          x: tailX,
          y: tailY  
        });

        console.log('special food!: +' + score);
        //
    } else {
       //Remove tail
        snake.pop();     
    }
    
    foodTimer++;
    specialFoodTimer++;
    if(!specialFoodExists) {
        specialFoodRespawnTime++;
    }
    stepsSinceCollision++;
}

//Random number in range function
function randomIntFromInterval(min, max) {
  return Math.floor(Math.random() * (max - min + 1) + min);
}

//Call render function every X miliseconds
let step = setInterval(render, 100);
