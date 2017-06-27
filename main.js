/**
 * Created by kacper on 26.06.2017.
 */

let loadData = ["images/images.json", "sounds/music.mp3", "fonts/emulogic.ttf"];

let game = hexi(480, 320, setup, loadData, load);

//game.scaleToWindow();
game.start();


var cannon, scoreDisplay, music,
    bullets, winner, shootSound,
    explosionSound, aliens, score,
    scoreNeededToWin, alienFrequency,
    alienTimer, gameOverMessage,
    level = 0, display_level = 0, pause = "",
    background;

function load() {
    game.loadingBar();
}

function setup() {

    background = game.sprite("background.png");

    cannon = game.sprite("cannon.png");

    game.stage.putBottom(cannon, 0, -40);

    bullets = [];

    aliens = [];

    scoreDisplay = game.text("0", "20px emulogic", "#00FF00", 270, 20);

    display_level = game.text("0", "20px emulogic", "#FFFFFF", 20, 20);

    pause = game.text("", "20px emulogic", "#FFFFFF", 200, 140);

    music = game.sound("sounds/music.mp3");
    music.play();

    //shootSound = game.sounds("sounds/shoot.mp3");

    //shootSound.pan = -0.5;

    //explosionSound = game.sounds("sounds/explosion.mp3");

    //explosionSound.pan = 0.5;

    var escape = game.keyboard(27);
    var enter = game.keyboard(13);

    escape.press = function () {
        game.pause();
        pause.text = "Pause";
    };

    enter.press = function () {
        game.resume();
        pause.text = " ";
    };


    var leftArrow = game.keyboard(37),
        rightArrow = game.keyboard(39),
        spaceBar = game.keyboard(32);



    leftArrow.press = function () {
            cannon.vx = -5;
            cannon.vy = 0;
    };

    leftArrow.release = function() {
      if(!rightArrow.isDown && cannon.vy === 0) {
          cannon.vx = 0;
      }
    };

    rightArrow.press = function () {
      cannon.vx = 5;
      cannon.vy = 0;
    };

    rightArrow.release = function () {
      if(!leftArrow.isDown && cannon.vy === 0) {
          cannon.vx = 0;
      }
    };

    spaceBar.press = function () {
        game.shoot(cannon, 4.71, cannon.halfWidth, 0, game.stage, 7, bullets, function () {
            return game.sprite("bullet.png");
            }
        );

        //shootSound.play();

    };

        score = 0;
        scoreNeededToWin = 10;
        alienTimer = 0;
        alienFrequency = 80;
        winner = "";

    game.state = play;
}

function play() {
    display_level.text = "Level " + level;

    cannon.x += cannon.vx;
    cannon.y += cannon.vy;

    game.contain(cannon, game.stage);

    game.move(bullets);

    alienTimer++;

    if (alienTimer === alienFrequency) {

        let alienFrames = ["alien.png", "explosion.png"];

        let alien = game.sprite(alienFrames);

        alien.states = {
            normal: 0,
            destroyed: 1
        };

        alien.y = 0 - alien.height;
        alien.x = game.randomInt(0, 14) * alien.width;

        alien.vy = 2;
        aliens.push(alien);

        alienTimer = 0;

        if(alienFrequency > 2) {
            alienFrequency--;
        }

    }

    game.move(aliens);

    aliens = aliens.filter(alien => {

        let alienIsAlive = true;

        bullets = bullets.filter(bullet => {

            if (game.hitTestRectangle(alien, bullet)) {
                game.remove(bullet);

                alien.show(alien.states.destroyed);

                //explosionSound.play();

                alien.vy = 0;

                alienIsAlive = false;

                game.wait(1000, function () {
                    return game.remove(alien);
                });

                score += 1;

                return false;

            } else {
                return true;
            }
        });

        return alienIsAlive;
    });

    scoreDisplay.content = "Score: " + score;

    if (score === scoreNeededToWin) {
        winner = "player";

        if (level === 1) {
            game.state = end;
        } else if (level < 1) {
            level += 1;
            next_level();
        }

    }

    aliens.forEach(function (alien) {

        if (alien.y > game.canvas.height) {

            winner = "aliens";
            game.state = end;
        }
    });
}


function next_level() {

}

function end() {
    game.pause();

    gameOverMessage = game.text("", "20px emulogic", "#00FF00", 90, 120);

    music.volume = 0.5;

    if (winner === "player") {
        gameOverMessage.content = "Earth Saved!";
        gameOverMessage.x = 120;
    }

    if (winner === "aliens") {
        gameOverMessage.content = "Earth Destroyed!";

    }

    game.wait(3000, function () {
        return reset();
    });
}

function next_level() {

    background = null;
    score = 0;
    alienFrequency = 40;
    alienTimer = 0;
    winner = "";

    music.volume = 1;

    game.remove(aliens);
    game.remove(bullets);

    game.remove(gameOverMessage);

    game.stage.putBottom(cannon, 0, -40);

    game.state = play;
    game.resume();
}

function reset() {
    level = 0;
    score = 0;
    alienFrequency = 100;
    alienTimer = 0;
    winner = "";

    music.volume = 1;

    game.remove(aliens);
    game.remove(bullets);

    game.remove(gameOverMessage);

    game.stage.putBottom(cannon, 0, -40);

    game.state = play;
    game.resume();
}
