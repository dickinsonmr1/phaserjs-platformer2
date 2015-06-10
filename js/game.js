/// <reference path="phaser.js" />

var game = new Phaser.Game(1280, 720, Phaser.CANVAS, 'phaser-example', { preload: preload, create: create, update: update, render: render });

var map;
var tileset;
//var layerNonpassable;

var layer01;
var layer02;
var layer03;
var layer04;
var layer05;
var layer06;
var layer07;

var players = ['alienBeige', 'alienBlue', 'alienGreen', 'alienPink', 'alienYellow'];
var selectedPlayerIndex = 0;

var gems;

var player;
var playerSpaceShip;
var cursors;
var playerGun;
var playerGunBullet;

var bullets;
var bulletTime = 0;

var enemy;
var enemies;

var enemyPhysics;
var enemiesPhysics;

var enemyNonGravity;
var enemiesNonGravity;

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
var enemyDrawScale = 1;

var enemySpeed = 200;

var emitter;
var emitTime;

var isWorldLoaded = false;

var hudGroup;
var playerHudIcon

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
    game.load.atlasXML('alienShipLaserSprites', 'assets/sprites/ships/spritesheet_lasers.png', 'assets/sprites/ships/spritesheet_lasers.xml');

    // initial placeholders for animated objects
    game.load.image('ghost', 'assets/sprites/enemies/ghost.png');
    game.load.image('piranha', 'assets/sprites/enemies/piranha.png');
    game.load.image('sprung', 'assets/sprites/objects/sprung64.png');
    game.load.image('engineExhaust', 'assets/sprites/ships/laserblue3.png');

    game.load.image('playerGun', 'assets/sprites/player/raygunPurpleBig.png');
    game.load.image('playerGunBullet', 'assets/sprites/player/laserPurpleDot.png');


}

function loadTilemap() {
    // tilemap for level building
    game.load.tilemap('level1', 'assets/tilemaps/maps/world-01-02.json', null, Phaser.Tilemap.TILED_JSON);
    //game.load.tilemap('level1', 'assets/tilemaps/maps/world-00-overworld.json', null, Phaser.Tilemap.TILED_JSON);
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

    hudGroup = game.add.group();

    // http://www.html5gamedevs.com/topic/6380-moving-a-camera-fixed-sprite/
    playerHudIcon = game.add.image(0, 0, 'playerSprites', 'alienBlue_front.png');
    playerHudIcon.fixedToCamera = true;
    playerHudIcon.anchor.setTo(0, 0);
    
    //hudGroup.add(playerHudIcon);

    createWorld('level1');
}

function createWorld(worldName) {

    map = game.add.tilemap(worldName);
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

    createSpaceShip();

    createPlayer();


    //---------------------------------------------------------------------------------------------------
    // ENEMIES
    //---------------------------------------------------------------------------------------------------
    layer07 = map.createLayer('layer07-enemies');
    layer07.alpha = 0.1;
    enemies = game.add.group();

    enemiesPhysics = game.add.group();  // removed 324
    map.createFromTiles([297, 290, 322, 300, 380, 337, 395, 299, 323, 330, 353, 347, 371], null, 'ghost', 'layer07-enemies', enemiesPhysics, enemyPhysics);

    enemiesNonGravity = game.add.group();
    map.createFromTiles([324], null, 'piranha', 'layer07-enemies', enemiesNonGravity, enemyNonGravity);

    layer07.resizeWorld();

    game.physics.enable(enemiesNonGravity);
    enemiesNonGravity.forEach(function (enemy) {
        enemy.enemyType = "nonGravity";
        enemy.movementTime = 0;

        enemy.enableBody = true;
        enemy.body.allowGravity = false;
        enemy.body.velocity.y = 150;
        enemy.body.collideWorldBounds = false;
        enemy.isFacingRight = true;
    }, this);
    enemies.add(enemiesNonGravity);

    game.physics.enable(enemiesPhysics);
    enemiesPhysics.forEach(function (enemy) {
        enemy.enemyType = "physics";
        enemy.enableBody = true;
        enemy.body.collideWorldBounds = true;
        enemy.isFacingRight = true;
    }, this);
    enemies.add(enemiesPhysics);
    //enemies.enableBody = true;F
    //enemies.body.collideWorldBounds = true;    

    //---------------------------------------------------------------------------------------------------
    // COLLECTIBLES
    //---------------------------------------------------------------------------------------------------
    layer05 = map.createLayer('layer05-collectibles');
    layer05.alpha = 1.0;//0.75;
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
    layer05.resizeWorld();


    //---------------------------------------------------------------------------------------------------
    // GAMEOBJECTS
    //---------------------------------------------------------------------------------------------------
    layer06 = map.createLayer('layer06-gameobjects');
    layer06.alpha = 0.0;//0.75;
    //map.setCollisionBetween(0, 400, true, layer05, true);

    // green flag no wind: 146

    springs = game.add.group();
    

    map.setCollision(tileKeySpring, true, layer06, true);

    map.createFromTiles(tileKeySpring, null, 'tileObjectSprites', 'layer06-gameobjects', springs, spring);
    layer06.resizeWorld();

    game.physics.enable(springs);
    springs.forEach(function (item) {        
        item.enableBody = true;
        item.immovable = true;
        item.body.moves = false;
        item.scale.setTo(0.5, 0.5);
        item.anchor.setTo(0, 0);
    }, this);

    springs.callAll('animations.add', 'animations', 'springAnimation', Phaser.Animation.generateFrameNames('spring', 0, 1, '.png'), 2, true, false);
    springs.callAll('play', null, 'springAnimation');

    


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

    // TODO: add HUD stuff here

    // input
    cursors = game.input.keyboard.createCursorKeys();

    // audio
    jumpsound = this.game.add.audio('jump');
    gemSound = this.game.add.audio('gemSound');
    keySound = this.game.add.audio('key');
    springSound = this.game.add.audio('springSound');
    springSound.allowMultiple = false;






    bullets = game.add.group();
    game.physics.enable(bullets);
    bullets.enableBody = true;
    bullets.allowGravity = false;

    for (var i = 0; i < 200; i++) {
        var b = bullets.create(0, 0, 'playerGunBullet');
        b.name = 'bullet' + i;
        b.exists = false;
        b.visible = false;
        b.checkWorldBounds = true;
        b.body.gravity.y = 0;
        b.body.collideWorldBounds = true;
        b.events.onOutOfBounds.add(resetBullet, this);
    }



    isWorldLoaded = true;
}

function update() {
    if (isWorldLoaded)
    {
        sky.tilePosition.x = -(game.camera.x * 0.25);
        sky.tilePosition.y = -(game.camera.y * 0.05) + 250;

        emitTime++;

        updatePhysics();
        updatePlayer();
        updateBullets();
        processInput();

        updateEnemies();

        updateHud();
    }
}

function updatePhysics() {

    if (!player.isInSpaceShip) {
        game.physics.arcade.collide(player, layer02);
        game.physics.arcade.collide(player, layer05);
        game.physics.arcade.collide(player, springs, playerTouchingSpringHandler, null, this);

        game.physics.arcade.collide(playerSpaceShip, player, playerEnteringSpaceshipCollisionHandler, null, this);

        game.physics.arcade.collide(player, enemiesPhysics);
        game.physics.arcade.collide(player, enemiesNonGravity);
    }
    else {
        game.physics.arcade.collide(playerSpaceShip, layer02);
        game.physics.arcade.collide(playerSpaceShip, layer05);

        game.physics.arcade.collide(playerSpaceShip, enemiesPhysics);
        game.physics.arcade.collide(playerSpaceShip, enemiesNonGravity);
    }        

    game.physics.arcade.collide(enemiesPhysics, layer02);
    game.physics.arcade.collide(enemiesPhysics, enemiesPhysics);
}

function playerEnteringSpaceshipCollisionHandler(playerSpaceShip, player)
{
    if (player.renderable) {
        
        player.isInSpaceShip = true;
        //particleBurst();
        emitter.start(false, 1000, 100, 0);
    }
}

function playerTouchingSpringHandler(player, springs) {

    if (!player.isInSpaceShip) {
        //if(springSound.)
        //if (tile.alpha > 0) {
        player.body.velocity.y = -650;
        springSound.play();
    }
}

function playerExitingSpaceship() {
    player.isInSpaceShip = false;
    player.body.velocity.y = -400;
    player.body.x = playerSpaceShip.body.x +50;
    player.renderable = true;
    playerSpaceShip.body.velocity.x = 0;
    playerSpaceShip.body.velocity.y = 0;
    playerSpaceShip.frameName = "shipBeige.png"; //players[selectedPlayerIndex] + "_stand.png";

    emitter.on = false;
}

function updatePlayer() {

    if (!player.isInSpaceShip)
    {
        player.body.velocity.x = 0;

        if (cursors.up.isDown || game.input.keyboard.isDown(Phaser.Keyboard.W) || game.input.keyboard.isDown(Phaser.Keyboard.SPACEBAR)) {
            if (player.body.onFloor()) {
                player.body.velocity.y = -500;
                jumpsound.play();
            }
        }

        if (cursors.left.isDown || game.input.keyboard.isDown(Phaser.Keyboard.A)) {

            player.isFacingRight = false;

            //player.body.velocity.x = -150;
            player.body.velocity.x = -200;
            player.anchor.setTo(.5, .5);
            player.scale.x = -playerDrawScale;
            player.scale.y = playerDrawScale
            player.animations.play(players[selectedPlayerIndex] + 'walk');

            playerGun.scale.x = -0.8;
            playerGun.scale.y = 0.8;
            playerGun.anchor.setTo(.5, .5);
            playerGun.body.x = player.body.x - 45;

            playerGun.body.y = player.body.y - 22;
        }
        else if (cursors.right.isDown || game.input.keyboard.isDown(Phaser.Keyboard.D)) {

            player.isFacingRight = true;

            //player.body.velocity.x = 150;
            player.body.velocity.x = 200;
            player.anchor.setTo(.5, .5);
            player.scale.x = playerDrawScale;
            player.scale.y = playerDrawScale;
            player.animations.play(players[selectedPlayerIndex] + 'walk');

            playerGun.scale.x = 0.8;
            playerGun.scale.y = 0.8;
            playerGun.anchor.setTo(.5, .5);
            playerGun.body.x = player.body.x + 20;

            playerGun.body.y = player.body.y - 22;
        }
        else if (cursors.down.isDown || game.input.keyboard.isDown(Phaser.Keyboard.S)) {
            if (player.body.onFloor()) {
                player.frameName = players[selectedPlayerIndex] + "_duck.png";

                playerGun.body.y = player.body.y - 10;
            }
        }
        else {
            //  Stand still
            player.animations.stop();
            player.frameName = players[selectedPlayerIndex] + "_stand.png";
            //player.frame = 4;\

            playerGun.body.y = player.body.y - 22;
        }

        if (player.body.onFloor()) {
            //player.frameName = "alienBeige_duck.png";
        }
        else {
            player.frameName = players[selectedPlayerIndex] + "_jump.png";
        }


        if (game.input.keyboard.isDown(Phaser.Keyboard.CONTROL)) {
            fireBullet();
        }

       

        //if (player.isFacingRight) {
        //    playerGun.body.x = player.body.x + 20;
        //    playerGun.body.y = player.body.y - 33;
        //    playerGun.anchor.setTo(1, 0);
        //}
        //else {
        //    playerGun.body.x = player.body.x - 20;
        //    playerGun.body.y = player.body.y - 33;
        //    playerGun.anchor.setTo(1, 0);
        //}



        if (player.isFacingRight) {
       
        }
        if (!player.isFacingRight) {

            
        }
    }
    else
    {
        //if (emitTime > 40) {
            //emitTime = 0;
            particleBurst();
        //}
        playerSpaceShip.body.velocity.x = 0;
        playerSpaceShip.body.velocity.y = 0;

        player.body.x = playerSpaceShip.body.x;
        player.body.y = playerSpaceShip.body.y;
        player.renderable = false;

        playerSpaceShip.frameName = "shipBeige_manned.png"; //players[selectedPlayerIndex] + "_stand.png";
        if (cursors.up.isDown || game.input.keyboard.isDown(Phaser.Keyboard.W) || game.input.keyboard.isDown(Phaser.Keyboard.SPACEBAR)) {
            playerSpaceShip.body.velocity.y = -300;
            playerSpaceShip.anchor.setTo(.5, .5);
            //particleBurst();
        }
        else if (cursors.down.isDown || game.input.keyboard.isDown(Phaser.Keyboard.S)) {
            playerSpaceShip.body.velocity.y = 300;
            playerSpaceShip.anchor.setTo(.5, .5);
            //particleBurst();
        }

        if (cursors.left.isDown || game.input.keyboard.isDown(Phaser.Keyboard.A)) {
            playerSpaceShip.body.velocity.x = -300;
            playerSpaceShip.anchor.setTo(.5, .5);
            //particleBurst();
        }
        else if (cursors.right.isDown || game.input.keyboard.isDown(Phaser.Keyboard.D)) {
            playerSpaceShip.body.velocity.x = 300;
            playerSpaceShip.anchor.setTo(.5, .5);
            //particleBurst();
        }        
        else {
            //playerSpaceShip.body.velocity *= 0.5;
            //  Stand still
            //player.frameName = players[selectedPlayerIndex] + "_stand.png";
            //player.frame = 4;
        }

        if (game.input.keyboard.isDown(Phaser.Keyboard.E)) {

            playerExitingSpaceship();

            //particleBurst();
        }


        //if (game.input.keyboard.isDown(Phaser.Keyboard.CONTROL)) {

        //    var laser = game.add.sprite(playerSpaceShip.body.x, playerSpaceShip.body.y + 100, 'alienShipLaserSprites', 'laserblue3.png');
        //    //laser.scale.setTo(playerDrawScale, playerDrawScale);
        //    laser.anchor.setTo(.5, .5);
        //    laser.frameName = "laserblue3.png";

        //    playerSpaceShip.emitExhaust = true;
        //    //game.add.sprite(325, 490, 'alienShipLaserSprites', 'laserBlue3.png');
        //}

    }
}

function updateBullets() {

    bullets.forEach(function (bullet) {
        bullet.body.velocity.y = 0;
    }, this);
}

function processInput() {


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

function updateEnemies(){

    enemiesPhysics.forEach(function (enemy) {
        //http://www.emanueleferonato.com/2015/05/12/phaser-tutorial-html5-player-movement-as-seen-in-ipad-magick-game-using-mostly-tile-maps/

        if (enemy.body.blocked.right && enemy.isFacingRight)//.body.velocity.x > 0)
        {
            enemy.isFacingRight = false;
        }

        if (enemy.body.blocked.left && !enemy.isFacingRight)//.body.velocity.x < 0)
        {
            enemy.isFacingRight = true;
        }

        if (enemy.isFacingRight) {

            enemy.scale.x = -enemyDrawScale;
            enemy.anchor.setTo(.5, .5);
            enemy.body.velocity.x = enemySpeed;
        }
        if (!enemy.isFacingRight) {

            enemy.body.velocity.x = -enemySpeed;
            enemy.anchor.setTo(.5, .5);
            enemy.scale.x = enemyDrawScale;
        }        
    }, this);

    enemiesNonGravity.forEach(function (enemy) {
        enemy.movementTime++;
        if (enemy.movementTime > 60) {
            enemy.movementTime = 0;
            enemy.body.velocity.y *= -1;
            if(enemy.body.velocity.y > 0)
            {
                enemy.anchor.setTo(.5, .5);
                enemy.scale.y = -enemyDrawScale;
            }
            else
            {
                enemy.anchor.setTo(.5, .5);
                enemy.scale.y = enemyDrawScale;
            }
        }
        //enemy.y += enemy.body.velocity;
    }, this);
}

function updateHud() {
    //hudGroup.bringToTop();
    playerHudIcon.bringToTop();
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

function createPlayer() {

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

    player.isInSpaceShip = false;

    player.isFacingRight = true;

    playerGun = game.add.sprite(64, 64, 'playerGun', 'playerGun');
    playerGun.anchor.setTo(0.5, 0.5);

    game.physics.enable(playerGun);

    game.camera.follow(player);
}

function createSpaceShip()
{
    playerSpaceShip = game.add.sprite(400, 800, 'alienShipSprites', 'shipBeige.png');
    game.physics.enable(playerSpaceShip);
    playerSpaceShip.body.collideWorldBounds = true;
    playerSpaceShip.enableBody = true;
    playerSpaceShip.body.allowGravity = false;

    createSpaceShipExhaustEmitter();
}

function createSpaceShipExhaustEmitter()
{
    emitter = game.add.emitter(playerSpaceShip.body.x, playerSpaceShip.body.y, 200);

    emitter.makeParticles('engineExhaust');
    emitter.minRotation = 0;
    emitter.maxRotation = 0;
    //emitter.gravity = 150;
    emitter.setAlpha(1, 0, 1250);
    emitter.setXSpeed(0, 0);
    emitter.setYSpeed(100, 150);
    //emitter.bounce.setTo(0.5, 0.5);
    emitter.setScale(0.1, 1, 0.25, 0.25, 1000, Phaser.Easing.Quintic.Out);

    emitter.x = playerSpaceShip.x;
    emitter.y = playerSpaceShip.y + 50;
}

function particleBurst() {

    emitter.x = playerSpaceShip.x;
    emitter.y = playerSpaceShip.y + 50;
    emitter.setXSpeed(playerSpaceShip.body.velocity.x, playerSpaceShip.body.velocity.x);
    emitter.setYSpeed(playerSpaceShip.body.velocity.y + 150, playerSpaceShip.body.velocity.y + 150);
    //emitter.start(false, 2000, 750, 1, 20);
    emitter.on = true;

}

//function collectGem2(player, gem) {

//    gemSound.play();
//    gem.kill();
//}


function fireBullet() {

    if (game.time.now > bulletTime) {
        bullet = bullets.getFirstExists(false);

        if (bullet) {
            if (player.isFacingRight) {
                bullet.reset(playerGun.body.x + 6, playerGun.body.y - 8);
                bullet.body.velocity.x = 500;
                bullet.body.velocity.y = 0;
            }
            else {
                bullet.reset(playerGun.body.x - 20, playerGun.body.y - 8);
                bullet.body.velocity.x = -500;
                bullet.body.velocity.y = 0;
            }
            bulletTime = game.time.now + 150;
        }
    }

}

//  Called if the bullet goes out of the screen
function resetBullet(bullet) {

    bullet.kill();

}

////  Called if the bullet hits one of the veg sprites
//function collisionHandler(bullet, veg) {

//    bullet.kill();
//    veg.kill();

//}