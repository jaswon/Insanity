window.onload = function() {
    // constants
    var screen_size = Math.min(document.body.clientWidth,document.body.clientHeight)-200
    var maze_size = 5 // MUST BE ODD
    var segm_size = 2*maze_size+1
    var wall_size = screen_size/segm_size
    var maze;
    var splatter = new Image();   // Create new img element
    splatter.src = 'splatter.png';

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
    cvs.width = screen_size+200;
    cvs.height = screen_size;
    ctx.strokeStyle = 'black'

    var genMaze = function() {
        // init maze
        maze = [];

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
    }

    // player stuff

    var player = [0,maze_size]
    var prev;
    var movedir;
    var movequeue = [];
    var moving = false;
    var step = .2;
    var anim = [0,0];
    var splatters = [];
    var flash = 0;

    window.onkeydown = function(e) {
        var key = e.keyCode ? e.keyCode : e.which;
        if (key > 36 && key < 41) {
            movequeue.unshift(key);
        }
    }

    // rAF animate
    var animate = function() {

        var exit = window.requestAnimationFrame( animate );
        cvs.width = cvs.width;

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
                var temp = player.slice(0);
                temp[1-movedir%2] += (movedir>38)?1:-1;
                if (maze[temp[0]][temp[1]] == 1) { // DEATH
                    player = [0,maze_size]
                    splatters.push({
                        pos: [temp[0],temp[1]],
                        dir: (movedir-35)%4
                    })
                    flash = 10;
                    movequeue = []
                } else {
                    moving = true;
                }
            }
        }

        if (player[0] == segm_size-1 && player[1] == maze_size) { // END
            maze_size += 2;
            segm_size = 2*maze_size+1
            wall_size = screen_size/segm_size
            genMaze();
            splatters = []
            player = [0,maze_size]
        }

        for (var i = 0; i < segm_size; i++) {
            for (var j = 0 ; j < segm_size; j++) {
                ctx.fillStyle = (maze[j][i])?'black':'white';
                ctx.fillRect(j*wall_size,i*wall_size,wall_size,wall_size)
            }
        }

        ctx.fillStyle = (0==flash)?'black':'rgba(0,0,0,'+(1-flash/10)+')'
        ctx.fillRect(0,0,screen_size, cvs.height);

        if (flash > 0) flash--;

        splatters.forEach(function(data) {
            ctx.save();
        	ctx.translate((data.pos[0]+.5)*wall_size,(data.pos[1]+.5)*wall_size);
        	ctx.rotate((data.dir+2)*Math.PI/2);
        	ctx.drawImage(splatter, 0, -wall_size/2, wall_size/2, wall_size);
        	ctx.restore();
        })

        ctx.beginPath();
        ctx.arc((player[0]+anim[0]+.5)*wall_size,(player[1]+anim[1]+.5)*wall_size, wall_size/2-5, 0, 2*Math.PI)
        ctx.fillStyle = 'white'
        ctx.fill();
    }

    genMaze();
    animate();

}
