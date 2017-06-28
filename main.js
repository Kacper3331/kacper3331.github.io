/**
 * Created by kacper on 26.06.2017.
 */

let loadData = ["images/sprites.json", "sounds/music.mp3" ,"sounds/explosion.mp3", "sounds/shoot.wav", "fonts/emulogic.ttf"];

let game = hexi(1280, 720, setup, loadData, load);

game.scaleToWindow();
game.start();


var cannon, scoreDisplay, music,
    bullets, bullets_second, winner, shootSound,
    explosionSound, aliens, score,
    scoreNeededToWin, alienFrequency,
    alienTimer, gameOverMessage,
    level = 0, display_level = 0, pause = "",
    background, second, score_second, scoreSecondDisplay, display_winner,
    count = 0, count_second = 0;

function load() {
    game.loadingBar();
}

function setup() {

    background = game.sprite("background.png");

    cannon = game.sprite("spaceship.png");

    second = game.sprite("second_spaceship.png");

    game.stage.putBottom(cannon, -200, -40);

    game.stage.putBottom(second, 200, -40);

    bullets = [];

    bullets_second = [];

    aliens = [];

    scoreDisplay = game.text("0", "20px emulogic", "#00FF00", 270, 20);

    scoreSecondDisplay = game.text("0", "20px emulogic", "#BBFFCC", 550, 20);

    display_level = game.text("0", "20px emulogic", "#FFFFFF", 20, 20);

    pause = game.text("", "20px emulogic", "#FFFFFF", 600, 360);

    display_winner = game.text("", "20px emulogic", "#00FF00", 500, 400);

    music = game.sound("sounds/music.mp3");
    music.play();

    shootSound = game.sound("sounds/shoot.wav");

    shootSound.pan = -0.5;

    explosionSound = game.sound("sounds/explosion.mp3");

    explosionSound.pan = 0.5;

    var escape = game.keyboard(27);
    var enter = game.keyboard(13);

    escape.press = function () {
        game.pause();
        music.pause();
        pause.text = "Pause";
    };

    enter.press = function () {
        game.resume();
        music.play();
        pause.text = " ";
    };

    var leftArrow = game.keyboard(65),
        rightArrow = game.keyboard(68),
        spaceBar = game.keyboard(32),

        leftSecond = game.keyboard(37),
        rightSecond = game.keyboard(39),
        attack_second = game.keyboard(18);


    leftArrow.press = function () {
            cannon.vx = -10;
            cannon.vy = 0;
    };

    leftArrow.release = function() {
      if(!rightArrow.isDown && cannon.vy === 0) {
          cannon.vx = 0;
      }
    };


    leftSecond.press = function () {
        second.vx = -10;
        second.vy = 0;
    };

    leftSecond.release = function() {
        if(!rightSecond.isDown && second.vy === 0) {
            second.vx = 0;
        }
    };

    rightSecond.press = function () {
        second.vx = 10;
        second.vy = 0;
    };

    rightSecond.release = function () {
        if(!leftSecond.isDown && second.vy === 0) {
            second.vx = 0;
        }
    };

    attack_second.press = function () {
        game.shoot(second, 4.71, second.halfWidth, 0, game.stage, 7, bullets_second, function () {
                return game.sprite("second_bullet.png");
            }
        );

        shootSound.play();

    };

    rightArrow.press = function () {
      cannon.vx = 10;
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

        shootSound.play();

    };

        score = 0;
        score_second = 0;
        scoreNeededToWin = 10;
        alienTimer = 0;
        alienFrequency = 65;
        winner = "";

    game.state = play;
}

function play() {
    display_level.text = "Level " + level;

    cannon.x += cannon.vx;
    cannon.y += cannon.vy;

    second.x += second.vx;
    second.y += second.vy;

    game.contain(cannon, game.stage);

    game.contain(second, game.stage);

    game.move(bullets);
    game.move(bullets_second);

    alienTimer++;

    if (alienTimer === alienFrequency) {

        let alienFrames = ["alien.png", "explosion.png"];

        let alien = game.sprite(alienFrames);

        alien.states = {
            normal: 0,
            destroyed: 1
        };

        alien.y = 0 - alien.height;
        alien.x = game.randomInt(0, 20) * alien.width;

        alien.vy = 3;
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

                explosionSound.play();

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


        bullets_second = bullets_second.filter(bullet => {

            if (game.hitTestRectangle(alien, bullet)) {
                game.remove(bullet);

                alien.show(alien.states.destroyed);

                explosionSound.play();

                alien.vy = 0;

                alienIsAlive = false;

                game.wait(1000, function () {
                    return game.remove(alien);
                });

                score_second += 1;

                return false;

            } else {
                return true;
            }
        });

        return alienIsAlive;
    });

    scoreDisplay.content = "Player 1: " + score;

    scoreSecondDisplay.content = "Player 2:" + score_second;

    if (score === scoreNeededToWin || score_second === scoreNeededToWin)  {
        winner = "player";

        if (level === 1) {
            game.state = end;
        } else if (level < 1) {

            if (score === scoreNeededToWin) {
                count += 1;
            } else if (score_second === scoreNeededToWin) {
                count_second += 1;
            }

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


function end() {
    game.pause();
    music.pause();

    gameOverMessage = game.text("", "20px emulogic", "#00FF00", 500, 360);

    if (count > count_second) {
        display_winner.content = "Winner Player 1!";
    } else if (count_second > count) {
        display_winner.content = "Winner Player 2!";
    }

    music.volume = 0.5;

    if (winner === "player") {
        gameOverMessage.content = "Earth Saved!";
        gameOverMessage.x = 550;
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
    score_second = 0;
    alienFrequency = 60;
    alienTimer = 0;
    winner = "";

    music.volume = 1;

    game.remove(aliens);
    game.remove(bullets);
    game.remove(bullets_second);

    game.remove(gameOverMessage);
    display_winner.content = "";

    game.stage.putBottom(cannon, -200, -40);

    game.stage.putBottom(second, 200, -40);

    game.state = play;
    game.resume();
}

function reset() {
    level = 0;
    score = 0;
    score_second = 0;
    count_second = 0;
    count = 0;
    alienFrequency = 100;
    alienTimer = 0;
    winner = "";

    music.restart();

    music.volume = 1;

    game.remove(aliens);
    game.remove(bullets);
    game.remove(bullets_second);

    game.remove(gameOverMessage);

    display_winner.content = "";

    game.stage.putBottom(cannon, -200, -40);

    game.stage.putBottom(second, 200, -40);

    game.state = play;
    game.resume();
}
