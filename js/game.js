/// <reference path="Phaser.js" />

var game = new Phaser.Game(1280, 720, Phaser.AUTO, 'phaser-example', { preload: preload, create: create, update: update, render: render });

function preload() {

    //game.load.tilemap('mario', 'assets/tilemaps/maps/super_mario.json', null, Phaser.Tilemap.TILED_JSON);
    //game.load.image('tiles', 'assets/tilemaps/tiles/super_mario.png');
    //game.load.image('player', 'assets/sprites/phaser-dude.png');
    game.load.audio('jump', 'assets/audio/jump.wav');
    game.load.audio('gemSound', 'assets/audio/coin.wav');

    game.load.image('sky', 'assets/sprites/backgrounds/bg_desert_x3.png');
    game.load.atlasXML('player', 'assets/sprites/player/spritesheet_players.png', 'assets/sprites/player/spritesheet_players.xml');
    game.load.atlasXML('player', 'assets/sprites/player/spritesheet_players.png', 'assets/tilemaps/tile/spritesheet_players.xml');

    game.load.tilemap('level1', 'assets/tilemaps/maps/world-01-01.json', null, Phaser.Tilemap.TILED_JSON);
    game.load.image('tiles', 'assets/tilemaps/tiles/spritesheet_tiles_64x64.png');
    game.load.image('items', 'assets/tilemaps/tiles/spritesheet_items_64x64.png');
    game.load.image('ground', 'assets/tilemaps/tiles/spritesheet_ground_64x64.png');
}

var map;
var tileset;
//var layerNonpassable;

var gems;

var player;
var cursors;

var worldScale = 1;

var playerDrawScale = 0.50;

function create() {

    game.physics.startSystem(Phaser.Physics.ARCADE);

    game.stage.backgroundColor = '#787878';

    sky = game.add.tileSprite(0, 0, 6144, 1024, 'sky');
    sky.fixedtoCamera = true;

    map = game.add.tilemap('level1');
    //map.addTilesetImage('sky', 'backgroundImageLayer');
    map.addTilesetImage('spritesheet_tiles_64x64', 'tiles');
    map.addTilesetImage('spritesheet_items_64x64', 'items');
    map.addTilesetImage('spritesheet_ground_64x64', 'ground');

    //map.setCollisionBetween(27, 29);
    //map.setCollision(40);
    ////  This will set Tile ID 26 (the coin) to call the hitCoin function when collided with
    //map.setTileIndexCallback(26, hitCoin, this);
    ////  This will set the map location 2, 0 to call the function
    //map.setTileLocationCallback(2, 0, 1, 1, hitCoin, this);    

    // background image layer
    //bgtile = this.map.createLayer('backgroundImageLayer');
    //bgtile.scrollFactorX = 1.15;

    // background layer
    layer01 = map.createLayer('layer01-background-passable');
    layer01.alpha = 1.0;
    layer01.resizeWorld();

    // non-passable blocks layer
    layer02 = map.createLayer('layer02-nonpassable');
    layer02.alpha = 1.0;
    map.setCollisionBetween(0, 400, true, layer02, true);

    // gem stuff... http://phaser.io/examples/v2/tilemaps/tile-callbacks
    map.setTileIndexCallback(134, collectGem, this);//, layer02);
    map.setTileIndexCallback(142, collectGem, this);//, layer02);
    map.setTileIndexCallback(149, collectGem, this);//, layer02);
    map.setTileIndexCallback(157, collectGem, this);//, layer02);

    layer02.resizeWorld();
    //map.setCollision();

    //  Un-comment this on to see the collision tiles
    //layer.debug = true;
    //layer2.debug = true;
    
    // add player between background and foreground layers
    player = game.add.sprite(64, 64, 'player', 'alienBlue_front.png');
    player.scale.setTo(playerDrawScale, playerDrawScale);
    player.anchor.setTo(.5, .5);
    
    player.animations.add('walk', Phaser.Animation.generateFrameNames('alienBeige_walk', 1, 2, '.png'), 10);
    player.animations.add('swim', Phaser.Animation.generateFrameNames('alienBeige_swim', 1, 2, '.png'), 10);
    player.animations.add('climb', Phaser.Animation.generateFrameNames('alienBeige_climb', 1, 2, '.png'), 10);

    game.physics.enable(player);
    game.physics.arcade.gravity.y = 500;
    player.body.setSize(64, 64, 0, 46);
    player.body.bounce.y = 0.05;
    player.body.linearDamping = 1;
    player.body.collideWorldBounds = true;

    game.camera.follow(player);

    // add foreground semi-transparent layer (water, lava, clouds, etc.)
    layer03 = map.createLayer('layer03-foreground-passable-semitransparent');
    layer03.alpha = 0.5;
    layer03.resizeWorld();

    //
    layer04 = map.createLayer('layer04-foreground-passable-opaque');
    layer04.alpha = 1.0;
    layer04.resizeWorld();

    layer05 = map.createLayer('layer05-objects');
    layer05.alpha = 1.0;
    //map.setCollisionBetween(0, 400, true, layer05, true);
    layer05.resizeWorld();

    // TODO: add HUD stuff here

    // input
    cursors = game.input.keyboard.createCursorKeys();



    //gems = game.add.group();
    //gems.enableBody = true;
    //142 157 134 149
    //map.createFromObjects('layer05-objects', 142, 'gem', 0, true, false, gems);
    //map.createFromObjects('layer05-objects', 157, 'gem', 0, true, false, gems);
    //map.createFromObjects('layer05-objects', 134, 'gem', 0, true, false, gems);
    //map.createFromObjects('layer05-objects', 149, 'gem', 0, true, false, gems);

    // audio
    jumpsound = this.game.add.audio('jump');
    gemSound = this.game.add.audio('coinSound');
}

function update() {

    sky.tilePosition.x = -(game.camera.x * 0.25);
    sky.tilePosition.y = -(game.camera.y * 0.25);

    game.physics.arcade.collide(player, layer02);

    //game.physics.arcade.overlap(player, gems, collectGems, null, this);

    player.body.velocity.x = 0;

    if (cursors.up.isDown)
    {
        if (player.body.onFloor())
        {
            player.body.velocity.y = -500;
            jumpsound.play();
        }
    }

    if (cursors.left.isDown)
    {
        //player.body.velocity.x = -150;
        player.body.velocity.x = -200;
        player.anchor.setTo(.5, .5);
        player.scale.x = -playerDrawScale;
        player.scale.y = playerDrawScale
        player.animations.play('walk');
    }
    else if (cursors.right.isDown)
    {
        //player.body.velocity.x = 150;
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

    // zoom
    if (game.input.keyboard.isDown(Phaser.Keyboard.Q)) {
        worldScale += 0.05;
    }
    else if (game.input.keyboard.isDown(Phaser.Keyboard.A)) {
        worldScale -= 0.05;
    }

    // set a minimum and maximum scale value
    worldScale = Phaser.Math.clamp(worldScale, 0.25, 2);

    // set our world scale as needed
    game.world.scale.set(worldScale);
}

function render() {

    // game.debug.body(p);
    //game.debug.bodyInfo(player, 32, 320);

}

function collectGem(sprite, tile) {

    gemSound.play();
    //gem.kill();

    tile.alpha = 0.1;
    layer.dirty = true;
    return false;
}

