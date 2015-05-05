/// <reference path="phaser.js" />

var game = new Phaser.Game(1280, 720, Phaser.AUTO, 'phaser-example', { preload: preload, create: create, update: update, render: render });

var map;
var tileset;
//var layerNonpassable;

var layer01;
var layer02;
var layer03;
var layer04;
var layer05;
var layer06;

var players = ['alienBeige', 'alienBlue', 'alienGreen', 'alienPink', 'alienYellow'];
var selectedPlayerIndex = 0;

var gems;

var player;
var playerSpaceShip;
var cursors;

var enemy;
var enemies;
var enemySpawnPoints;

var spring;
var spring2;
var springs;

var tileKeyBlueKey = 141;
var tileKeyGemGreen = 142;
var tileKeyGemRed = 157;
var tileKeyGemYellow = 134;
var tileKeyGemBlue = 149;
var tileKeySpring = 266;


var worldScale = 1;

var playerDrawScale = 0.50;


function preload() {

    loadAudio();

    loadSprites();

    loadTilemap();
}

function loadAudio() {
    //game.load.tilemap('mario', 'assets/tilemaps/maps/super_mario.json', null, Phaser.Tilemap.TILED_JSON);
    //game.load.image('tiles', 'assets/tilemaps/tiles/super_mario.png');
    //game.load.image('player', 'assets/sprites/phaser-dude.png');
    game.load.audio('jump', 'assets/audio/jump.wav');
    game.load.audio('gemSound', 'assets/audio/coin.wav');
    game.load.audio('key', 'assets/audio/key.wav');
    game.load.audio('springSound', 'assets/audio/spring.wav');
}

function loadSprites() {

    // background image
    //game.load.image('sky', 'assets/sprites/backgrounds/bg_desert_x3.png');
    game.load.image('sky', 'assets/sprites/backgrounds/colored_grass.png');
    //game.load.image('sky', 'assets/sprites/backgrounds/blue_land.png');

    // spritesheets for game objects (not in the game map)
    game.load.atlasXML('playerSprites', 'assets/sprites/player/spritesheet_players.png', 'assets/sprites/player/spritesheet_players.xml');
    game.load.atlasXML('enemySprites', 'assets/sprites/enemies/enemies.png', 'assets/sprites/enemies/enemies.xml');
    game.load.atlasXML('tileObjectSprites', 'assets/sprites/objects/spritesheet_complete.png', 'assets/sprites/objects/spritesheet_complete.xml');
    game.load.atlasXML('alienShipSprites', 'assets/sprites/ships/spritesheet_spaceships.png', 'assets/sprites/ships/spritesheet_spaceships.xml');

    // initial placeholders for animated objects
    game.load.image('ghost', 'assets/sprites/enemies/ghost.png');
    game.load.image('sprung', 'assets/sprites/objects/sprung64.png');

}

function loadTilemap() {
    // tilemap for level building
    //game.load.tilemap('level1', 'assets/tilemaps/maps/world-01-02.json', null, Phaser.Tilemap.TILED_JSON);
    game.load.tilemap('level1', 'assets/tilemaps/maps/world-00-overworld.json', null, Phaser.Tilemap.TILED_JSON);
    game.load.image('tiles', 'assets/tilemaps/tiles/spritesheet_tiles_64x64.png');
    game.load.image('items', 'assets/tilemaps/tiles/spritesheet_items_64x64.png');
    game.load.image('ground', 'assets/tilemaps/tiles/spritesheet_ground_64x64.png');
    game.load.image('platformerRequestTiles', 'assets/tilemaps/tiles/platformer-requests-sheet_64x64.png');
    game.load.image('enemyTiles', 'assets/tilemaps/tiles/spritesheet_enemies_64x64.png');
}



function create() {

    game.physics.startSystem(Phaser.Physics.ARCADE);

    game.stage.backgroundColor = '#787878';

    sky = game.add.tileSprite(0, 0, 20480, 1024, 'sky');
    sky.fixedtoCamera = true;

    map = game.add.tilemap('level1');
    //map.addTilesetImage('sky', 'backgroundImageLayer');
    map.addTilesetImage('spritesheet_tiles_64x64', 'tiles');
    map.addTilesetImage('spritesheet_items_64x64', 'items');
    map.addTilesetImage('spritesheet_ground_64x64', 'ground');
    map.addTilesetImage('spritesheet_enemies_64x64', 'enemyTiles');
    map.addTilesetImage('platformer-requests-sheet_64x64', 'platformerRequestTiles');

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
    //map.setCollisionBetween(0, 133, true, layer02, true);
    map.setCollisionBetween(0, 2000, true, layer02, true);
    //map.setCollisionBetween(158, 400, true, layer02, true);

    layer02.resizeWorld();
    //map.setCollision();

    //  Un-comment this on to see the collision tiles
    //layer.debug = true;
    //layer2.debug = true;
    
    // add player between background and foreground layers
    playerSpaceShip = game.add.sprite(300, 300, 'alienShipSprites', 'shipBlue_manned.png');

    player = game.add.sprite(64, 64, 'playerSprites', 'alienBlue_front.png');
    player.scale.setTo(playerDrawScale, playerDrawScale);
    player.anchor.setTo(.5, .5);
    
    for (i = 0; i < players.length; i++) {
        player.animations.add(players[i] + 'walk', Phaser.Animation.generateFrameNames(players[i] + '_walk', 1, 2, '.png'), 10);
        player.animations.add(players[i] + 'swim', Phaser.Animation.generateFrameNames(players[i] + + '_swim', 1, 2, '.png'), 10);
        player.animations.add(players[i] + 'climb', Phaser.Animation.generateFrameNames(players[i] + '_climb', 1, 2, '.png'), 10);
    }

    game.physics.enable(player);
    game.physics.arcade.gravity.y = 600;
    player.body.setSize(64, 64, 0, 47);
    player.body.bounce.y = 0.05;
    player.body.linearDamping = 1;
    player.body.collideWorldBounds = true;

    player.frameName = players[selectedPlayerIndex] + "_stand.png";

    game.camera.follow(player);

    //---------------------------------------------------------------------------------------------------
    // ENEMIES
    //---------------------------------------------------------------------------------------------------
    layer06 = map.createLayer('layer06-enemies');
    layer06.alpha = 0.25;
    enemies = game.add.group();    
    map.createFromTiles([297, 290, 322, 300, 324, 380, 337, 395, 299, 323, 330, 353, 347, 371], null, 'ghost', 'layer06-enemies', enemies, enemy);
    //map.createFromTiles(297, null, 'ghost', 'layer06-enemies', enemies, enemy);
    layer06.resizeWorld();
    enemies.enableBody = true;
    game.physics.enable(enemies);

    //---------------------------------------------------------------------------------------------------
    // OBJECTS
    //---------------------------------------------------------------------------------------------------
    layer05 = map.createLayer('layer05-objects');
    layer05.alpha = 0.75;
    //map.setCollisionBetween(0, 400, true, layer05, true);

    // gem stuff... http://phaser.io/examples/v2/tilemaps/tile-callbacks
    map.setCollision(tileKeyGemRed, true, layer05, true);
    map.setCollision(tileKeyGemGreen, true, layer05, true);
    map.setCollision(tileKeyGemYellow, true, layer05, true);
    map.setCollision(tileKeyGemBlue, true, layer05, true);

    map.setTileIndexCallback(tileKeyGemRed, collectGem, this, layer05);
    map.setTileIndexCallback(tileKeyGemGreen, collectGem, this, layer05);
    map.setTileIndexCallback(tileKeyGemYellow, collectGem, this, layer05);
    map.setTileIndexCallback(tileKeyGemBlue, collectGem, this, layer05);

    // key
    map.setCollision(tileKeyBlueKey, true, layer05, true);
    map.setTileIndexCallback(tileKeyBlueKey, collectKey, this, layer05);

    // green flag no wind: 146

    springs = game.add.group();
    //springs.enableBody = true;
    //spring2 = game.add.sprite(64, 64, 'tileObjectSprites', 'spring0.png');
    //spring2.animations.add('springAnimation', Phaser.Animation.generateFrameNames('spring', 0, 1, '.png'), 10);
    
    ////spring.animation.add('springAnimation', Phaser.Animation.generateFrameNames('spring', 0, 1, '.png'), 10);
    
    

    

    map.setCollision(tileKeySpring, true, layer05, true);
    map.setTileIndexCallback(tileKeySpring, touchSpring, this, layer05);
    
    map.createFromTiles(tileKeySpring, null, 'tileObjectSprites', 'layer05-objects', springs, spring);
    springs.forEach(function (item) {
    //item.animations.add('springAnimation', Phaser.Animation.generateFrameNames('spring', 0, 1, '.png'), 10);
    //item.animations.play('springAnimation');
    //var enemy = game.add.sprite(100, 100, 'enemySprites', 'ghost.png');
        item.scale.setTo(0.5, 0.5);
        item.anchor.setTo(0, 0);
        //item.body.setSize(64, 64, 0, 32);
        }, this);

    springs.callAll('animations.add', 'animations', 'springAnimation', Phaser.Animation.generateFrameNames('spring', 0, 1, '.png'), 2, true, false);
    springs.callAll('play', null, 'springAnimation');

    layer05.resizeWorld();


    //---------------------------------------------------------------------------------------------------
    // foreground semi-transparent layer (water, lava, clouds, etc.)
        //---------------------------------------------------------------------------------------------------
    layer03 = map.createLayer('layer03-foreground-passable-semitransparent');
    layer03.alpha = 0.5;
    layer03.resizeWorld();

        //---------------------------------------------------------------------------------------------------
    // FOREGROUND PASSABLE OPAQUE LAYER
    //---------------------------------------------------------------------------------------------------
    layer04 = map.createLayer('layer04-foreground-passable-opaque');
    layer04.alpha = 1.0;
    layer04.resizeWorld();


    //enemySpawnPoints.forEach(function (item) {
    //    var enemy = game.add.sprite(100, 100, 'enemySprites', 'ghost.png');
    //    //enemy.scale.setTo(playerDrawScale, playerDrawScale);
    //    enemy.anchor.setTo(.5, .5);
    //}, this);

    //enemies.callAll();
    //enemies.callAll('animations.add', 'animations', players[selectedPlayerIndex] + 'walk', [1, 2], 10, true);
    //enemies.callAll('animations.play', 'animations', players[selectedPlayerIndex] + 'walk');

    //gems = game.add.group();
    //gems.enableBody = true;
    //map.createFromObjects('layer05-objects', 134, 'gem', 0, true, false, gems);
    //map.createFromObjects('layer05-objects', 142, 'gem', 0, true, false, gems);
    //map.createFromObjects('layer05-objects', 149, 'gem', 0, true, false, gems);
    //map.createFromObjects('layer05-objects', 157, 'gem', 0, true, false, gems);


    // TODO: add HUD stuff here

    // input
    cursors = game.input.keyboard.createCursorKeys();
    
    // audio
    jumpsound = this.game.add.audio('jump');
    gemSound = this.game.add.audio('gemSound');
    keySound = this.game.add.audio('key');
    springSound = this.game.add.audio('springSound');
    springSound.allowMultiple = false;
}

function createMap() {

}

function update() {

    sky.tilePosition.x = -(game.camera.x * 0.25);
    sky.tilePosition.y = -(game.camera.y * 0.05) + 250;

    game.physics.arcade.collide(player, layer02);
    game.physics.arcade.collide(player, layer05);
    game.physics.arcade.collide(enemies, layer02);
    game.physics.arcade.collide(enemies, enemies);

    game.physics.arcade.collide(player, enemies);

    //game.physics.arcade.collide(springs, player);
    //game.physics.arcade.collide(springs, layer02);
    

    //spring2.animations.play('springAnimation');
    //game.physics.arcade.overlap(player, gems, collectGems, null, this);

    player.body.velocity.x = 0;

    if (cursors.up.isDown || game.input.keyboard.isDown(Phaser.Keyboard.W) || game.input.keyboard.isDown(Phaser.Keyboard.SPACEBAR))
    {
        if (player.body.onFloor())
        {
            player.body.velocity.y = -500;
            jumpsound.play();
        }
    }

    if (cursors.left.isDown || game.input.keyboard.isDown(Phaser.Keyboard.A))
    {
        //player.body.velocity.x = -150;
        player.body.velocity.x = -200;
        player.anchor.setTo(.5, .5);
        player.scale.x = -playerDrawScale;
        player.scale.y = playerDrawScale
        player.animations.play(players[selectedPlayerIndex] + 'walk');
    }
    else if (cursors.right.isDown || game.input.keyboard.isDown(Phaser.Keyboard.D))
    {
        //player.body.velocity.x = 150;
        player.body.velocity.x = 200;
        player.anchor.setTo(.5, .5);
        player.scale.x = playerDrawScale;
        player.scale.y = playerDrawScale;
        player.animations.play(players[selectedPlayerIndex] + 'walk');
    }
    else if (cursors.down.isDown || game.input.keyboard.isDown(Phaser.Keyboard.S)) {
        if (player.body.onFloor()) {
            player.frameName = players[selectedPlayerIndex] + "_duck.png";
        }
    }
    else {
        //  Stand still
        player.animations.stop();
        player.frameName = players[selectedPlayerIndex] + "_stand.png";
        //player.frame = 4;
    }

   
    if (player.body.onFloor()) {
        //player.frameName = "alienBeige_duck.png";
    }
    else {
        player.frameName = players[selectedPlayerIndex] + "_jump.png";
    }

    if (game.input.keyboard.isDown(Phaser.Keyboard.NUMPAD_0)) {
        selectedPlayerIndex = 0;
    }
    if (game.input.keyboard.isDown(Phaser.Keyboard.NUMPAD_1)) {
        selectedPlayerIndex = 1;
    }
    if (game.input.keyboard.isDown(Phaser.Keyboard.NUMPAD_2)) {
        selectedPlayerIndex = 2;
    }
    if (game.input.keyboard.isDown(Phaser.Keyboard.NUMPAD_3)) {
        selectedPlayerIndex = 3;
    }
    if (game.input.keyboard.isDown(Phaser.Keyboard.NUMPAD_4)) {
        selectedPlayerIndex = 4;
    }

    // zoom
    if (game.input.keyboard.isDown(Phaser.Keyboard.Q)) {
        worldScale += 0.05;
    }
    else if (game.input.keyboard.isDown(Phaser.Keyboard.Z)) {
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

    if (tile.alpha > 0) {
        gemSound.play();

        //map.removeTile(tile.x, tile.y);

        tile.alpha = 0;
        tile.collideUp = false;
        tile.collideDown = false;
        tile.collideLeft = false;
        tile.collideRight = false;
        layer05.dirty = true;
        map.dirty = true;
        map.setLayer(layer05);
    }
    return false;
}

function collectKey(sprite, tile) {

    if (tile.alpha > 0) {
        keySound.play();

        //map.removeTile(tile.x, tile.y);

        tile.alpha = 0;
        tile.collideUp = false;
        tile.collideDown = false;
        tile.collideLeft = false;
        tile.collideRight = false;
        layer05.dirty = true;
        map.dirty = true;
        map.setLayer(layer05);
    }
    return false;
}

function touchSpring(sprite, tile) {

    //if(springSound.)
    //if (tile.alpha > 0) {
    player.body.velocity.y = -650;
    springSound.play();

    //spring.animations.play('springAnimation');

        //map.removeTile(tile.x, tile.y);

    //    tile.alpha = 0;
    //    tile.collideUp = false;
    //    tile.collideDown = false;
    //    tile.collideLeft = false;
    //    tile.collideRight = false;
    //    layer05.dirty = true;
    //    map.dirty = true;
    //    map.setLayer(layer05);
    //}
    //return false;
}



//function collectGem2(player, gem) {

//    gemSound.play();
//    gem.kill();
//}
