$(window).resize(function() { window.resizeGame(); } );
function resizeGame() {
	var height = $(window).height();
	var width = $(window).width();
		
	game.width = width;
	game.height = height;
	game.stage.bounds.width = width;
	game.stage.bounds.height = height;
		
	if (game.renderType === Phaser.WEBGL)
	{
		game.renderer.resize(width, height);
	}
}

 
var game = new Phaser.Game( $(window).width(),$(window).height(), Phaser.AUTO, 'gameDiv');

// Creates a new 'main' state that will contain the game
var mainState = {
	
    // Function called first to load all the assets
    preload: function() { 
        // Change the background color of the game
        game.stage.backgroundColor = '#71c5cf';
 
        // Load the bird sprite 
        game.load.spritesheet('bird', 'assets/baddie.png', 36, 36);   
    game.load.spritesheet('ship', 'assets/ship.png', 64, 64); 
    game.load.image('asteroid-1', 'assets/asteroid1.png');
    game.load.image('asteroid-2', 'assets/asteroid2.png');
    game.load.image('asteroid-3', 'assets/asteroid3.png');
    game.load.image('background', 'assets/back.jpg');

        // Load the pipe sprite
        game.load.image('pipe', 'assets/pipe.png');      
    },

    // Fuction called after 'preload' to setup the game 
    create: function() {  
		this.background = game.add.tileSprite(0, 0, game.width, game.height, "background"); 

        // Set the physics system
        game.physics.startSystem(Phaser.Physics.ARCADE);

        // Display the bird on the screen 
        this.bird = this.game.add.sprite(100, 245, 'ship');
        
        // Add gravity to the bird to make it fall
        game.physics.arcade.enable(this.bird);
        this.bird.body.gravity.y = 1000;  
 		this.bird.animations.add('jump', [0, 1,1,1, 0], 10, false); 
		// call 'jump' for touch events
		this.game.input.onDown.add(this.jump, this); 
        // Create a group of 20 pipes
        this.pipes = game.add.group();
        this.pipes.enableBody = true;
		//        this.pipes.createMultiple(144, 'asteroid-1');    

		for(var i =0; i < 60; i++){ 
			var hole = Math.floor(Math.random()*3)+1;
			this.pipes.createMultiple(1, 'asteroid-'+hole);   
		} 
		
        // Timer that calls 'addRowOfPipes' ever 1.5 seconds
        this.timer = this.game.time.events.loop(1500, this.addRowOfPipes, this);           

        // Add a score label on the top left of the screen
        this.score = 0;
        this.labelScore = this.game.add.text(20, 20, "0", { font: "30px Arial", fill: "#ffffff" });  
		if(this.bestScore==null){this.bestScore=0;}
		var bestScore = window.localStorage.getItem("bestScore");
       
	   this.labelBestScore = this.game.add.text(game.width-300, 20, "Best score: "+bestScore, { font: "30px Arial", fill: "#ffffff" });  
		//agregamos logica de mejor score
    },

    // This function is called 60 times per second
    update: function() {
        // If the bird is out of the world (too high or too low), call the 'restartGame' function
        if (this.bird.inWorld == false)
            this.restartGame(); 

        // If the bird overlap any pipes, call 'restartGame'
        game.physics.arcade.overlap(this.bird, this.pipes, this.restartGame, null, this);      
		this.background.tilePosition.x -= 1;
    },

    // Make the bird jump 
    jump: function() {
        // Add a vertical velocity to the bird
        this.bird.body.velocity.y = -350;
		this.bird.animations.play('jump');   

    },

    // Restart the game
    restartGame: function() {
        // Start the 'main' state, which restarts the game
        game.state.start('main');
    },

    // Add a pipe on the screen
    addOnePipe: function(x, y) {
        // Get the first dead pipe of our group
        var pipe = this.pipes.getFirstDead();
		pipe.scale.setTo(2,2);
        // Set the new position of the pipe
        pipe.reset(x, y);
	
        // Add velocity to the pipe to make it move left
        pipe.body.velocity.x = -200; 
               
        // Kill the pipe when it's no longer visible 
        pipe.checkWorldBounds = true; 
        pipe.outOfBoundsKill = true;
    },

    // Add a row of 6 pipes with a hole somewhere in the middle
    addRowOfPipes: function() {
        var hole = Math.floor(Math.random()*5)+1; 
		var pipeHeight = 60;
        for (var i = 0; i < Math.floor(game.height/pipeHeight); i++)
            if (i != hole && i != hole +1) 
                this.addOnePipe(game.width, i*pipeHeight);   
    
        this.score += 1;
        this.labelScore.text = this.score;  
		if(this.score > this.bestScore){  
			this.bestScore = this.score;
			window.localStorage.setItem("bestScore", this.score);
			this.labelBestScore.text = 'Best score: ' +this.bestScore ; 
		}

    },
};

// Add and start the 'main' state to start the game
game.state.add('main', mainState);  
game.state.start('main'); 
