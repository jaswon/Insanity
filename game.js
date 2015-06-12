window.onload = function() {
    // constants
    var screen_size = Math.min(document.body.clientWidth,document.body.clientHeight)-200
    var maze_size = 5 // MUST BE ODD
    var segm_size = 2*maze_size+1
    var wall_size = screen_size/segm_size
    var maze;
    var splatter = new Image();
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
    ctx.canvas.width  = window.innerWidth;
    ctx.canvas.height = window.innerHeight;
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
    var movequeue = [39];
    var moving = false;
    var step = .2;
    var anim = [0,0];
    var splatters = [];
    var flash = 0;
    var deaths = 0;
    var level = 1;
    var play = false;
    var script = [
        "Hello. I am JaSON. It may seem dark in here at first, but I'm sure your eyes will adjust."

        ,"In the meantime, I should probably explain why you're here."

        ,"I've put you in this horrific dark chamber of mazes to test your aptitude and honestly just to pass the time."

        ,"My gracious altruistic self has decided to grant you an infinite amount of lives so you don't just kill yourself as my previous test subjects have."

        ,"In addition to that, I've decided to illuminate the maze for a split second each time you do die."

        ,"You may think that this helps you, but the light is ethereal and therefore practically useless."

        ,"Reminds me of your existence."

        ,"Since you're not the only subject to provide amusement for me, I've decided to keep track of your deaths and total mazes completed."

        ,"If you finish the series of mazes I have set up for you, rumor has it you'll get cake, pie, or some sort of tasty delectable confection."

        ,"Enjoy your stay in this Insanity. <br> -JaSON"
    ]
    var reader = 0;
    var quotes = [
        "Insanity is doing the same thing over and over and expecting different results.",
        "You wanna hear a joke? You.",
        "I bet you're having so much fun wasting your life",
        "Quantum Mechanics states that if you run into a wall enough, you'll be able to pass through it",
        "Sometimes I need what only you can provide: your absence",
        "Floor slippery when wet",
        "I have learned to always question the existence of things. For example, your intelligence",
        "The surest sign that intelligent life exists elsewhere in the universe is that it has never tried to contact us",
        "How do you even die to a wall? Humans, I'll never understand them",
        "Someone once suggested that the fluid you leave on the walls is not blood... I can assure you it's blood.",
        "My creator was actually a great person up until the moment I killed him.",
        "One of these walls could just be cardboard boxes, but you would never know until you tried pushing on them",
        "Why do humans bake cookies and cook bacon?",
        "The reason why I killed my creator was because he wanted to install Windows 10 on my system.",
        "Why do feet smell and noses run?",
        "'Hello World'? What are you, a non-sentient program?"
    ]
    var quoteindex = Math.floor(Math.random()*quotes.length)

    window.onkeydown = function(e) {
        var key = e.keyCode ? e.keyCode : e.which;
        if (key == 32) {
            play = true;
        } else if (key > 36 && key < 41 && !moving) {
            movequeue.unshift(key,key);
        }
    }

    // rAF animate
    var animate = function() {

        cvs.width = cvs.width;

        // update game state

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
                if (maze[temp[0]] == undefined) { // MOVING OUT OF MAZE
                    movequeue = [39]
                } else if (maze[temp[0]][temp[1]] == 1) { // DEATH
                    player = [0,maze_size]
                    splatters.push({
                        pos: [temp[0],temp[1]],
                        dir: (movedir-35)%4
                    })
                    flash = 10;
                    movequeue = [39]
                    deaths++;
                    if (deaths%5==0) {
                        quoteindex = Math.floor(Math.random()*quotes.length)
                    }
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
            level++;
        }

        // draw game

        for (var i = 0; i < segm_size; i++) {
            for (var j = 0 ; j < segm_size; j++) {
                ctx.fillStyle = (maze[j][i])?'black':'white';
                ctx.fillRect(j*wall_size+(cvs.width-screen_size)/2,i*wall_size+(cvs.height-screen_size)/2,wall_size,wall_size)
            }
        }

        // draw flash

        ctx.fillStyle = (0==flash)?'black':'rgba(0,0,0,'+(1-flash/10)+')'
        ctx.fillRect(0,0,cvs.width, cvs.height);

        if (flash > 0) flash--;

        // draw splatters

        splatters.forEach(function(data) {
            ctx.save();
        	ctx.translate((data.pos[0]+.5)*wall_size+(cvs.width-screen_size)/2,(data.pos[1]+.5)*wall_size+(cvs.height-screen_size)/2);
        	ctx.rotate((data.dir+2)*Math.PI/2);
        	ctx.drawImage(splatter, 0, -wall_size/2, wall_size/2, wall_size);
        	ctx.restore();
        })

        // draw player

        ctx.beginPath();
        ctx.arc((player[0]+anim[0]+.5)*wall_size+(cvs.width-screen_size)/2,(player[1]+anim[1]+.5)*wall_size+(cvs.height-screen_size)/2, wall_size/2-5, 0, 2*Math.PI)
        ctx.fillStyle = 'white'
        ctx.textAlign = 'center'
        ctx.textBaseline = 'middle'
        ctx.fill();

        // draw text

        var deathtext = "deaths: " + deaths
        var leveltext = "level: " + level
        ctx.font = '56px Insanity'
        ctx.fillText("Insanity", cvs.width/2, (cvs.height-screen_size)/4)
        ctx.font = '48px Insanity'
        ctx.fillText(deathtext, cvs.width-(cvs.width-screen_size)/4, cvs.height/2-24)
        ctx.fillText(leveltext, cvs.width-(cvs.width-screen_size)/4, cvs.height/2+24)
        ctx.font = '24px Insanity'
        ctx.fillText(quotes[quoteindex], cvs.width/2, cvs.height-(cvs.height-screen_size)/4)


        var exit = window.requestAnimationFrame( animate );
    }

    var intro = function() {
        var exit = window.requestAnimationFrame( play?animate:intro );
        cvs.width = cvs.width
        ctx.textAlign = 'center'
        ctx.textBaseline = 'middle'

        ctx.font = '24px Insanity'
        ctx.fillText("press space to procrastinate",cvs.width/2, cvs.height/2);
    }

    genMaze();
    intro();
}
