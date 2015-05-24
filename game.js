window.onload = function() {
    // constants
    var screen_size = Math.min(document.body.clientWidth,document.body.clientHeight)-50
    var maze_size = 5 // MUST BE ODD
    var segm_size = 2*maze_size+1
    var wall_size = screen_size/segm_size

    function shuffle(o){
        for(var j, x, i = o.length; i; j = Math.floor(Math.random() * i), x = o[--i], o[i] = o[j], o[j] = x);
        return o;
    }

    function random(o) {
        return o[Math.floor(Math.random()*o.length)];
    }

    // init canvas
    var cvs = document.getElementById('main')
    var ctx = cvs.getContext('2d')
    cvs.width = screen_size;
    cvs.height = screen_size;

    // init maze
    var maze = [];

    for (var i = 0 ; i < segm_size ; i++) {
        var row = [];
        for (var j = 0 ; j < segm_size ; j++) {
            row[j] = (j%2==1 && i%2==1)?0:1;
        }
        maze[i] = row;
    }

    maze[0][maze_size] = 0;
    maze[segm_size-1][maze_size] = 0;

    // generate maze

    var cur = [1,maze_size]
    var path = [cur];
    var visited = [];
    for (var i = 0 ; i < segm_size ; i++) {
        var row = [];
        for (var j = 0 ; j < segm_size ; j++) {
            row[j] = false;
        }
        visited[i] = row;
    }
    visited[cur[0]][cur[1]] = true;

    while (path.length) {
        var dirs = [[2,0],[0,-2],[-2,0],[0,2]].filter(function(next){
            return maze[cur[0]+next[0]] != undefined &&
                   maze[cur[0]+next[0]][cur[1]+next[1]] != undefined &&
                   !visited[cur[0]+next[0]][cur[1]+next[1]]
        })
        if (dirs.length) {
            (function(cell, dir) {
                maze[cell[0]+dir[0]/2][cell[1]+dir[1]/2] = 0;
                visited[cell[0]+dir[0]][cell[1]+dir[1]] = true;
                cur = [cell[0]+dir[0],cell[1]+dir[1]]
                path.push(cur)
            })(cur, random(dirs))
        } else {
            cur = path.pop();
        }
    }

    // player stuff

    var player = [0,maze_size]
    var prev;
    var movedir;
    var movequeue = [];
    var moving = false;
    var step = .2;
    var anim = [0,0];

    window.onkeyup = function(e) {
        var key = e.keyCode ? e.keyCode : e.which;
        if (key > 36 && key < 41) {
            movequeue.unshift(key);
        }
    }

    // rAF animate
    var animate = function() {

        if (moving) {
            anim[1-movedir%2] += ((movedir>38)?1:-1)*step;
            if (Math.abs(anim[0]) > 1 || Math.abs(anim[1]) > 1) {
                player[1-movedir%2] += (movedir>38)?1:-1;
                anim = [0,0];
                moving = false;
            }
        } else {
            if (movequeue.length) {
                movedir = movequeue.pop();
                moving = true;
            }
        }

        var exit = window.requestAnimationFrame( animate );
        cvs.width = cvs.width;

        for (var i = 0; i < segm_size; i++) {
            for (var j = 0 ; j < segm_size; j++) {
                ctx.fillStyle = (maze[j][i])?(2==maze[j][i]?'green':'black'):'white';
                ctx.fillRect(j*wall_size,i*wall_size,wall_size,wall_size)
            }
        }

        ctx.beginPath();
        ctx.arc((player[0]+anim[0]+.5)*wall_size,(player[1]+anim[1]+.5)*wall_size, wall_size/2-5, 0, 2*Math.PI)
        ctx.fill();

    }

    animate();

}
