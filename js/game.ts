/// <reference path = ”phaser.d.ts”/>

class MyGame {
    
    constructor() {
        //this.game = new Phaser.Game(800, 600, Phaser.AUTO, 'content', { preload: this.preload, create: this.create });
        this.game = new Phaser.Game(1280, 720, Phaser.CANVAS, 'phaser-example', { preload: this.preload, create: this.create, update: this.update, render: this.render });
    }
    
    game: Phaser.Game;
    
    map;
    tileset;
    //var layerNonpassable;

    layer01;
    layer02;
    layer03;
    layer04;
    layer05;
    layer06;
    layer07;

    players = ['alienBeige', 'alienBlue', 'alienGreen', 'alienPink', 'alienYellow'];
    selectedPlayerIndex = 0;

    gems;

    player;
    playerSpaceShip;
    cursors;
    playerGun;
    playerGunBullet;

    bullets;
    bulletTime = 0;

    enemy;
    enemies;

    enemyPhysics;
    enemiesPhysics;

    enemyNonGravity;
    enemiesNonGravity;

    enemySpawnPoints;
    spring;
    spring2;
    springs;

    tileKeyBlueKey = 141;
    tileKeyGemGreen = 142;
    tileKeyGemRed = 157;
    tileKeyGemYellow = 134;
    tileKeyGemBlue = 149;
    tileKeySpring = 266;


    worldScale = 1;

    playerDrawScale = 0.50;
    enemyDrawScale = 1;

    enemySpeed = 200;

    emitter;
    emitTime;

    isWorldLoaded = false;

    hudGroup;
    playerHudIcon;
    
    sky;
    jumpsound;
    gemSound;
    keySound;
    springSound;
    
    bullet;
        
    preload() {

        this.loadAudio();
        this.loadSprites();
        this.loadTilemap();
    }

    loadAudio() {
        //game.load.tilemap('mario', 'assets/tilemaps/maps/super_mario.json', null, Phaser.Tilemap.TILED_JSON);
        //game.load.image('tiles', 'assets/tilemaps/tiles/super_mario.png');
        //game.load.image('player', 'assets/sprites/phaser-dude.png');
        this.game.load.audio('jump', 'assets/audio/jump.wav');
        this.game.load.audio('gemSound', 'assets/audio/coin.wav');
        this.game.load.audio('key', 'assets/audio/key.wav');
        this.game.load.audio('springSound', 'assets/audio/spring.wav');
    }

    loadSprites() {

        // background image
        //game.load.image('sky', 'assets/sprites/backgrounds/bg_desert_x3.png');
        this.game.load.image('sky', 'assets/sprites/backgrounds/colored_grass.png');
        //game.load.image('sky', 'assets/sprites/backgrounds/blue_land.png');

        // spritesheets for game objects (not in the game map)
        this.game.load.atlasXML('playerSprites', 'assets/sprites/player/spritesheet_players.png', 'assets/sprites/player/spritesheet_players.xml');
        this.game.load.atlasXML('enemySprites', 'assets/sprites/enemies/enemies.png', 'assets/sprites/enemies/enemies.xml');
        this.game.load.atlasXML('tileObjectSprites', 'assets/sprites/objects/spritesheet_complete.png', 'assets/sprites/objects/spritesheet_complete.xml');
        this.game.load.atlasXML('alienShipSprites', 'assets/sprites/ships/spritesheet_spaceships.png', 'assets/sprites/ships/spritesheet_spaceships.xml');
        this.game.load.atlasXML('alienShipLaserSprites', 'assets/sprites/ships/spritesheet_lasers.png', 'assets/sprites/ships/spritesheet_lasers.xml');

        // initial placeholders for animated objects
        this.game.load.image('ghost', 'assets/sprites/enemies/ghost.png');
        this.game.load.image('piranha', 'assets/sprites/enemies/piranha.png');
        this.game.load.image('sprung', 'assets/sprites/objects/sprung64.png');
        this.game.load.image('engineExhaust', 'assets/sprites/ships/laserblue3.png');

        this.game.load.image('playerGun', 'assets/sprites/player/raygunPurpleBig.png');
        this.game.load.image('playerGunBullet', 'assets/sprites/player/laserPurpleDot.png');


    }

      loadTilemap() {
        // tilemap for level building
        this.game.load.tilemap('level1', 'assets/tilemaps/maps/world-01-02.json', null, Phaser.Tilemap.TILED_JSON);
        //game.load.tilemap('level1', 'assets/tilemaps/maps/world-00-overworld.json', null, Phaser.Tilemap.TILED_JSON);
        this.game.load.image('tiles', 'assets/tilemaps/tiles/spritesheet_tiles_64x64.png');
        this.game.load.image('items', 'assets/tilemaps/tiles/spritesheet_items_64x64.png');
        this.game.load.image('ground', 'assets/tilemaps/tiles/spritesheet_ground_64x64.png');
        this.game.load.image('platformerRequestTiles', 'assets/tilemaps/tiles/platformer-requests-sheet_64x64.png');
        this.game.load.image('enemyTiles', 'assets/tilemaps/tiles/spritesheet_enemies_64x64.png');
    }

      create() {

        this.game.physics.startSystem(Phaser.Physics.ARCADE);

        this.game.stage.backgroundColor = '#787878';

        this.sky = this.game.add.tileSprite(0, 0, 20480, 1024, 'sky');
        this.sky.fixedtoCamera = true;

        this.hudGroup = this.game.add.group();

        // http://www.html5gamedevs.com/topic/6380-moving-a-camera-fixed-sprite/
        this.playerHudIcon = this.game.add.image(0, 0, 'playerSprites', 'alienBlue_front.png');
        this.playerHudIcon.fixedToCamera = true;
        this.playerHudIcon.anchor.setTo(0, 0);
        
        //hudGroup.add(playerHudIcon);

        this.createWorld('level1');
    }

      createWorld(worldName) {

        this.map = this.game.add.tilemap(worldName);
        //map.addTilesetImage('sky', 'backgroundImageLayer');
        this.map.addTilesetImage('spritesheet_tiles_64x64', 'tiles');
        this.map.addTilesetImage('spritesheet_items_64x64', 'items');
        this.map.addTilesetImage('spritesheet_ground_64x64', 'ground');
        this.map.addTilesetImage('spritesheet_enemies_64x64', 'enemyTiles');
        this.map.addTilesetImage('platformer-requests-sheet_64x64', 'platformerRequestTiles');

        //map.setCollisionBetween(27, 29);
        //map.setCollision(40);
        ////  This will set Tile ID 26 (the coin) to call the hitCoin function  when collided with
        //map.setTileIndexCallback(26, hitCoin, this);
        ////  This will set the map location 2, 0 to call the function
        //map.setTileLocationCallback(2, 0, 1, 1, hitCoin, this);    

        // background image layer
        //bgtile = this.map.createLayer('backgroundImageLayer');
        //bgtile.scrollFactorX = 1.15;

        // background layer
        this.layer01 = this.map.createLayer('layer01-background-passable');
        this.layer01.alpha = 1.0;
        this.layer01.resizeWorld();

        // non-passable blocks layer
        this.layer02 = this.map.createLayer('layer02-nonpassable');
        this.layer02.alpha = 1.0;
        //map.setCollisionBetween(0, 133, true, layer02, true);
        this.map.setCollisionBetween(0, 2000, true, this.layer02, true);
        //map.setCollisionBetween(158, 400, true, layer02, true);

        this.layer02.resizeWorld();
        //map.setCollision();

        //  Un-comment this on to see the collision tiles
        //layer.debug = true;
        //layer2.debug = true;

        // add player between background and foreground layers

        this.createSpaceShip();

        this.createPlayer();


        //---------------------------------------------------------------------------------------------------
        // ENEMIES
        //---------------------------------------------------------------------------------------------------
        this.layer07 = this.map.createLayer('layer07-enemies');
        this.layer07.alpha = 0.1;
        this.enemies = this.game.add.group();

        this.enemiesPhysics = this.game.add.group();  // removed 324
        this.map.createFromTiles([297, 290, 322, 300, 380, 337, 395, 299, 323, 330, 353, 347, 371], null, 'ghost', 'layer07-enemies', this.enemiesPhysics, this.enemyPhysics);

        this.enemiesNonGravity = this.game.add.group();
        this.map.createFromTiles([324], null, 'piranha', 'layer07-enemies', this.enemiesNonGravity, this.enemyNonGravity);

        this.layer07.resizeWorld();

        this.game.physics.enable(this.enemiesNonGravity);
        this.enemiesNonGravity.forEach(function (enemy) {
            enemy.enemyType = "nonGravity";
            enemy.movementTime = 0;

            enemy.enableBody = true;
            enemy.body.allowGravity = false;
            enemy.body.velocity.y = 150;
            enemy.body.collideWorldBounds = false;
            enemy.isFacingRight = true;
        }, this);
        this.enemies.add(this.enemiesNonGravity);

        this.game.physics.enable(this.enemiesPhysics);
        this.enemiesPhysics.forEach(function (enemy) {
            enemy.enemyType = "physics";
            enemy.enableBody = true;
            enemy.body.collideWorldBounds = true;
            enemy.isFacingRight = true;
        }, this);
        this.enemies.add(this.enemiesPhysics);
        //enemies.enableBody = true;F
        //enemies.body.collideWorldBounds = true;    

        //---------------------------------------------------------------------------------------------------
        // COLLECTIBLES
        //---------------------------------------------------------------------------------------------------
        this.layer05 = this.map.createLayer('layer05-collectibles');
        this.layer05.alpha = 1.0;//0.75;
        //map.setCollisionBetween(0, 400, true, layer05, true);

        // gem stuff... http://phaser.io/examples/v2/tilemaps/tile-callbacks
        this.map.setCollision(this.tileKeyGemRed, true, this.layer05, true);
        this.map.setCollision(this.tileKeyGemGreen, true, this.layer05, true);
        this.map.setCollision(this.tileKeyGemYellow, true, this.layer05, true);
        this.map.setCollision(this.tileKeyGemBlue, true, this.layer05, true);

        this.map.setTileIndexCallback(this.tileKeyGemRed, this.collectGem, this, this.layer05);
        this.map.setTileIndexCallback(this.tileKeyGemGreen, this.collectGem, this, this.layer05);
        this.map.setTileIndexCallback(this.tileKeyGemYellow, this.collectGem, this, this.layer05);
        this.map.setTileIndexCallback(this.tileKeyGemBlue, this.collectGem, this, this.layer05);

        // key
        this.map.setCollision(this.tileKeyBlueKey, true, this.layer05, true);
        this.map.setTileIndexCallback(this.tileKeyBlueKey, this.collectKey, this, this.layer05);

        // green flag no wind: 146
        this.layer05.resizeWorld();


        //---------------------------------------------------------------------------------------------------
        // GAMEOBJECTS
        //---------------------------------------------------------------------------------------------------
        this.layer06 = this.map.createLayer('layer06-gameobjects');
        this.layer06.alpha = 0.0;//0.75;
        //map.setCollisionBetween(0, 400, true, layer05, true);

        // green flag no wind: 146

        this.springs = this.game.add.group();
        
        this.map.setCollision(this.tileKeySpring, true, this.layer06, true);

        this.map.createFromTiles(this.tileKeySpring, null, 'tileObjectSprites', 'layer06-gameobjects', this.springs, this.spring);
        this.layer06.resizeWorld();

        this.game.physics.enable(this.springs);
        this.springs.forEach(function (item) {        
            item.enableBody = true;
            item.immovable = true;
            item.body.moves = false;
            item.scale.setTo(0.5, 0.5);
            item.anchor.setTo(0, 0);
        }, this);

        this.springs.callAll('animations.add', 'animations', 'springAnimation', Phaser.Animation.generateFrameNames('spring', 0, 1, '.png'), 2, true, false);
        this.springs.callAll('play', null, 'springAnimation');
        
        //---------------------------------------------------------------------------------------------------
        // foreground semi-transparent layer (water, lava, clouds, etc.)
        //---------------------------------------------------------------------------------------------------
        this.layer03 = this.map.createLayer('layer03-foreground-passable-semitransparent');
        this.layer03.alpha = 0.5;
        this.layer03.resizeWorld();

        //---------------------------------------------------------------------------------------------------
        // FOREGROUND PASSABLE OPAQUE LAYER
        //---------------------------------------------------------------------------------------------------
        this.layer04 = this.map.createLayer('layer04-foreground-passable-opaque');
        this.layer04.alpha = 1.0;
        this.layer04.resizeWorld();

        // TODO: add HUD stuff here

        // input
        this.cursors = this.game.input.keyboard.createCursorKeys();

        // audio
        this.jumpsound = this.game.add.audio('jump');
        this.gemSound = this.game.add.audio('gemSound');
        this.keySound = this.game.add.audio('key');
        this.springSound = this.game.add.audio('springSound');
        this.springSound.allowMultiple = false;

        this.bullets = this.game.add.group();
        this.game.physics.enable(this.bullets);
        this.bullets.enableBody = true;
        this.bullets.allowGravity = false;

        for (var i = 0; i < 200; i++) {
            var b = this.bullets.create(0, 0, 'playerGunBullet');
            b.name = 'bullet' + i;
            b.exists = false;
            b.visible = false;
            b.checkWorldBounds = true;
            b.body.gravity.y = 0;
            b.body.collideWorldBounds = true;
            b.events.onOutOfBounds.add(this.resetBullet, this);
        }
        this.isWorldLoaded = true;
    }

    update() {
        if (this.isWorldLoaded)
        {
            this.sky.tilePosition.x = -(this.game.camera.x * 0.25);
            this.sky.tilePosition.y = -(this.game.camera.y * 0.05) + 250;

            this.emitTime++;

            this.updatePhysics();
            this.updatePlayer();
            this.updateBullets();
            this.processInput();

            this.updateEnemies();

            this.updateHud();
        }
    }

    updatePhysics() {

        if (!this.player.isInSpaceShip) {
            this.game.physics.arcade.collide(this.player, this.layer02);
            this.game.physics.arcade.collide(this.player, this.layer05);
            this.game.physics.arcade.collide(this.player, this.springs, this.playerTouchingSpringHandler, null, this);

            this.game.physics.arcade.collide(this.playerSpaceShip, this.player, this.playerEnteringSpaceshipCollisionHandler, null, this);

            this.game.physics.arcade.collide(this.player, this.enemiesPhysics);
            this.game.physics.arcade.collide(this.player, this.enemiesNonGravity);
        }
        else {
            this.game.physics.arcade.collide(this.playerSpaceShip, this.layer02);
            this.game.physics.arcade.collide(this.playerSpaceShip, this.layer05);

            this.game.physics.arcade.collide(this.playerSpaceShip, this.enemiesPhysics);
            this.game.physics.arcade.collide(this.playerSpaceShip, this.enemiesNonGravity);
        }        

        this.game.physics.arcade.collide(this.enemiesPhysics, this.layer02);
        this.game.physics.arcade.collide(this.enemiesPhysics, this.enemiesPhysics);
    }

    playerEnteringSpaceshipCollisionHandler(playerSpaceShip, player) {
        if (player.renderable) {
            
            player.isInSpaceShip = true;
            //particleBurst();
            this.emitter.start(false, 1000, 100, 0);
        }
    }

    playerTouchingSpringHandler(player, springs) {

        if (!player.isInSpaceShip) {
            //if(springSound.)
            //if (tile.alpha > 0) {
            player.body.velocity.y = -650;
            this.springSound.play();
        }
    }

    playerExitingSpaceship() {
        this.player.isInSpaceShip = false;
        this.player.body.velocity.y = -400;
        this.player.body.x = this.playerSpaceShip.body.x +50;
        this.player.renderable = true;
        this.playerSpaceShip.body.velocity.x = 0;
        this.playerSpaceShip.body.velocity.y = 0;
        this.playerSpaceShip.frameName = "shipBeige.png"; //players[selectedPlayerIndex] + "_stand.png";

        this.emitter.on = false;
    }

    updatePlayer() {

        if (!this.player.isInSpaceShip)
        {
            this.player.body.velocity.x = 0;

            if (this.cursors.up.isDown || this.game.input.keyboard.isDown(Phaser.Keyboard.W) || this.game.input.keyboard.isDown(Phaser.Keyboard.SPACEBAR)) {
                if (this.player.body.onFloor()) {
                    this.player.body.velocity.y = -500;
                    this.jumpsound.play();
                }
            }

            if (this.cursors.left.isDown || this.game.input.keyboard.isDown(Phaser.Keyboard.A)) {

                this.player.isFacingRight = false;

                //player.body.velocity.x = -150;
                this.player.body.velocity.x = -200;
                this.player.anchor.setTo(.5, .5);
                this.player.scale.x = -this.playerDrawScale;
                this.player.scale.y = this.playerDrawScale
                this.player.animations.play(this.players[this.selectedPlayerIndex] + 'walk');

                this.playerGun.scale.x = -0.8;
                this.playerGun.scale.y = 0.8;
                this.playerGun.anchor.setTo(.5, .5);
                this.playerGun.body.x = this.player.body.x - 45;

                this.playerGun.body.y = this.player.body.y - 22;
            }
            else if (this.cursors.right.isDown || this.game.input.keyboard.isDown(Phaser.Keyboard.D)) {

                this.player.isFacingRight = true;

                //player.body.velocity.x = 150;
                this.player.body.velocity.x = 200;
                this.player.anchor.setTo(.5, .5);
                this.player.scale.x = this.playerDrawScale;
                this.player.scale.y = this.playerDrawScale;
                this.player.animations.play(this.players[this.selectedPlayerIndex] + 'walk');

                this.playerGun.scale.x = 0.8;
                this.playerGun.scale.y = 0.8;
                this.playerGun.anchor.setTo(.5, .5);
                this.playerGun.body.x = this.player.body.x + 20;

                this.playerGun.body.y = this.player.body.y - 22;
            }
            else if (this.cursors.down.isDown || this.game.input.keyboard.isDown(Phaser.Keyboard.S)) {
                if (this.player.body.onFloor()) {
                    this.player.frameName = this.players[this.selectedPlayerIndex] + "_duck.png";

                    this.playerGun.body.y = this.player.body.y - 10;
                }
            }
            else {
                //  Stand still
                this.player.animations.stop();
                this.player.frameName = this.players[this.selectedPlayerIndex] + "_stand.png";
                //player.frame = 4;\

                this.playerGun.body.y = this.player.body.y - 22;
            }

            if (this.player.body.onFloor()) {
                //player.frameName = "alienBeige_duck.png";
            }
            else {
                this.player.frameName = this.players[this.selectedPlayerIndex] + "_jump.png";
            }


            if (this.game.input.keyboard.isDown(Phaser.Keyboard.CONTROL)) {
                this.fireBullet();
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



            if (this.player.isFacingRight) {
        
            }
            if (!this.player.isFacingRight) {

                
            }
        }
        else
        {
            //if (emitTime > 40) {
                //emitTime = 0;
                this.particleBurst();
            //}
            this.playerSpaceShip.body.velocity.x = 0;
            this.playerSpaceShip.body.velocity.y = 0;

            this.player.body.x = this.playerSpaceShip.body.x;
            this.player.body.y = this.playerSpaceShip.body.y;
            this.player.renderable = false;

            this.playerSpaceShip.frameName = "shipBeige_manned.png"; //players[selectedPlayerIndex] + "_stand.png";
            if (this.cursors.up.isDown || this.game.input.keyboard.isDown(Phaser.Keyboard.W) || this.game.input.keyboard.isDown(Phaser.Keyboard.SPACEBAR)) {
                this.playerSpaceShip.body.velocity.y = -300;
                this.playerSpaceShip.anchor.setTo(.5, .5);
                //particleBurst();
            }
            else if (this.cursors.down.isDown || this.game.input.keyboard.isDown(Phaser.Keyboard.S)) {
                this.playerSpaceShip.body.velocity.y = 300;
                this.playerSpaceShip.anchor.setTo(.5, .5);
                //particleBurst();
            }

            if (this.cursors.left.isDown || this.game.input.keyboard.isDown(Phaser.Keyboard.A)) {
                this.playerSpaceShip.body.velocity.x = -300;
                this.playerSpaceShip.anchor.setTo(.5, .5);
                //particleBurst();
            }
            else if (this.cursors.right.isDown || this.game.input.keyboard.isDown(Phaser.Keyboard.D)) {
                this.playerSpaceShip.body.velocity.x = 300;
                this.playerSpaceShip.anchor.setTo(.5, .5);
                //particleBurst();
            }        
            else {
                //playerSpaceShip.body.velocity *= 0.5;
                //  Stand still
                //player.frameName = players[selectedPlayerIndex] + "_stand.png";
                //player.frame = 4;
            }

            if (this.game.input.keyboard.isDown(Phaser.Keyboard.E)) {

                this.playerExitingSpaceship();

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

    updateBullets() {

        this.bullets.forEach(function (bullet) {
            bullet.body.velocity.y = 0;
        }, this);
    }

    processInput() {

        if (this.game.input.keyboard.isDown(Phaser.Keyboard.NUMPAD_0)) {
            this.selectedPlayerIndex = 0;
        }
        if (this.game.input.keyboard.isDown(Phaser.Keyboard.NUMPAD_1)) {
            this.selectedPlayerIndex = 1;
        }
        if (this.game.input.keyboard.isDown(Phaser.Keyboard.NUMPAD_2)) {
            this.selectedPlayerIndex = 2;
        }
        if (this.game.input.keyboard.isDown(Phaser.Keyboard.NUMPAD_3)) {
            this.selectedPlayerIndex = 3;
        }
        if (this.game.input.keyboard.isDown(Phaser.Keyboard.NUMPAD_4)) {
            this.selectedPlayerIndex = 4;
        }

        // zoom
        if (this.game.input.keyboard.isDown(Phaser.Keyboard.Q)) {
            this.worldScale += 0.05;
        }
        else if (this.game.input.keyboard.isDown(Phaser.Keyboard.Z)) {
            this.worldScale -= 0.05;
        }

        // set a minimum and maximum scale value
        this.worldScale = Phaser.Math.clamp(this.worldScale, 0.25, 2);

        // set our world scale as needed
        this.game.world.scale.set(this.worldScale);
    }

    updateEnemies(){

        this.enemiesPhysics.forEach(function (enemy) {
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

                enemy.scale.x = -this.enemyDrawScale;
                enemy.anchor.setTo(.5, .5);
                enemy.body.velocity.x = this.enemySpeed;
            }
            if (!enemy.isFacingRight) {

                enemy.body.velocity.x = -this.enemySpeed;
                enemy.anchor.setTo(.5, .5);
                enemy.scale.x = this.enemyDrawScale;
            }        
        }, this);

        this.enemiesNonGravity.forEach(function (enemy) {
            enemy.movementTime++;
            if (enemy.movementTime > 60) {
                enemy.movementTime = 0;
                enemy.body.velocity.y *= -1;
                if(enemy.body.velocity.y > 0)
                {
                    enemy.anchor.setTo(.5, .5);
                    enemy.scale.y = -this.enemyDrawScale;
                }
                else
                {
                    enemy.anchor.setTo(.5, .5);
                    enemy.scale.y = this.enemyDrawScale;
                }
            }
            //enemy.y += enemy.body.velocity;
        }, this);
    }

    updateHud() {
        //hudGroup.bringToTop();
        this.playerHudIcon.bringToTop();
    }

    render() {

        // game.debug.body(p);
        //game.debug.bodyInfo(player, 32, 320);

    }

    collectGem(sprite, tile) {

        if (tile.alpha > 0) {
            this.gemSound.play();

            //map.removeTile(tile.x, tile.y);

            tile.alpha = 0;
            tile.collideUp = false;
            tile.collideDown = false;
            tile.collideLeft = false;
            tile.collideRight = false;
            this.layer05.dirty = true;
            this.map.dirty = true;
            this.map.setLayer(this.layer05);
        }
        return false;
    }

    collectKey(sprite, tile) {

        if (tile.alpha > 0) {
            this.keySound.play();

            //map.removeTile(tile.x, tile.y);

            tile.alpha = 0;
            tile.collideUp = false;
            tile.collideDown = false;
            tile.collideLeft = false;
            tile.collideRight = false;
            this.layer05.dirty = true;
            this.map.dirty = true;
            this.map.setLayer(this.layer05);
        }
        return false;
    }

    createPlayer() {

        this.player = this.game.add.sprite(64, 64, 'playerSprites', 'alienBlue_front.png');
        this.player.scale.setTo(this.playerDrawScale, this.playerDrawScale);
        this.player.anchor.setTo(.5, .5);

        for (var i = 0; i < this.players.length; i++) {
            this.player.animations.add(this.players[i] + 'walk', Phaser.Animation.generateFrameNames(this.players[i] + '_walk', 1, 2, '.png'), 10);
            this.player.animations.add(this.players[i] + 'swim', Phaser.Animation.generateFrameNames(this.players[i] + + '_swim', 1, 2, '.png'), 10);
            this.player.animations.add(this.players[i] + 'climb', Phaser.Animation.generateFrameNames(this.players[i] + '_climb', 1, 2, '.png'), 10);
        }

        this.game.physics.enable(this.player);
        this.game.physics.arcade.gravity.y = 600;
        this.player.body.setSize(64, 64, 0, 47);
        this.player.body.bounce.y = 0.05;
        this.player.body.linearDamping = 1;
        this.player.body.collideWorldBounds = true;

        this.player.frameName = this.players[this.selectedPlayerIndex] + "_stand.png";

        this.player.isInSpaceShip = false;

        this.player.isFacingRight = true;

        this.playerGun = this.game.add.sprite(64, 64, 'playerGun', 'playerGun');
        this.playerGun.anchor.setTo(0.5, 0.5);

        this.game.physics.enable(this.playerGun);

        this.game.camera.follow(this.player);
    }

    createSpaceShip()
    {
        this.playerSpaceShip = this.game.add.sprite(400, 800, 'alienShipSprites', 'shipBeige.png');
        this.game.physics.enable(this.playerSpaceShip);
        this.playerSpaceShip.body.collideWorldBounds = true;
        this.playerSpaceShip.enableBody = true;
        this.playerSpaceShip.body.allowGravity = false;

        this.createSpaceShipExhaustEmitter();
    }

    createSpaceShipExhaustEmitter()
    {
        this.emitter = this.game.add.emitter(this.playerSpaceShip.body.x, this.playerSpaceShip.body.y, 200);

        this.emitter.makeParticles('engineExhaust');
        this.emitter.minRotation = 0;
        this.emitter.maxRotation = 0;
        //emitter.gravity = 150;
        this.emitter.setAlpha(1, 0, 1250);
        this.emitter.setXSpeed(0, 0);
        this.emitter.setYSpeed(100, 150);
        //emitter.bounce.setTo(0.5, 0.5);
        this.emitter.setScale(0.1, 1, 0.25, 0.25, 1000, Phaser.Easing.Quintic.Out);

        this.emitter.x = this.playerSpaceShip.x;
        this.emitter.y = this.playerSpaceShip.y + 50;
    }

    particleBurst() {

        this.emitter.x = this.playerSpaceShip.x;
        this.emitter.y = this.playerSpaceShip.y + 50;
        this.emitter.setXSpeed(this.playerSpaceShip.body.velocity.x, this.playerSpaceShip.body.velocity.x);
        this.emitter.setYSpeed(this.playerSpaceShip.body.velocity.y + 150, this.playerSpaceShip.body.velocity.y + 150);
        //emitter.start(false, 2000, 750, 1, 20);
        this.emitter.on = true;

    }

    //function collectGem2(player, gem) {

    //    gemSound.play();
    //    gem.kill();
    //}


    fireBullet() {

        if (this.game.time.now > this.bulletTime) {
            this.bullet = this.bullets.getFirstExists(false);

            if (this.bullet) {
                if (this.player.isFacingRight) {
                    this.bullet.reset(this.playerGun.body.x + 6, this.playerGun.body.y - 8);
                    this.bullet.body.velocity.x = 500;
                    this.bullet.body.velocity.y = 0;
                }
                else {
                    this.bullet.reset(this.playerGun.body.x - 20, this.playerGun.body.y - 8);
                    this.bullet.body.velocity.x = -500;
                    this.bullet.body.velocity.y = 0;
                }
                this.bulletTime = this.game.time.now + 150;
            }
        }

    }

    //  Called if the bullet goes out of the screen
    resetBullet(bullet) {

        bullet.kill();

    }

    ////  Called if the bullet hits one of the veg sprites
    //function collisionHandler(bullet, veg) {

    //    bullet.kill();
    //    veg.kill();

    //}
}

window.onload = () => {
    var game = new MyGame();
}