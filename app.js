var express = require('express');
var app = express();
var serv = require('http').Server(app);
var path = require('path');
app.use(express.static(path.join(__dirname,'public')));
const GAME_HEIGHT = 650
const GAME_WIDTH = 1200

serv.listen(8080, '0.0.0.0', function() {
    console.log("Listening on port 8080");
});
console.log("Server started.");

function Player(id) {
    console.log(id);
    console.log("Inside player function")
    this.id = id;
    this.position = [100, 100];
    this.velocity = [0, 0];
    this.direction = -3.14/2;
    this.dead = false;
    this.RIGHT = false;
    this.LEFT = false;
    this.UP = false;
    this.DOWN = false;
    this.FIRE = false;
    this.invincible = false;
    this.lives = 3;
    this.score = 0;
    this.radius = 3;
    this.path = [
        [10, 0],
        [-5, 5],
        [-5, -5],
        [10, 0],
    ];
    this.MAX_SPEED = 5;

    this.getSpeed = function() {
        with (Math) {
            return sqrt(pow(this.velocity[0], 2) + pow(this.velocity[1], 2));
        }
    };

    this.addScore = function(pts) {
        this.score += pts;
    };

    this.lowerScore = function(pts) {
        this.score -= pts;
        if (this.score < 0) {
            this.score = 0;
        }
    };

    this.rotate = function(rad) {
        if (!this.dead) {
            this.direction += rad;
            //game.log.info(this.direction);
        }
    };

    this.thrust = function(force) {
        if (!this.dead) {
            this.velocity[0] += force * Math.cos(this.direction);
            this.velocity[1] += force * Math.sin(this.direction);

            if (this.getSpeed() > this.MAX_SPEED) {
                this.velocity[0] = this.MAX_SPEED * Math.cos(this.direction);
                this.velocity[1] = this.MAX_SPEED * Math.sin(this.direction);
            }
        }
    };

    this.friction = function() {
        if(!this.dead) {
            if(this.velocity[0] > 0) {
                this.velocity[0] -= 0.1;
            }
            if(this.velocity[1] > 0) {
                this.velocity[1] -= 0.1; 
            }
            if(this.velocity[0] < 0)
                this.velocity[0] = 0;
            if(this.velocity[1] < 0)
                this.velocity[1] = 0;
        }
    };

    this.move = function() {
        this.position[0] += this.velocity[0];
        if (this.position[0] < 0)
            this.position[0] = GAME_WIDTH + this.position[0];
        else if (this.position[0] > GAME_WIDTH)
            this.position[0] -= GAME_WIDTH;

        this.position[1] += this.velocity[1];
        if (this.position[1] < 0)
            this.position[1] = GAME_HEIGHT + this.position[1];
        else if (this.position[1] > GAME_HEIGHT)
            this.position[1] -= GAME_HEIGHT;
    };

    this.die = function() {
        if (!this.dead) {
            this.dead = true;
            this.invincible = true;
            this.position = [100, 100];
            this.velocity = [0, 0];
            this.direction = -Math.PI/2;
            if (this.lives > 0) {
                setTimeout(function (player, _game) {
                    return function() {
                        player.ressurrect(_game);
                    };
                }(this, game), DEATH_TIMEOUT);
            }
            else {
                game.gameOver();
            }
        }
    };

    this.fire = function() {
        if (!this.dead) {
            console.log("bullet fired");
            var bullet = new Bullet(this.id, this.position[0], this.position[1], this.direction);
        }
    };

    this.update = function() {
        if(this.LEFT) {
            console.log("rotating");
            this.rotate(-0.1);
        }
        if(this.RIGHT) {
            console.log("rotating");
            this.rotate(+0.1);
        }
        if(this.UP) {
            console.log("Applying thrust");
            this.thrust(1);
        }
        if(!this.UP) {
            this.friction();
        }
        if(this.FIRE) {
            this.fire();
        }
        this.move();
    };
}

function Bullet(id, posx, posy, dir) {
    this.id = id;
    this.position = [posx, posy]
    var direction = dir;
    this.direction = direction;
    //var direction = dir;
    this.timestamp = 0;
    this.velocity = [ 1 * Math.cos(this.direction), 1 * Math.sin(this.direction)]
    this.dead = 0;
    this.update = function() {
        if(!this.dead) {
            this.position[0] +=  this.velocity[0];
            this.position[1] += this.velocity[1];
            console.log(direction);
        }
    };
    BULLET_LIST.push(this);
}

var SOCKET_LIST = {};
var PLAYER_LIST = {};
var BULLET_LIST = [];

var id = 0;
var keys = {'37': 'LEFT', '39': 'RIGHT', '38': 'UP', '40' : 'DOWN', '88': 'FIRE'};


var io = require('socket.io')(serv,{});
io.sockets.on('connection', function(socket){
    socket.id = id++;
    console.log("A client connected");
    SOCKET_LIST[socket.id] = socket;

    var player = new Player(socket.id);
    //console.log(player);
    PLAYER_LIST[socket.id] = player;

    socket.on('disconnect',function(){
        delete SOCKET_LIST[socket.id];
        delete PLAYER_LIST[socket.id];
    });

    socket.on('KeyPress',function(data){
        data.inputId = keys[data.inputId.toString()];
        if(data.inputId === 'LEFT')
            player.LEFT= data.state;
        else if(data.inputId === 'RIGHT')
            player.RIGHT= data.state;
        else if(data.inputId === 'UP')
            player.UP= data.state;
        else if(data.inputId === 'DOWN')
            player.DOWN= data.state;
        else if(data.inputId === 'FIRE')
            player.FIRE = data.state;
    });
});

setInterval(function(){
    var pack = [];
    var playerPack = [];
    var bulletPack = [];
    for(var i in PLAYER_LIST){
        var player = PLAYER_LIST[i];
        player.update();
        playerPack.push({
            position:player.position,
            direction:player.direction
            //number:player.number
        });    
    }
    for(var i in BULLET_LIST) {
        var bullet = BULLET_LIST[i];
        bullet.update();
        var flag = 0;
        if (bullet.position[0] < 0 || bullet.position[0] > GAME_WIDTH) {
            BULLET_LIST.splice(i,1);
            flag = 1;
        }
        if( bullet.position[1] < 0 || bullet.position[1] > GAME_HEIGHT) {
            BULLET_LIST.splice(i,1);
            flag = 1;
        }
        if(!flag) {
            bulletPack.push({
                position:bullet.position,
                direction:bullet.direction
            });
        }
    }
    console.log(bulletPack);
    pack.push(playerPack);
    pack.push(bulletPack);
    for(var i in SOCKET_LIST){
        var socket = SOCKET_LIST[i];
        socket.emit('newPositions',pack);
    }
},30);
