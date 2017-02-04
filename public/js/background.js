window.addEventListener('load', function() {
    console.log("coming inside");
    var velocity=100;
    var img = new Image();
    function drawImage(time){ 
        var framegap=time-lastRepaintTime;
        lastRepaintTime=time;
        var translateX=velocity*(framegap/1500);
        ctx.clearRect(0,0,canvas.width,canvas.height);
        var pattern=ctx.createPattern(img,"repeat-y");
        ctx.fillStyle=pattern;
        ctx.rect(translateX,0,img.width,img.height);
        ctx.fill();
        ctx.translate(0, -translateX); 
        requestAnimationFrame(drawImage);
    }
    var lastRepaintTime=window.performance.now();
    img.src="https://raw.githubusercontent.com/straker/galaxian-canvas-game/master/part1/imgs/bg.png";
    var canvas = document.getElementById('background');
    var ctx = canvas.getContext('2d');
    img.onload = function(){
        console.log("Image loaded");
        //ctx.drawImage(img, 0,0);
        drawImage();
    }
}, true);
