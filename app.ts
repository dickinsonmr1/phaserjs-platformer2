﻿/// <reference path="phaser.d.ts" />

class Constants {
    public static get tileKeyBlueKey(): number { return 141; }
    public static get tileKeyGemGreen(): number { return 142; }
    public static get tileKeyGemRed(): number { return 157; }
    public static get tileKeyGemYellow(): number { return 134; }
    public static get tileKeyGemBlue(): number { return 149; }
    public static get tileKeySpring(): number { return 266; }
}

class MyGame {
    
    constructor() {
        //this.game = new Phaser.Game(800, 600, Phaser.AUTO, 'content', { preload: this.preload, create: this.create });
        this.game = new Phaser.Game(1280, 720, Phaser.CANVAS, 'phaser-platformer', { preload: this.preload, create: this.create, update: this.update, render: this.render });
    }
    
    game: Phaser.Game;
    
    // map stuff
    map;
    tileset;
    layer01;
    layer02;
    layer03;
    layer04;
    layer05;
    layer06;
    layer07;
    sky;
        
    // player selection
    playerPrefixes = ['alienBeige', 'alienBlue', 'alienGreen', 'alienPink', 'alienYellow'];
    selectedPlayerIndex = 0;
    
    // player stuff
    player; // player instance
    playerSpaceShip;
    
    playerGun;
    //playerGunBullet;
    bullet;
    bullets;
    bulletTime = 0;
    bulletDrawOffsetX = 6;
    bulletDrawOffsetY = 8;

    // input
    cursors;

    // enemy stuff
    enemy;
    enemies;
    enemiesPhysics;
    enemiesNonGravity;

    // world stuff
    //spring;
    springs;    
    //gems;

    // display stuff
    playerDrawScale = 0.50;
    enemyDrawScale = 1;
    worldScale = 1;
    
    enemySpeed = 200;

    // particles
    emitter;
    emitTime;

    // initialization stuff
    isWorldLoaded = false;

    // HUD
    hudGroup;
    playerHudIcon;
    
    // audio
    jumpsound;
    gemSound;
    keySound;
    springSound;
                
    preload = () => {
        this.loadAudio(this.game);
        this.loadSprites(this.game);
        this.loadTilemap(this.game);
    }

    loadAudio = (game) => {
        //game.load.tilemap('mario', 'assets/tilemaps/maps/super_mario.json', null, Phaser.Tilemap.TILED_JSON);
        //game.load.image('tiles', 'assets/tilemaps/tiles/super_mario.png');
        //game.load.image('player', 'assets/sprites/phaser-dude.png');
        game.load.audio('jump', 'assets/audio/jump.wav');
        game.load.audio('gemSound', 'assets/audio/coin.wav');
        game.load.audio('key', 'assets/audio/key.wav');
        game.load.audio('springSound', 'assets/audio/spring.wav');
    }

    loadSprites = (game) =>  {
        // background image
        //this.game.load.image('sky', 'assets/sprites/backgrounds/bg_desert_x3.png');
        game.load.image('sky', 'assets/sprites/backgrounds/colored_grass.png');
        //game.load.image('sky', 'assets/sprites/backgrounds/blue_land.png');

        // spritesheets for game objects (not in the game map)
        game.load.atlasXML('enemySprites', 'assets/sprites/enemies/enemies.png', 'assets/sprites/enemies/enemies.xml');
        game.load.atlasXML('tileObjectSprites', 'assets/sprites/objects/spritesheet_complete.png', 'assets/sprites/objects/spritesheet_complete.xml');
        game.load.atlasXML('playerSprites', 'assets/sprites/player/spritesheet_players.png', 'assets/sprites/player/spritesheet_players.xml');
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

    loadTilemap = (game) =>  {
        // tilemap for level building
        game.load.tilemap('level1', 'assets/tilemaps/maps/world-01-02.json', null, Phaser.Tilemap.TILED_JSON);
        //this.game.load.tilemap('level1', 'assets/tilemaps/maps/world-00-overworld.json', null, Phaser.Tilemap.TILED_JSON);
        game.load.image('tiles', 'assets/tilemaps/tiles/spritesheet_tiles_64x64.png');
        game.load.image('items', 'assets/tilemaps/tiles/spritesheet_items_64x64.png');
        game.load.image('ground', 'assets/tilemaps/tiles/spritesheet_ground_64x64.png');
        game.load.image('platformerRequestTiles', 'assets/tilemaps/tiles/platformer-requests-sheet_64x64.png');
        game.load.image('enemyTiles', 'assets/tilemaps/tiles/spritesheet_enemies_64x64.png');
    }

    create = () =>  {
        this.game.physics.startSystem(Phaser.Physics.ARCADE);

        this.game.stage.backgroundColor = '#787878';

        var logo = this.game.add.sprite(this.game.world.centerX, this.game.world.centerY, 'logo.png');
        logo.anchor.setTo(0.5, 0.5);

        this.sky = this.game.add.tileSprite(0, 0, 20480, 1024, 'sky');
        this.sky.fixedtoCamera = true;

        this.hudGroup = this.game.add.group();

        // http://www.html5gamedevs.com/topic/6380-moving-a-camera-fixed-sprite/
        this.playerHudIcon = this.game.add.image(0, 0, 'playerSprites', 'alienBlue_front.png');
        this.playerHudIcon.fixedToCamera = true;
        this.playerHudIcon.anchor.setTo(0, 0);
        
        //hudGroup.add(playerHudIcon);

        this.createWorld('level1', this.game, this.enemies);

        // input
        this.cursors = this.game.input.keyboard.createCursorKeys();

        this.createAudio(this.game);       
    }

    createAudio = (game) => {
        this.jumpsound = game.add.audio('jump');
        this.gemSound = game.add.audio('gemSound');
        this.keySound = game.add.audio('key');
        this.springSound = game.add.audio('springSound');
        this.springSound.allowMultiple = false;
    }
    
    createWorld = (worldName, game, enemies) => {

        // using the Tiled map editor, here is the order of the layers from back to front:
        
        // layer00-image (not currently used)
        // layer01-background-passable
        // layer02-nonpassable        
        // (player spaceship)
        // (player)
        // layer07-enemies 
        // layer05-collectibles
        // layer03-foreground-passable-semitransparent
            // like water... one idea is to make this automatically move
        // layer06-gameobjects        
        // layer04-foreground-passable-opaque
        
        this.map = game.add.tilemap(worldName);
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

        this.playerSpaceShip = this.createSpaceShip(this.game);

        this.createPlayer(this.player, this.playerGun);

        //---------------------------------------------------------------------------------------------------
        // ENEMIES
        //---------------------------------------------------------------------------------------------------
        this.layer07 = this.map.createLayer('layer07-enemies');
        this.layer07.alpha = 0.1;
        enemies = game.add.group();

        this.enemiesPhysics = game.add.group();  // removed 324
        this.map.createFromTiles([297, 290, 322, 300, 380, 337, 395, 299, 323, 330, 353, 347, 371], null, 'ghost', 'layer07-enemies', this.enemiesPhysics);//, this.enemyPhysics);

        var enemiesNonGravity = game.add.group();
        this.map.createFromTiles([324], null, 'piranha', 'layer07-enemies', enemiesNonGravity);//, this.enemyNonGravity);

        this.layer07.resizeWorld();

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

        game.physics.enable(this.enemiesPhysics);
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
        this.map.setCollision(Constants.tileKeyGemRed, true, this.layer05, true);
        this.map.setCollision(Constants.tileKeyGemGreen, true, this.layer05, true);
        this.map.setCollision(Constants.tileKeyGemYellow, true, this.layer05, true);
        this.map.setCollision(Constants.tileKeyGemBlue, true, this.layer05, true);

        this.map.setTileIndexCallback(Constants.tileKeyGemRed, this.collectGem, this, this.layer05);
        this.map.setTileIndexCallback(Constants.tileKeyGemGreen, this.collectGem, this, this.layer05);
        this.map.setTileIndexCallback(Constants.tileKeyGemYellow, this.collectGem, this, this.layer05);
        this.map.setTileIndexCallback(Constants.tileKeyGemBlue, this.collectGem, this, this.layer05);

        // key
        this.map.setCollision(Constants.tileKeyBlueKey, true, this.layer05, true);
        this.map.setTileIndexCallback(Constants.tileKeyBlueKey, this.collectKey, this, this.layer05);

        // green flag no wind: 146
        this.layer05.resizeWorld();

        //---------------------------------------------------------------------------------------------------
        // GAMEOBJECTS
        //---------------------------------------------------------------------------------------------------
        this.layer06 = this.map.createLayer('layer06-gameobjects');
        this.layer06.alpha = 0.0;//0.75;
        //map.setCollisionBetween(0, 400, true, layer05, true);

        this.springs = game.add.group();        
        this.map.setCollision(Constants.tileKeySpring, true, this.layer06, true);

        this.map.createFromTiles(Constants.tileKeySpring, null, 'tileObjectSprites', 'layer06-gameobjects', this.springs);//, this.spring);
        this.layer06.resizeWorld();

        game.physics.enable(this.springs);
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
        // FOREGROUND PASSABLE OPAQUE LAYER (front wall of a cave, plant, etc.)
        //---------------------------------------------------------------------------------------------------
        this.layer04 = this.map.createLayer('layer04-foreground-passable-opaque');
        this.layer04.alpha = 1.0;
        this.layer04.resizeWorld();

        // TODO: add HUD stuff here

        this.bullets = game.add.group();
        game.physics.enable(this.bullets);
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

    update = () =>  {
        if (this.isWorldLoaded)
        {
            this.sky.tilePosition.x = -(this.game.camera.x * 0.25);
            this.sky.tilePosition.y = -(this.game.camera.y * 0.05) + 250;

            this.emitTime++;

            this.updatePhysics(this.player, this.enemies, this.game.physics);
            this.updatePlayer(this.player, this.playerGun, this.playerSpaceShip, this.game.input.keyboard, this.cursors);
            this.updateBullets(this.bullets);
            this.processInput(this.game.input);

            this.updateEnemies(this.enemiesPhysics);

            this.updateHud(this.playerHudIcon);
        }
    }

    updatePhysics = (player, enemies, physics) => {
        
        if (!player.isInSpaceShip) {
            physics.arcade.collide(player, this.layer02);
            physics.arcade.collide(player, this.layer05);
            if(!physics.arcade.collide(player, this.springs, this.playerTouchingSpringHandler, null, this)) {
                player.isCurrentlyTouchingSpring = false;
            }

            physics.arcade.collide(this.playerSpaceShip, player, this.playerEnteringSpaceshipCollisionHandler, null, this);

            physics.arcade.collide(player, enemies);
        }
        else {
            physics.arcade.collide(this.playerSpaceShip, this.layer02);
            physics.arcade.collide(this.playerSpaceShip, this.layer05);

            physics.arcade.collide(this.playerSpaceShip, enemies);
        }        

        var enemiesPhysics = enemies.filter(x => x.enemyType == "physics");
        physics.arcade.collide(enemiesPhysics, this.layer02);
        physics.arcade.collide(enemiesPhysics, enemiesPhysics);
    }

    playerEnteringSpaceshipCollisionHandler = (playerSpaceShip, player) => {
        if (player.renderable) {
            
            player.isInSpaceShip = true;
            //particleBurst();
            this.emitter.start(false, 1000, 100, 0);
        }
    }

    playerTouchingSpringHandler = (player, springs) => {

        if (!player.isInSpaceShip && !player.isCurrentlyTouchingSpring) {
            //if(springSound.)
            //if (tile.alpha > 0) {
            player.body.velocity.y = -650;
            this.springSound.play();
            player.isCurrentlyTouchingSpring = true;
        }
    }

    playerExitingSpaceship = (player, playerSpaceShip) => {
        player.isInSpaceShip = false;
        player.body.velocity.y = -400;
        player.body.x = playerSpaceShip.body.x +50;
        player.renderable = true;
        playerSpaceShip.body.velocity.x = 0;
        playerSpaceShip.body.velocity.y = 0;
        playerSpaceShip.frameName = "shipBeige.png"; //players[selectedPlayerIndex] + "_stand.png";

        this.emitter.on = false;
    }

    updatePlayer = (player, playerGun, playerSpaceShip, keyboard, cursors) => {

        if (!player.isInSpaceShip)
        {
            player.body.velocity.x = 0;

            if (cursors.up.isDown || keyboard.isDown(Phaser.Keyboard.W) || keyboard.isDown(Phaser.Keyboard.SPACEBAR)) {
                if (player.body.onFloor()) {
                    player.body.velocity.y = -500;
                    this.jumpsound.play();
                }
            }

            if (cursors.left.isDown || keyboard.isDown(Phaser.Keyboard.A)) {

                player.isFacingRight = false;

                //player.body.velocity.x = -150;
                player.body.velocity.x = -200;
                player.anchor.setTo(.5, .5);
                player.scale.x = -this.playerDrawScale;
                player.scale.y = this.playerDrawScale
                player.animations.play(this.playerPrefixes[this.selectedPlayerIndex] + 'walk');

                playerGun.scale.x = -0.8;
                playerGun.scale.y = 0.8;
                playerGun.anchor.setTo(.5, .5);
                playerGun.body.x = player.body.x - 45;

                playerGun.body.y = player.body.y - 22;
            }
            else if (cursors.right.isDown || keyboard.isDown(Phaser.Keyboard.D)) {

                player.isFacingRight = true;

                //player.body.velocity.x = 150;
                player.body.velocity.x = 200;
                player.anchor.setTo(.5, .5);
                player.scale.x = this.playerDrawScale;
                player.scale.y = this.playerDrawScale;
                player.animations.play(this.playerPrefixes[this.selectedPlayerIndex] + 'walk');

                playerGun.scale.x = 0.8;
                playerGun.scale.y = 0.8;
                playerGun.anchor.setTo(.5, .5);
                playerGun.body.x = player.body.x + 20;

                playerGun.body.y = player.body.y - 22;
            }
            else if (cursors.down.isDown || keyboard.isDown(Phaser.Keyboard.S)) {
                if (player.body.onFloor()) {
                    player.frameName = this.playerPrefixes[this.selectedPlayerIndex] + "_duck.png";

                    playerGun.body.y = player.body.y - 10;
                }
            }
            else {
                //  Stand still
                player.animations.stop();
                player.frameName = this.playerPrefixes[this.selectedPlayerIndex] + "_stand.png";
                //player.frame = 4;\

                playerGun.body.y = player.body.y - 22;
            }

            if (player.body.onFloor()) {
                //player.frameName = "alienBeige_duck.png";
            }
            else {
                player.frameName = this.playerPrefixes[this.selectedPlayerIndex] + "_jump.png";
            }

            if (keyboard.isDown(Phaser.Keyboard.CONTROL)) {
                if(this.bulletIntervalElapsed(this.game.time.now, this.bulletTime)) {
                    this.fireBullet(this.bullets.getFirstExists(false));
                }                
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
                this.particleBurst();
            //}
            playerSpaceShip.body.velocity.x = 0;
            playerSpaceShip.body.velocity.y = 0;

            player.body.x = playerSpaceShip.body.x;
            player.body.y = playerSpaceShip.body.y;
            player.renderable = false;

            playerSpaceShip.frameName = "shipBeige_manned.png"; //players[selectedPlayerIndex] + "_stand.png";
            if (cursors.up.isDown || keyboard.isDown(Phaser.Keyboard.W) || keyboard.isDown(Phaser.Keyboard.SPACEBAR)) {
                playerSpaceShip.body.velocity.y = -300;
                playerSpaceShip.anchor.setTo(.5, .5);
                //particleBurst();
            }
            else if (cursors.down.isDown || keyboard.isDown(Phaser.Keyboard.S)) {
                playerSpaceShip.body.velocity.y = 300;
                playerSpaceShip.anchor.setTo(.5, .5);
                //particleBurst();
            }

            if (cursors.left.isDown || keyboard.isDown(Phaser.Keyboard.A)) {
                playerSpaceShip.body.velocity.x = -300;
                playerSpaceShip.anchor.setTo(.5, .5);
                //particleBurst();
            }
            else if (cursors.right.isDown || keyboard.isDown(Phaser.Keyboard.D)) {
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

            if (keyboard.isDown(Phaser.Keyboard.E)) {

                this.playerExitingSpaceship(player, playerSpaceShip);

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

    updateBullets = (bullets) => {

        bullets.forEach(function (bullet) {
            bullet.body.velocity.y = 0;
        }, this);
    }

    processInput = (input) => {

        if (input.keyboard.isDown(Phaser.Keyboard.NUMPAD_0)) {
            this.selectedPlayerIndex = 0;
        }
        if (input.keyboard.isDown(Phaser.Keyboard.NUMPAD_1)) {
            this.selectedPlayerIndex = 1;
        }
        if (input.keyboard.isDown(Phaser.Keyboard.NUMPAD_2)) {
            this.selectedPlayerIndex = 2;
        }
        if (input.keyboard.isDown(Phaser.Keyboard.NUMPAD_3)) {
            this.selectedPlayerIndex = 3;
        }
        if (input.keyboard.isDown(Phaser.Keyboard.NUMPAD_4)) {
            this.selectedPlayerIndex = 4;
        }

        // zoom
        if (input.keyboard.isDown(Phaser.Keyboard.Q)) {
            this.worldScale += 0.05;
        }
        else if (input.keyboard.isDown(Phaser.Keyboard.Z)) {
            this.worldScale -= 0.05;
        }

        // set a minimum and maximum scale value
        this.worldScale = Phaser.Math.clamp(this.worldScale, 0.25, 2);

        // set our world scale as needed
        this.game.world.scale.set(this.worldScale);
    }

    updateEnemies = (enemiesPhysics) => {

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

    updateHud = (playerHudIcon) => {
        playerHudIcon.bringToTop();
    }

    render = () =>  {
        // game.debug.body(p);
        //game.debug.bodyInfo(player, 32, 320);
    }

    collectGem = (sprite, tile) => {

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

    collectKey = (sprite, tile) => {

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

    createPlayer = (player, playerGun) =>  {

        player = this.game.add.sprite(64, 64, 'playerSprites', 'alienBlue_front.png');
        player.scale.setTo(this.playerDrawScale, this.playerDrawScale);
        player.anchor.setTo(.5, .5);

        for (var i = 0; i < this.playerPrefixes.length; i++) {
            player.animations.add(this.playerPrefixes[i] + 'walk', Phaser.Animation.generateFrameNames(this.playerPrefixes[i] + '_walk', 1, 2, '.png'), 10);
            player.animations.add(this.playerPrefixes[i] + 'swim', Phaser.Animation.generateFrameNames(this.playerPrefixes[i] + + '_swim', 1, 2, '.png'), 10);
            player.animations.add(this.playerPrefixes[i] + 'climb', Phaser.Animation.generateFrameNames(this.playerPrefixes[i] + '_climb', 1, 2, '.png'), 10);
        }

        this.game.physics.enable(player);
        this.game.physics.arcade.gravity.y = 600;
        player.body.setSize(64, 64, 0, 47);
        player.body.bounce.y = 0.05;
        player.body.linearDamping = 1;
        player.body.collideWorldBounds = true;

        player.frameName = this.playerPrefixes[this.selectedPlayerIndex] + "_stand.png";

        player.isInSpaceShip = false;

        player.isFacingRight = true;
        
        player.isCurrentlyTouchingSpring = false;

        playerGun = this.game.add.sprite(64, 64, 'playerGun', 'playerGun');
        playerGun.anchor.setTo(0.5, 0.5);

        this.game.physics.enable(playerGun);

        this.game.camera.follow(player);
    }

    createSpaceShip = (game) => {

        var playerSpaceShip = game.add.sprite(400, 800, 'alienShipSprites', 'shipBeige.png');
        game.physics.enable(playerSpaceShip);
        playerSpaceShip.body.collideWorldBounds = true;
        playerSpaceShip.enableBody = true;
        playerSpaceShip.body.allowGravity = false;

        this.createSpaceShipExhaustEmitter();

        return playerSpaceShip;
    }

    createSpaceShipExhaustEmitter = () => {
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

    particleBurst = () => {
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


    fireBullet = (bullet) => {

        if (this.game.time.now > this.bulletTime) {
            //this.bullet = this.bullets.getFirstExists(false);

            if (bullet) {
                if (this.player.isFacingRight) {
                    bullet.reset(this.playerGun.body.x + 6, this.playerGun.body.y - 8);
                    bullet.body.velocity.x = 500;
                    bullet.body.velocity.y = 0;
                }
                else {
                    bullet.reset(this.playerGun.body.x - 20, this.playerGun.body.y - 8);
                    bullet.body.velocity.x = -500;
                    bullet.body.velocity.y = 0;
                }
                this.bulletTime = this.game.time.now + 150;
            }
        }

    }

    bulletIntervalElapsed = (now, time) =>{
        return now > time;
    }

    //  Called if the bullet goes out of the screen
    resetBullet = (bullet) => {
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