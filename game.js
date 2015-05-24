window.onload = function() {
    // constants
    var screen_size = Math.min(document.body.clientWidth,document.body.clientHeight)-50
    var maze_size = 9
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

    maze[9][0] = 0;

    // generate maze

    var cur = [9,1]
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

    var nextDirs = function(cell) {
        return [[2,0],[0,-2],[-2,0],[0,2]].filter(function(next){
            return maze[cell[0]+next[0]] != undefined &&
                   maze[cell[0]+next[0]][cell[1]+next[1]] != undefined &&
                   !visited[cell[0]+next[0]][cell[1]+next[1]]
        })
    }

    var breakWall = function(cell, dir) {
        maze[cell[0]+dir[0]/2][cell[1]+dir[1]/2] = 0;
        visited[cell[0]+dir[0]][cell[1]+dir[1]] = true;
        cur = [cell[0]+dir[0],cell[1]+dir[1]]
        path.push(cur)
    }

    while (path.length) {
        var dirs = nextDirs(cur)
        if (dirs.length) {
            breakWall(cur, random(dirs))
        } else {
            cur = path.pop();
        }
    }

    // rAF animate
    var animate = function() {
        var exit = window.requestAnimationFrame( animate );
        cvs.width = cvs.width;

        for (var i = 0; i < segm_size; i++) {
            for (var j = 0 ; j < segm_size; j++) {
                ctx.fillStyle = (maze[i][j])?'black':'white';
                ctx.fillRect(j*wall_size,i*wall_size,wall_size,wall_size)
            }
        }

    }

    animate();

}
