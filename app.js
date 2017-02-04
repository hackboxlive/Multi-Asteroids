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
    var self = {};
    var selfFlag = 0;
    self.id = id;
    self.position = [100, 100];
    self.velocity = [0, 0];
    self.direction = -3.14/2; // make it 2
    self.dead = false;
    self.RIGHT = false;
    self.LEFT = false;
    self.UP = false;
    self.DOWN = false;
    self.FIRE = false;
    self.invincible = false;
    self.health = 100;
    self.lives = 3;
    self.score = 0;
    self.radius = 4; // default it was 3
    self.path = [
        [10, 0],
        [-5, 5],
        [-5, -5],
        [10, 0],
    ];
    self.MAX_SPEED = 7;

    self.getSpeed = function() {
        with (Math) {
            return sqrt(pow(self.velocity[0], 2) + pow(self.velocity[1], 2));
        }
    };

    self.addScore = function(pts) {
        self.score += pts;
    };

    self.lowerScore = function(pts) {
        self.score -= pts;
        if (self.score < 0) {
            self.score = 0;
        }
    };

    self.rotate = function(rad) {
        if (!self.dead) {
            self.direction += rad;
            //game.log.info(self.direction);
        }
    };

    self.thrust = function(force) {
        if (!self.dead) {
            self.velocity[0] += force * Math.cos(self.direction);
            self.velocity[1] += force * Math.sin(self.direction);

            if (self.getSpeed() > self.MAX_SPEED) {
                self.velocity[0] = self.MAX_SPEED * Math.cos(self.direction);
                self.velocity[1] = self.MAX_SPEED * Math.sin(self.direction);
            }
        }
    };

    self.friction = function() {
        if(!self.dead) {
            self.velocity[0]/=1.05;
            self.velocity[1]/=1.05;
        }
    };

    self.move = function() {
        self.position[0] += self.velocity[0];
        if (self.position[0] < 0)
            self.position[0] = GAME_WIDTH + self.position[0];
        else if (self.position[0] > GAME_WIDTH)
            self.position[0] -= GAME_WIDTH;

        self.position[1] += self.velocity[1];
        if (self.position[1] < 0)
            self.position[1] = GAME_HEIGHT + self.position[1];
        else if (self.position[1] > GAME_HEIGHT)
            self.position[1] -= GAME_HEIGHT;
    };

    self.die = function() {
        if (!self.dead) {
            self.dead = true;
            self.invincible = true;
            self.position = [100, 100];
            self.velocity = [0, 0];
            self.direction = -Math.PI/2;
            if (self.lives > 0) {
                setTimeout(function (player, _game) {
                    return function() {
                        player.ressurrect(_game);
                    };
                }(self, game), DEATH_TIMEOUT);
            }
            else {
                game.gameOver();
            }
        }
    };

    self.fire = function() {
        if (!self.dead) {
            var bullet = Bullet(self.id, self.position[0], self.position[1], self.direction);
        }
    };

    self.update = function() {
        if(self.LEFT) {
            self.rotate(-0.1);
        }
        if(self.RIGHT) {
            self.rotate(+0.1);
        }
        if(self.UP) {
            self.thrust(1.5);
        }
        if(!self.UP) {
            self.friction();
        }
        if(self.FIRE) {
            self.fireFlag = 1;
        }
        if(!self.FIRE) {
            if(self.fireFlag) {
                self.fire();
                self.fireFlag = 0;
            }
        }
        self.move();
    };
    return self;
}

function Bullet(id, posx, posy, dir) {
    var self = {};
    self.id = id;
    self.position = [posx, posy]
    var direction = dir;
    self.direction = direction;
    //var direction = dir;
    self.timestamp = 0;
    self.radius = 5;
    self.velocity = [ 15 * Math.cos(self.direction), 15 * Math.sin(self.direction)]
    self.dead = 0;
    self.update = function() {
        if(!self.dead) {
            self.position[0] +=  self.velocity[0];
            self.position[1] += self.velocity[1];
        }
    };
    BULLET_LIST.push(self);
    return self;
}

function Asteroid() {
    var self = {};	
    self.radius= Math.floor(Math.random()*20)+20;
    var side = Math.floor(Math.random()*4)+1;
    var x,y;
    if(side == 1)	{
        x=0;
        y=Math.floor(Math.random()*610)+20;
    }
    if(side == 3)	{
        x=GAME_WIDTH;
        y=Math.floor(Math.random()*610)+20;
    }
    if(side == 2)	{
        x=Math.floor(Math.random()*1150)+20;
        y=0;
    }
    if(side == 4)	{
        x=Math.floor(Math.random()*1150)+20;
        y=GAME_HEIGHT;
    }	
    self.x=x;
    self.y=y;
    var circumference=[];
    for(var i=0;i<12;i++) {
        var angle = 0.52083 * i;
        var radius = self.radius;
        x =  (Math.random()-0.5)*radius/5 + radius*Math.sin(angle);
        y =  (Math.random()-0.5)*radius/5 + radius*Math.cos(angle);
        circumference.push([x,y]);
    }
    circumference.push(circumference[0]);
    self.circumference = circumference;
    self.speed = Math.random()*3+ 3;
    self.direction=Math.random()*6.28;
    self.update = function(){
        self.x = self.x + self.speed * Math.sin(self.direction);
        self.y = self.y + self.speed * Math.cos(self.direction);
        if(self.y >= GAME_HEIGHT) {
            self.y = 0 + self.radius + 2;
        }
        if(self.y < 0) {
            self.y = GAME_HEIGHT - self.radius - 2;
        }
        if(self.x >= GAME_WIDTH) {
            self.x = 0 + self.radius + 2;
        }
        if(self.x < 0) {
            self.x = GAME_WIDTH - self.radius - 2;
        }
    };
    ASTEROIDS_LIST.push(self);
    return self;
}


var SOCKET_LIST = {};
var PLAYER_LIST = {};
var BULLET_LIST = [];
var ASTEROIDS_LIST=[];

var id = 0;
var keys = {'37': 'LEFT', '39': 'RIGHT', '38': 'UP', '40' : 'DOWN', '88': 'FIRE'};


var io = require('socket.io')(serv,{});
io.sockets.on('connection', function(socket){
    socket.id = id++;
    console.log("A client connected");
    SOCKET_LIST[socket.id] = socket;

    var player = Player(socket.id);
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

setInterval(function() {
    if(ASTEROIDS_LIST.length < 10)
        var asteroid = Asteroid();
}, 2000);

setInterval(function(){
    var pack = [];
    var playerPack = [];
    var bulletPack = [];
    var asteroidPack = [];
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
        for(var k in ASTEROIDS_LIST) {
            var ast = ASTEROIDS_LIST[k];
            var dist = Math.sqrt((ast.x - bullet.position[0])* (ast.x - bullet.position[0]) + (ast.y - bullet.position[1])*(ast.y - bullet.position[1])) 
            if((dist) <= (ast.radius + bullet.radius + 1)) {
                flag = 1;
                ASTEROIDS_LIST.splice(k,1);
                BULLET_LIST.splice(i,1);
                break;
            }
        }
        for(var k in PLAYER_LIST) {
            var player = PLAYER_LIST[k];
            if(bullet.id == player.id)
                continue;
            var dist = Math.sqrt((player.position[0] - bullet.position[0])* (player.position[0] - bullet.position[0])+ (player.position[1]-bullet.position[1])*(player.position[1]-bullet.position[1]));
            if(dist <= player.radius) {
                player.health -= 1;
                console.log("Player got hit by bullet");
                console.log(player.health);
                BULLET_LIST.splice(i, 1);
                //PLAYER_LIST.splice(k, 1);
                // delete player object afterwards
            }
        }
        if(!flag) {
            bulletPack.push({
                position:bullet.position,
                direction:bullet.direction
            });
        }
    }
    for(var i in PLAYER_LIST){
        var player = PLAYER_LIST[i];
        player.update();
        playerPack.push({
            position:player.position,
            direction:player.direction
            //number:player.number
        });
    }
    for(var i in ASTEROIDS_LIST) {
        var asteroid = ASTEROIDS_LIST[i];
        asteroid.update();
        asteroidPack.push({
            position:[asteroid.x, asteroid.y],
            path:asteroid.circumference
        });
        for(var k in PLAYER_LIST) {
            var player = PLAYER_LIST[k];
            var dist = Math.sqrt((player.position[0]-asteroid.x)*(player.position[0]-asteroid.x) + (player.position[1] - asteroid.y)*(player.position[1] - asteroid.y));
            if(dist <= player.radius + asteroid.radius) {
                player.direction = asteroid.direction;
                player.velocity[0] = 2*asteroid.speed * Math.sin(player.direction);
                player.velocity[1] = 2*asteroid.speed * Math.cos(player.direction);
                player.health -= 0.35;
                console.log("player got hit by asteroid")
                console.log(player.health);
            }
        }
        /*for(var k in ASTEROIDS_LIST) {
            if(i == k) {
                continue;
            }
            var sec_asteroid = ASTEROIDS_LIST[k];
            var dist = Mat.sqrt((sec_asteroid.x - asteroid.x)*(sec_asteroid.x - asteroid.x) + (sec_asteroid.y - asteroid.y)*(sec_asteroid.y - asteroid.y));
            if(dist <= asteroid.radius + sec_asteroid.radius)   {

            }
        }*/
    }
    pack.push(playerPack);
    pack.push(bulletPack);
    pack.push(asteroidPack);
    //console.log("Length of asteroid");
    //console.log(asteroidPack.length);
    for(var i in SOCKET_LIST){
        var socket = SOCKET_LIST[i];
        socket.emit('newPositions',pack);
    }
},30);
