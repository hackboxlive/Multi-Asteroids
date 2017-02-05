window.addEventListener('load',function() {
    var canvas = document.getElementById("myCanvas");
    var ctx = canvas.getContext("2d");
    var back = document.getElementById("background");
    var backctx = back.getContext('2d');
    /*var score = document.getElementById('score');
    var scorectx = score.getContext('2d');
    scorectx.fillStyle = "black";
    scorectx.fillRect(0, 0, score.width, score.height);
    scorectx.stroke(); */
    var img = new Image();
    img.src="/images/asteroid.jpg";
    var x = 0, y = 0;
    img.speed = 10;
    img.onload = function(){
        //ctx.drawImage(img, 0,0);
        setInterval(drawimage, 30);
    };
    function drawimage() {
        y += 2;
        //backctx.clearRect(0, 0, back.width, back.height);
        backctx.drawImage(img, 0, 0);
        backctx.drawImage(img, 0, y - back.height);
        if(y >= back.height) {
            y = 0;
        }
    }
    var socket = io();
    var LEFT = 37;
    var UP = 38;
    var RIGHT = 39;
    var DOWN = 40;
    var FIRE = 88;
    window.addEventListener('keydown', function(e) {
        switch (e.which) {
            case UP:
            case LEFT:
            case RIGHT:
            case DOWN:
            case FIRE:
                e.preventDefault();
                e.stopPropagation();
                socket.emit('KeyPress', {inputId:e.which, state:1 });
                return false;
        }
        return true;
    }, true);

    window.addEventListener('keyup', function(e) {
        switch (e.which) {
            case UP:
            case LEFT:
            case RIGHT:
            case DOWN:
            case FIRE:
                e.preventDefault();
                e.stopPropagation();
                socket.emit('KeyPress', {inputId:e.which, state:0});
                return false;
        }
        return true;
    }, true);

    socket.on('newPositions',function(data){
        //ctx.save();
        ctx.clearRect(0,0,1200,650);
        var players = data[0];
        var bullets = data[1];
        var asteroids = data[2];
        var div = document.getElementById('score');
        div.innerHTML = "";
        for(var i = 0 ; i < players.length; i++) {
            drawPath(players[i].position, players[i].direction, players[i].color);
            drawScore(players[i].color, players[i].health, players[i].point);
        }
        ctx.resetTransform();
        for(var i = 0; i < bullets.length; i++) {
            drawCircle(bullets[i].position[0], bullets[i].position[1], bullets[i].color);
        }
        //ctx.resetTransform();
        for(var i = 0; i < asteroids.length; i++) {
            drawAsteroid(asteroids[i].position, asteroids[i].path, asteroids[i].color);
            ctx.resetTransform();
        }
        ctx.stroke();
        //ctx.restore();
    });

    drawScore = function(color, health, score) {
        var main = document.getElementById("score");
        var div = document.createElement('div');
        div.style.color = color;
        div.style.margin = "40px 0px"
        var para = document.createElement('p');
        var para1 = document.createElement('p');
        var para2 = document.createElement('p');
        para1.appendChild(document.createTextNode("Health: "+ health));
        para2.appendChild(document.createTextNode("Score: "+ score));
        div.appendChild(para1);
        div.appendChild(para2);
        main.appendChild(div);
    };

    drawCircle = function(x, y, color) {
        ctx.beginPath();
        var radius = 5;
        ctx.arc(x, y, radius, 0, 2 * Math.PI, false);
        ctx.fillStyle = color;
        ctx.fill();
    }
    var scale = 1;

    drawPath = function (position, direction, color) {
        with (Math) {
            ctx.setTransform(cos(direction) * scale, sin(direction) * scale,
                             -sin(direction) * scale, cos(direction) * scale,
                             position[0], position[1]);
        }
        ctx.beginPath();
        ctx.moveTo(path[0][0], path[0][1]);
        for (i=1; i<path.length; i++) {
            ctx.lineTo(path[i][0], path[i][1]);
        }
        ctx.closePath();
        ctx.fillStyle= color;
        ctx.fill();
    };

    drawAsteroid = function(position, paths, color) {
        var scale = 1;
        ctx.translate(position[0],position[1]);
        ctx.beginPath();
        ctx.moveTo(paths[0][0], paths[0][1]);
        for (i=1; i<paths.length; i++) {
            ctx.lineTo(paths[i][0], paths[i][1]);
        }
        ctx.closePath();
        ctx.fillStyle= color;
        ctx.fill();
    }

    var path = [
        [10, 0],
        [-5, 5],
        [-5, -5],
        [10, 0],
    ];
}, true);
