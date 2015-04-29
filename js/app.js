/// <reference path="phaser.js" />

var game = new Phaser.Game(1280, 720, Phaser.AUTO, '', { preload: preload, create: create, update: update });

function preload() {

    //game.load.image('sky', 'assets/sky.png');
    game.load.image('sky', 'assets/backgrounds/blue_desert.png');
    game.load.image('ground', 'assets/platform.png');
    game.load.image('star', 'assets/star.png');
    //game.load.spritesheet('dude', 'assets/dude.png', 32, 48);
    game.load.atlasXML('player1', 'assets/player/spritesheet_players.png', 'assets/player/spritesheet_players.xml');
    game.load.atlasXML('enemies', 'assets/enemies/spritesheet_enemies.png', 'assets/enemies/spritesheet_enemies.xml');
    game.load.atlasXML('groundTiles', 'assets/ground/spritesheet_ground.png', 'assets/ground/spritesheet_ground.xml');
    game.load.atlasXML('spritesheetComplete', 'assets/spritesheet_complete.png', 'assets/spritesheet_complete.xml');

}

var playerFacingRight = true;
var player;
var playerDrawScale = 0.5;
var platforms;
var cursors;

var stars;
var gemPrototype;
var gems;
var map;

function create() {

    game.world.resize(6000, 600);
    //  We're going to be using physics, so enable the Arcade Physics system
    game.physics.startSystem(Phaser.Physics.ARCADE);


    //this.map = this.add.tilemap('map1');
    //this.map.addTilesetImage('tiles', 'tiles');
    //this.layer = this.map.createLayer('Tile Layer 1');
    //this.map.setCollision(20, true, this.layer);

    //  A simple background for our game
    game.add.sprite(0, 0, 'sky');

    //  The platforms group contains the ground and the 2 ledges we can jump on
    platforms = game.add.group();

    //  We will enable physics for any object that is created in this group
    platforms.enableBody = true;

    // Here we create the ground.
    var ground = platforms.create(0, game.world.height - 64, 'ground');

    //  Scale it to fit the width of the game (the original sprite is 400x32 in size)
    ground.scale.setTo(3, 2);

    //  This stops it from falling away when you jump on it
    ground.body.immovable = true;

    //  Now let's create two ledges
    var ledge = platforms.create(400, 400, 'ground');
    ledge.body.immovable = true;

    ledge = platforms.create(-150, 250, 'ground');
    ledge.body.immovable = true;

    // The player and its settings
    //gemPrototype = game.add.sprite(32, game.world.height - 250, 'spritesheetComplete', 'gemBlue.png');
    player = game.add.sprite(32, game.world.height - 250, 'player1', 'alienBlue_front.png');
    player.scale.setTo(playerDrawScale, playerDrawScale);
    player.anchor.setTo(.5, .5);
    player.animations.add('walk', Phaser.Animation.generateFrameNames('alienBeige_walk', 1, 2, '.png'), 10);
    player.animations.add('swim', Phaser.Animation.generateFrameNames('alienBeige_swim', 1, 2, '.png'), 10);
    player.animations.add('climb', Phaser.Animation.generateFrameNames('alienBeige_climb', 1, 2, '.png'), 10);
    //player.animations.add('jump', Phaser.Animation.generateFrameNames('alienBeige_jump', null, null, '.png'), 10);
    //player.animations.play('walk', 2, true);
    

    //  We need to enable physics on the player
    game.physics.arcade.enable(player);

    //  Player physics properties. Give the little guy a slight bounce.
    player.body.bounce.y = 0.2;
    player.body.gravity.y = 500;
    player.body.collideWorldBounds = true;

    game.camera.follow(player);

    //  Our two animations, walking left and right.
    //player.animations.add('left', [0, 1, 2, 3], 10, true);
    //player.animations.add('right', [5, 6, 7, 8], 10, true);

    //  Finally some stars to collect
    stars = game.add.group();

    //  We will enable physics for any star that is created in this group
    stars.enableBody = true;

    //  Here we'll create 12 of them evenly spaced apart
    for (var i = 0; i < 12; i++) {
        //  Create a star inside of the 'stars' group
        var star = stars.create(i * 70, 0, 'spritesheetComplete');

        star.frameName = "gemBlue.png";
        star.anchor.setTo(.5, .5);
        star.scale.setTo(0.25, 0.25);

        //  Let gravity do its thing
        star.body.gravity.y = 300;

        //  This just gives each star a slightly random bounce value
        star.body.bounce.y = 0.7 + Math.random() * 0.2;
    }

    //  Our controls.
    cursors = game.input.keyboard.createCursorKeys();

}

function update() {

    //  Collide the player and the stars with the platforms
    game.physics.arcade.collide(player, platforms);
    game.physics.arcade.collide(stars, platforms);

    //  Checks to see if the player overlaps with any of the stars, if he does call the collectStar function
    game.physics.arcade.overlap(player, stars, collectStar, null, this);

    //  Reset the players velocity (movement)
    player.body.velocity.x = 0;

    if (!player.body.touching.down) {
        player.frameName = "alienBeige_jump.png";
    }
    if (cursors.left.isDown) {
        //  Move to the left
        player.body.velocity.x = -200;
        player.anchor.setTo(.5, .5);
        player.scale.x = -playerDrawScale;
        player.scale.y = playerDrawScale
        player.animations.play('walk');

    }
    else if (cursors.right.isDown) {
        //  Move to the right
        player.body.velocity.x = 200;
        player.anchor.setTo(.5, .5);
        player.scale.x = playerDrawScale;
        player.scale.y = playerDrawScale;
        player.animations.play('walk');
    }
    else {
        //  Stand still
        player.animations.stop();
        player.frameName = "alienBeige_stand.png";
        //player.frame = 4;
    }

    //  Allow the player to jump if they are touching the ground.
    if (cursors.up.isDown && player.body.touching.down) {
        player.body.velocity.y = -500;
    }
    else
    {
        //player.Animation.play('jump');
    }

}

function collectStar(player, star) {

    // Removes the star from the screen
    star.kill();

}

function render() {

    game.debug.cameraInfo(game.camera, 32, 32);
    game.debug.spriteCoords(player, 32, 500);

}