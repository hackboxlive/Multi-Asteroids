window.addEventListener('load',function() {
    var canvas = document.getElementById("myCanvas");
    var ctx = canvas.getContext("2d");
    var back = document.getElementById("background");
    var backctx = back.getContext('2d');
    var img = new Image();
    img.src="http://wallpapercave.com/wp/BMrmUGk.jpg";
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
        ctx.save();
        ctx.clearRect(0,0,1200,650);
        players = data[0];
        bullets = data[1];
        for(var i = 0 ; i < players.length; i++) {
            console.log(players[i].direction);
            drawPath(ctx, players[i].position, players[i].direction, 1, path);
        }
        for(var i = 0; i < bullets.length; i++) {
            console.log(bullets[i].direction)
            drawCircle(ctx, bullets[i].position[0], bullets[i].position[1]);
        }
        ctx.restore();
    });

    drawCircle = function(context, x, y) {
        context.beginPath();
        var radius = 5;
        context.arc(x, y, radius, 0, 2 * Math.PI, false);
        context.fillStyle = 'green';
        context.fill();
        context.stroke();
    }

    drawPath = function (ctx, position, direction, scale, path) {
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
        ctx.stroke();
        ctx.closePath();
        ctx.fillStyle="blue";
        ctx.fill();
    };

    var path = [
        [10, 0],
        [-5, 5],
        [-5, -5],
        [10, 0],
    ];
}, true);