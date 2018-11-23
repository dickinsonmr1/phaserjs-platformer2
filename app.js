/// <reference path="phaser.d.ts" />
var Constants = /** @class */ (function () {
    function Constants() {
    }
    Object.defineProperty(Constants, "tileKeyBlueKey", {
        get: function () { return 141; },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Constants, "tileKeyGemGreen", {
        get: function () { return 142; },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Constants, "tileKeyGemRed", {
        get: function () { return 157; },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Constants, "tileKeyGemYellow", {
        get: function () { return 134; },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Constants, "tileKeyGemBlue", {
        get: function () { return 149; },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Constants, "tileKeySpring", {
        get: function () { return 266; },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Constants, "enemySpeed", {
        get: function () { return 200; },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Constants, "playerDrawScale", {
        get: function () { return 0.5; },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Constants, "enemyDrawScale", {
        get: function () { return 1; },
        enumerable: true,
        configurable: true
    });
    return Constants;
}());
var PlayerBox = /** @class */ (function () {
    function PlayerBox(isInSpaceShip, isTouchingSpring, isFacingRight) {
        this.bulletTime = 0;
        this.bulletDrawOffsetX = 6;
        this.bulletDrawOffsetY = 8;
        this.hurtTime = 0;
        this.isInSpaceShip = isInSpaceShip;
        this.isTouchingSpring = isTouchingSpring;
        this.isFacingRight = isFacingRight;
    }
    return PlayerBox;
}());
var EnemyBox = /** @class */ (function () {
    function EnemyBox() {
    }
    return EnemyBox;
}());
var World = /** @class */ (function () {
    function World() {
    }
    return World;
}());
var HUDComponent = /** @class */ (function () {
    function HUDComponent() {
    }
    return HUDComponent;
}());
var MyGame = /** @class */ (function () {
    function MyGame() {
        var _this = this;
        // player selection
        this.playerPrefixes = ['alienBeige', 'alienBlue', 'alienGreen', 'alienPink', 'alienYellow'];
        this.selectedPlayerIndex = 0;
        // display stuff
        this.worldScale = 1;
        this.preload = function () {
            _this.loadAudio(_this.game);
            _this.loadSprites(_this.game);
            _this.loadTilemap(_this.game);
        };
        this.loadAudio = function (game) {
            //game.load.tilemap('mario', 'assets/tilemaps/maps/super_mario.json', null, Phaser.Tilemap.TILED_JSON);
            //game.load.image('tiles', 'assets/tilemaps/tiles/super_mario.png');
            //game.load.image('player', 'assets/sprites/phaser-dude.png');
            game.load.audio('jump', 'assets/audio/jump.wav');
            game.load.audio('gemSound', 'assets/audio/coin.wav');
            game.load.audio('key', 'assets/audio/key.wav');
            game.load.audio('springSound', 'assets/audio/spring.wav');
            game.load.audio('laser', 'assets/audio/laser5.ogg');
            game.load.audio('hurt', 'assets/audio/hurt.wav');
        };
        this.loadSprites = function (game) {
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
            game.load.image('playerGunBullet', 'assets/sprites/player/laserPurpleDot15x15.png');
        };
        this.loadTilemap = function (game) {
            // tilemap for level building
            game.load.tilemap('level1', 'assets/tilemaps/maps/world-01-02.json', null, Phaser.Tilemap.TILED_JSON);
            //this.game.load.tilemap('level1', 'assets/tilemaps/maps/world-00-overworld.json', null, Phaser.Tilemap.TILED_JSON);
            game.load.image('tiles', 'assets/tilemaps/tiles/spritesheet_tiles_64x64.png');
            game.load.image('items', 'assets/tilemaps/tiles/spritesheet_items_64x64.png');
            game.load.image('ground', 'assets/tilemaps/tiles/spritesheet_ground_64x64.png');
            game.load.image('platformerRequestTiles', 'assets/tilemaps/tiles/platformer-requests-sheet_64x64.png');
            game.load.image('enemyTiles', 'assets/tilemaps/tiles/spritesheet_enemies_64x64.png');
        };
        this.create = function () {
            _this.game.physics.startSystem(Phaser.Physics.ARCADE);
            _this.game.stage.backgroundColor = '#787878';
            var logo = _this.game.add.sprite(_this.game.world.centerX, _this.game.world.centerY, 'logo.png');
            logo.anchor.setTo(0.5, 0.5);
            var sky = _this.game.add.tileSprite(0, 0, 20480, 1024, 'sky');
            //sky.fixedToCamera = true;
            _this.hudComponent = new HUDComponent();
            _this.hudComponent.hudGroup = _this.game.add.group();
            // http://www.html5gamedevs.com/topic/6380-moving-a-camera-fixed-sprite/
            _this.hudComponent.playerHudIcon = _this.game.add.image(0, 0, 'playerSprites', 'alienBlue_front.png');
            _this.hudComponent.playerHudIcon.fixedToCamera = true;
            _this.hudComponent.playerHudIcon.anchor.setTo(0, 0);
            //hudGroup.add(playerHudIcon);
            _this.enemies = _this.game.add.group();
            _this.enemiesPhysics = _this.game.add.group(); // removed 324
            _this.enemiesNonGravity = _this.game.add.group();
            _this.world = _this.createWorld('level1', _this.game, _this.enemies, _this.enemiesPhysics, _this.enemiesNonGravity, sky);
            _this.world.sky = sky;
            // input
            _this.cursors = _this.game.input.keyboard.createCursorKeys();
            _this.createAudio(_this.game);
        };
        this.createAudio = function (game) {
            _this.jumpsound = game.add.audio('jump');
            _this.gemSound = game.add.audio('gemSound');
            _this.keySound = game.add.audio('key');
            _this.springSound = game.add.audio('springSound');
            _this.springSound.allowMultiple = false;
            _this.laserSound = game.add.audio('laser');
            _this.laserSound.allowMultiple = true;
            _this.hurtSound = game.add.audio('hurt');
            _this.hurtSound.allowMultiple = false;
        };
        this.createWorld = function (worldName, game, enemies, enemiesPhysics, enemiesNonGravity, sky) {
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
            var world = new World();
            world.sky = sky;
            world.map = game.add.tilemap(worldName);
            //map.addTilesetImage('sky', 'backgroundImageLayer');
            world.map.addTilesetImage('spritesheet_tiles_64x64', 'tiles');
            world.map.addTilesetImage('spritesheet_items_64x64', 'items');
            world.map.addTilesetImage('spritesheet_ground_64x64', 'ground');
            world.map.addTilesetImage('spritesheet_enemies_64x64', 'enemyTiles');
            world.map.addTilesetImage('platformer-requests-sheet_64x64', 'platformerRequestTiles');
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
            world.layer01 = world.map.createLayer('layer01-background-passable');
            world.layer01.alpha = 1.0;
            world.layer01.resizeWorld();
            // non-passable blocks layer
            world.layer02 = world.map.createLayer('layer02-nonpassable');
            world.layer02.alpha = 1.0;
            //map.setCollisionBetween(0, 133, true, layer02, true);
            world.map.setCollisionBetween(0, 2000, true, world.layer02, true);
            //map.setCollisionBetween(158, 400, true, layer02, true);
            world.layer02.resizeWorld();
            world.layer02.debug = false;
            //map.setCollision();
            //  Un-comment this on to see the collision tiles
            //layer.debug = true;
            //layer2.debug = true;
            // add player between background and foreground layers
            _this.playerSpaceShip = _this.createSpaceShip(game);
            _this.player = _this.createPlayer(_this.player);
            //this.playerIsInSpaceShip = false;
            _this.playerBox = new PlayerBox(false, false, true);
            _this.playerBox.playerGun = game.add.sprite(64, 64, 'playerGun', 'playerGun');
            _this.playerBox.playerGun.anchor.setTo(0.5, 0.5);
            game.physics.enable(_this.playerBox.playerGun);
            //---------------------------------------------------------------------------------------------------
            // ENEMIES
            //---------------------------------------------------------------------------------------------------
            world.layer07 = world.map.createLayer('layer07-enemies');
            world.layer07.alpha = 0.1;
            world.map.createFromTiles([297, 290, 322, 300, 380, 337, 395, 299, 323, 330, 353, 347, 371], null, 'ghost', 'layer07-enemies', enemiesPhysics); //, this.enemyPhysics);
            world.map.createFromTiles([324], null, 'piranha', 'layer07-enemies', enemiesNonGravity); //, this.enemyNonGravity);
            world.layer07.resizeWorld();
            game.physics.enable(enemiesNonGravity);
            enemiesNonGravity.forEach(function (enemy) {
                enemy.enemyType = "nonGravity";
                enemy.movementTime = 0;
                enemy.enableBody = true;
                enemy.body.allowGravity = false;
                enemy.body.velocity.y = 150;
                enemy.body.collideWorldBounds = false;
                enemy.isFacingRight = true;
            }, _this);
            enemies.add(enemiesNonGravity);
            game.physics.enable(enemiesPhysics);
            enemiesPhysics.forEach(function (enemy) {
                enemy.enemyType = "physics";
                enemy.enableBody = true;
                enemy.body.collideWorldBounds = true;
                enemy.isFacingRight = true;
            }, _this);
            enemies.add(enemiesPhysics);
            //enemies.enableBody = true;F
            //enemies.body.collideWorldBounds = true;    
            //---------------------------------------------------------------------------------------------------
            // COLLECTIBLES
            //---------------------------------------------------------------------------------------------------
            world.layer05 = world.map.createLayer('layer05-collectibles');
            world.layer05.alpha = 1.0; //0.75;
            //map.setCollisionBetween(0, 400, true, layer05, true);
            // gem stuff... http://phaser.io/examples/v2/tilemaps/tile-callbacks
            world.map.setCollision(Constants.tileKeyGemRed, true, world.layer05, true);
            world.map.setCollision(Constants.tileKeyGemGreen, true, world.layer05, true);
            world.map.setCollision(Constants.tileKeyGemYellow, true, world.layer05, true);
            world.map.setCollision(Constants.tileKeyGemBlue, true, world.layer05, true);
            world.map.setTileIndexCallback(Constants.tileKeyGemRed, _this.collectGem, _this, world.layer05);
            world.map.setTileIndexCallback(Constants.tileKeyGemGreen, _this.collectGem, _this, world.layer05);
            world.map.setTileIndexCallback(Constants.tileKeyGemYellow, _this.collectGem, _this, world.layer05);
            world.map.setTileIndexCallback(Constants.tileKeyGemBlue, _this.collectGem, _this, world.layer05);
            // key
            world.map.setCollision(Constants.tileKeyBlueKey, true, world.layer05, true);
            world.map.setTileIndexCallback(Constants.tileKeyBlueKey, _this.collectKey, _this, world.layer05);
            // green flag no wind: 146
            world.layer05.resizeWorld();
            //---------------------------------------------------------------------------------------------------
            // GAMEOBJECTS
            //---------------------------------------------------------------------------------------------------
            world.layer06 = world.map.createLayer('layer06-gameobjects');
            world.layer06.alpha = 0.0; //0.75;
            //map.setCollisionBetween(0, 400, true, layer05, true);
            _this.springs = game.add.group();
            world.map.setCollision(Constants.tileKeySpring, true, world.layer06, true);
            world.map.createFromTiles(Constants.tileKeySpring, null, 'tileObjectSprites', 'layer06-gameobjects', _this.springs); //, this.spring);
            world.layer06.resizeWorld();
            game.physics.enable(_this.springs);
            _this.springs.forEach(function (item) {
                item.enableBody = true;
                item.immovable = true;
                item.body.moves = false;
                item.scale.setTo(0.5, 0.5);
                item.anchor.setTo(0, 0);
            }, _this);
            _this.springs.callAll('animations.add', 'animations', 'springAnimation', Phaser.Animation.generateFrameNames('spring', 0, 1, '.png'), 2, true, false);
            _this.springs.callAll('play', null, 'springAnimation');
            //---------------------------------------------------------------------------------------------------
            // foreground semi-transparent layer (water, lava, clouds, etc.)
            //---------------------------------------------------------------------------------------------------
            world.layer03 = world.map.createLayer('layer03-foreground-passable-semitransparent');
            world.layer03.alpha = 0.5;
            world.layer03.resizeWorld();
            //---------------------------------------------------------------------------------------------------
            // FOREGROUND PASSABLE OPAQUE LAYER (front wall of a cave, plant, etc.)
            //---------------------------------------------------------------------------------------------------
            world.layer04 = world.map.createLayer('layer04-foreground-passable-opaque');
            world.layer04.alpha = 1.0;
            world.layer04.resizeWorld();
            // TODO: add HUD stuff here
            _this.playerBox.bullets = game.add.group();
            game.physics.enable(_this.playerBox.bullets);
            _this.playerBox.bullets.enableBody = true;
            //this.playerBox.bullets.allowGravity = false;
            for (var i = 0; i < 200; i++) {
                var b = _this.playerBox.bullets.create(0, 0, 'playerGunBullet');
                b.name = 'bullet' + i;
                b.exists = false;
                b.visible = false;
                b.checkWorldBounds = true;
                b.body.gravity.y = 0;
                //b.scale.setTo(0.5, 0.5);
                b.body.collideWorldBounds = true;
                b.events.onOutOfBounds.add(_this.resetBullet, _this);
            }
            world.isWorldLoaded = true;
            return world;
        };
        this.update = function () {
            if (_this.world.isWorldLoaded) {
                _this.world.sky.tilePosition.x = -(_this.game.camera.x * 0.25);
                _this.world.sky.tilePosition.y = -(_this.game.camera.y * 0.05) + 300;
                _this.emitTime++;
                _this.updatePhysics(_this.world, _this.game.physics, _this.player, _this.playerBox, _this.playerSpaceShip, _this.enemiesNonGravity, _this.enemiesPhysics, _this.world.layer02, _this.playerBox.bullets);
                _this.updatePlayer(_this.player, _this.playerBox.playerGun, _this.playerBox, _this.playerSpaceShip, _this.game.input.keyboard, _this.cursors);
                _this.updateBullets(_this.playerBox.bullets);
                _this.processInput(_this.game.input);
                _this.updateEnemies(_this.enemiesPhysics);
                _this.updateHud(_this.hudComponent.playerHudIcon);
            }
        };
        this.updatePhysics = function (world, physics, player, playerBox, playerSpaceShip, enemiesNonGravity, enemiesPhysics, impassableLayer, bullets) {
            if (!playerBox.isInSpaceShip) {
                physics.arcade.collide(player, impassableLayer);
                physics.arcade.collide(player, world.layer05);
                if (!physics.arcade.collide(player, _this.springs, _this.playerTouchingSpringHandler, null, _this)) {
                    playerBox.isCurrentlyTouchingSpring = false;
                }
                physics.arcade.collide(playerSpaceShip, player, _this.playerEnteringSpaceshipCollisionHandler, null, _this);
                if (physics.arcade.collide(player, enemiesNonGravity, _this.playerTouchingEnemiesHandler, null, _this)
                    || physics.arcade.collide(player, enemiesPhysics, _this.playerTouchingEnemiesHandler, null, _this)) {
                    if (playerBox.hurtTime == 0) {
                        _this.hurtSound.play();
                        playerBox.hurtTime = 120;
                    }
                }
            }
            else {
                physics.arcade.collide(playerSpaceShip, impassableLayer);
                physics.arcade.collide(playerSpaceShip, world.layer05);
                //physics.arcade.collide(this.playerSpaceShip, enemies);
                physics.arcade.collide(player, enemiesNonGravity);
                physics.arcade.collide(player, enemiesPhysics);
            }
            bullets.forEach(function (bullet) {
                bullet.body.velocity.y = 0;
            }, _this);
            physics.arcade.overlap(bullets, enemiesNonGravity, _this.bulletTouchingEnemyHandler, null, _this);
            physics.arcade.overlap(bullets, enemiesPhysics, _this.bulletTouchingEnemyHandler, null, _this);
            //var enemiesPhysics = enemies.filter(x => x.enemyType == "physics");
            //physics.arcade.collide(enemiesPhysics, this.layer02);
            //physics.arcade.collide(enemiesPhysics, enemiesPhysics);
            //var enemiesPhysics = enemies.filter(x => x.enemyType == "physics");
            physics.arcade.collide(enemiesPhysics, impassableLayer);
            physics.arcade.collide(enemiesPhysics, enemiesPhysics);
            physics.arcade.collide(enemiesNonGravity, impassableLayer);
            physics.arcade.collide(enemiesNonGravity, enemiesNonGravity);
            physics.arcade.collide(bullets, impassableLayer, _this.bulletTouchingImpassableLayerHandler, null, _this);
        };
        this.playerEnteringSpaceshipCollisionHandler = function (playerSpaceShip, player) {
            if (player.renderable) {
                _this.playerBox.isInSpaceShip = true;
                //particleBurst();
                _this.emitter.start(false, 1000, 100, 0);
            }
        };
        this.playerTouchingSpringHandler = function (player, springs) {
            if (!_this.playerBox.isInSpaceShip && !_this.playerBox.isTouchingSpring) {
                //if(springSound.)
                //if (tile.alpha > 0) {
                player.body.velocity.y = -650;
                _this.springSound.play();
                _this.playerBox.isTouchingSpring = true;
            }
        };
        this.playerTouchingEnemiesHandler = function (player, enemies) {
            /*
            if (!this.playerBox.isInSpaceShip && player.playerBox.hurtTime == 0) {
                this.hurtSound.play();
                player.playerBox.hurtTime = 60;
            }
            */
        };
        /*
        bulletTouchingEnemyHandler = (enemies, bullets) => {
    
            bullets.forEach(function (bullet) {
                bullet.body.velocity.x = 0;
            }, this);
            //if (!this.playerBox.isInSpaceShip && !this.playerBox.isTouchingSpring) {
                //if(springSound.)
                //if (tile.alpha > 0) {
                //player.body.velocity.y = -650;
                this.springSound.play();
                //this.playerBox.isTouchingSpring = true;
            //}
        }
        */
        this.bulletTouchingEnemyHandler = function (enemy, bullet) {
            enemy.kill();
            bullet.kill();
            //if (!this.playerBox.isInSpaceShip && !this.playerBox.isTouchingSpring) {
            //if(springSound.)
            //if (tile.alpha > 0) {
            //player.body.velocity.y = -650;
            _this.springSound.play();
            //this.playerBox.isTouchingSpring = true;
            //}
        };
        this.bulletTouchingImpassableLayerHandler = function (bullet, layer) {
            bullet.kill();
        };
        this.playerExitingSpaceship = function (player, playerSpaceShip, playerBox) {
            playerBox.isInSpaceShip = false;
            player.body.velocity.y = -400;
            player.body.x = playerSpaceShip.body.x + 50;
            player.renderable = true;
            playerSpaceShip.body.velocity.x = 0;
            playerSpaceShip.body.velocity.y = 0;
            playerSpaceShip.frameName = "shipBeige.png"; //players[selectedPlayerIndex] + "_stand.png";
            _this.emitter.on = false;
        };
        this.updatePlayer = function (player, playerGun, playerBox, playerSpaceShip, keyboard, cursors) {
            if (!playerBox.isInSpaceShip) {
                player.body.velocity.x = 0;
                if (playerBox.hurtTime > 0)
                    playerBox.hurtTime--;
                if (cursors.up.isDown || keyboard.isDown(Phaser.Keyboard.W) || keyboard.isDown(Phaser.Keyboard.SPACEBAR)) {
                    if (player.body.onFloor()) {
                        player.body.velocity.y = -500;
                        _this.jumpsound.play();
                    }
                }
                if (cursors.left.isDown || keyboard.isDown(Phaser.Keyboard.A)) {
                    playerBox.isFacingRight = false;
                    //player.body.velocity.x = -150;
                    player.body.velocity.x = -200;
                    player.anchor.setTo(.5, .5);
                    player.scale.x = -Constants.playerDrawScale;
                    player.scale.y = Constants.playerDrawScale;
                    player.animations.play(_this.playerPrefixes[_this.selectedPlayerIndex] + 'walk');
                    playerGun.scale.x = -0.8;
                    playerGun.scale.y = 0.8;
                    playerGun.anchor.setTo(.5, .5);
                    playerGun.body.x = player.body.x - 45;
                    playerGun.body.y = player.body.y - 22;
                }
                else if (cursors.right.isDown || keyboard.isDown(Phaser.Keyboard.D)) {
                    playerBox.isFacingRight = true;
                    //player.body.velocity.x = 150;
                    player.body.velocity.x = 200;
                    player.anchor.setTo(.5, .5);
                    player.scale.x = Constants.playerDrawScale;
                    player.scale.y = Constants.playerDrawScale;
                    player.animations.play(_this.playerPrefixes[_this.selectedPlayerIndex] + 'walk');
                    playerGun.scale.x = 0.8;
                    playerGun.scale.y = 0.8;
                    playerGun.anchor.setTo(.5, .5);
                    playerGun.body.x = player.body.x + 20;
                    playerGun.body.y = player.body.y - 22;
                }
                else if (cursors.down.isDown || keyboard.isDown(Phaser.Keyboard.S)) {
                    playerGun.anchor.setTo(.5, .5);
                    if (playerBox.isFacingRight) {
                        playerGun.body.x = player.body.x + 20;
                    }
                    else {
                        playerGun.body.x = player.body.x - 45;
                    }
                    if (player.body.onFloor()) {
                        player.frameName = _this.playerPrefixes[_this.selectedPlayerIndex] + "_duck.png";
                        playerGun.body.y = player.body.y - 10;
                    }
                    else {
                        playerGun.body.y = player.body.y - 22;
                    }
                }
                else {
                    //  Stand still
                    player.animations.stop();
                    player.frameName = _this.playerPrefixes[_this.selectedPlayerIndex] + "_stand.png";
                    //player.frame = 4;\
                    playerGun.body.y = player.body.y - 22;
                }
                if (player.body.onFloor()) {
                    //player.frameName = "alienBeige_duck.png";
                }
                else {
                    player.frameName = _this.playerPrefixes[_this.selectedPlayerIndex] + "_jump.png";
                }
                if (keyboard.isDown(Phaser.Keyboard.CONTROL)) {
                    if (_this.bulletIntervalElapsed(_this.game.time.now, _this.playerBox.bulletTime)) {
                        _this.fireBullet(_this.playerBox.bullets.getFirstExists(false), playerBox);
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
                if (playerBox.isFacingRight) {
                }
                if (!playerBox.isFacingRight) {
                }
            }
            else {
                //if (emitTime > 40) {
                //emitTime = 0;
                _this.particleBurst(_this.emitter, _this.playerSpaceShip);
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
                    _this.playerExitingSpaceship(player, playerSpaceShip, playerBox);
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
        };
        this.updateBullets = function (bullets) {
            bullets.forEach(function (bullet) {
                bullet.body.velocity.y = 0;
            }, _this);
        };
        this.processInput = function (input) {
            if (input.keyboard.isDown(Phaser.Keyboard.ZERO)) {
                _this.selectedPlayerIndex = 0;
            }
            if (input.keyboard.isDown(Phaser.Keyboard.ONE)) {
                _this.selectedPlayerIndex = 1;
            }
            if (input.keyboard.isDown(Phaser.Keyboard.TWO)) {
                _this.selectedPlayerIndex = 2;
            }
            if (input.keyboard.isDown(Phaser.Keyboard.THREE)) {
                _this.selectedPlayerIndex = 3;
            }
            if (input.keyboard.isDown(Phaser.Keyboard.FOUR)) {
                _this.selectedPlayerIndex = 4;
            }
            /*
            if (input.keyboard.isDown(Phaser.Keyboard.OPEN_BRACKET)) {
                this.layer02.debug = false;
                this.player.debug = false;
                this.enemiesNonGravity.debug = false;
                this.enemiesPhysics.debug = false;
            }
            if (input.keyboard.isDown(Phaser.Keyboard.CLOSED_BRACKET)) {
                this.layer02.debug = true;
                this.player.debug = true;
                this.enemiesNonGravity.debug = true;
                this.enemiesPhysics.debug = true;
            }
            */
            // zoom
            if (input.keyboard.isDown(Phaser.Keyboard.Q)) {
                _this.worldScale += 0.05;
            }
            else if (input.keyboard.isDown(Phaser.Keyboard.Z)) {
                _this.worldScale -= 0.05;
            }
            // set a minimum and maximum scale value
            _this.worldScale = Phaser.Math.clamp(_this.worldScale, 0.25, 2);
            // set our world scale as needed
            _this.game.world.scale.set(_this.worldScale);
        };
        this.updateEnemies = function (enemiesPhysics) {
            enemiesPhysics.forEach(function (enemy) {
                //http://www.emanueleferonato.com/2015/05/12/phaser-tutorial-html5-player-movement-as-seen-in-ipad-magick-game-using-mostly-tile-maps/
                if (enemy.body.blocked.right && enemy.isFacingRight) { //.body.velocity.x > 0)
                    enemy.isFacingRight = false;
                }
                if (enemy.body.blocked.left && !enemy.isFacingRight) { //.body.velocity.x < 0)
                    enemy.isFacingRight = true;
                }
                if (enemy.isFacingRight) {
                    enemy.scale.x = -Constants.enemyDrawScale;
                    enemy.anchor.setTo(.5, .5);
                    enemy.body.velocity.x = Constants.enemySpeed;
                }
                if (!enemy.isFacingRight) {
                    enemy.body.velocity.x = -Constants.enemySpeed;
                    enemy.anchor.setTo(.5, .5);
                    enemy.scale.x = Constants.enemyDrawScale;
                }
            }, _this);
            _this.enemiesNonGravity.forEach(function (enemy) {
                enemy.movementTime++;
                if (enemy.movementTime > 60) {
                    enemy.movementTime = 0;
                    enemy.body.velocity.y *= -1;
                    if (enemy.body.velocity.y > 0) {
                        enemy.anchor.setTo(.5, .5);
                        enemy.scale.y = -Constants.enemyDrawScale;
                    }
                    else {
                        enemy.anchor.setTo(.5, .5);
                        enemy.scale.y = Constants.enemyDrawScale;
                    }
                }
                //enemy.y += enemy.body.velocity;
            }, _this);
        };
        this.updateHud = function (playerHudIcon) {
            playerHudIcon.bringToTop();
        };
        this.render = function () {
            // game.debug.body(p);
            //game.debug.bodyInfo(player, 32, 320);
        };
        this.collectGem = function (sprite, tile) {
            if (tile.alpha > 0) {
                _this.gemSound.play();
                //map.removeTile(tile.x, tile.y);
                tile.alpha = 0;
                tile.collideUp = false;
                tile.collideDown = false;
                tile.collideLeft = false;
                tile.collideRight = false;
                //this.world.layer05.dirty = true;
                //this.world.map.dirty = true;
                _this.world.map.setLayer(_this.world.layer05);
            }
            return false;
        };
        this.collectKey = function (sprite, tile) {
            if (tile.alpha > 0) {
                _this.keySound.play();
                //map.removeTile(tile.x, tile.y);
                tile.alpha = 0;
                tile.collideUp = false;
                tile.collideDown = false;
                tile.collideLeft = false;
                tile.collideRight = false;
                //this.world.layer05.dirty = true;
                //this.world.map.dirty = true;
                _this.world.map.setLayer(_this.world.layer05);
            }
            return false;
        };
        this.createPlayer = function (game) {
            var player = _this.game.add.sprite(64, 64, 'playerSprites', 'alienBlue_front.png');
            player.scale.setTo(Constants.playerDrawScale, Constants.playerDrawScale);
            player.anchor.setTo(.5, .5);
            //player.isInSpaceShip = false;
            for (var i = 0; i < _this.playerPrefixes.length; i++) {
                player.animations.add(_this.playerPrefixes[i] + 'walk', Phaser.Animation.generateFrameNames(_this.playerPrefixes[i] + '_walk', 1, 2, '.png'), 10);
                player.animations.add(_this.playerPrefixes[i] + 'swim', Phaser.Animation.generateFrameNames(_this.playerPrefixes[i] + +'_swim', 1, 2, '.png'), 10);
                player.animations.add(_this.playerPrefixes[i] + 'climb', Phaser.Animation.generateFrameNames(_this.playerPrefixes[i] + '_climb', 1, 2, '.png'), 10);
            }
            _this.game.physics.enable(player);
            _this.game.physics.arcade.gravity.y = 600;
            player.body.setSize(64, 64, 0, 47);
            player.body.bounce.y = 0.05;
            player.body.linearDamping = 1;
            player.body.collideWorldBounds = true;
            player.frameName = _this.playerPrefixes[_this.selectedPlayerIndex] + "_stand.png";
            //player.isFacingRight = true;
            //player.isCurrentlyTouchingSpring = false;     
            _this.game.camera.follow(player);
            return player;
        };
        this.createSpaceShip = function (game) {
            var ship = game.add.sprite(400, 800, 'alienShipSprites', 'shipBeige.png');
            game.physics.enable(ship);
            ship.body.collideWorldBounds = true;
            ship.enableBody = true;
            ship.body.allowGravity = false;
            _this.emitter = _this.createSpaceShipExhaustEmitter(game, ship);
            return ship;
        };
        this.createSpaceShipExhaustEmitter = function (game, playerSpaceShip) {
            var emitter = game.add.emitter(playerSpaceShip.body.x, playerSpaceShip.body.y, 200);
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
            return emitter;
        };
        this.particleBurst = function (emitter, playerSpaceShip) {
            emitter.x = playerSpaceShip.x;
            emitter.y = playerSpaceShip.y + 50;
            emitter.setXSpeed(playerSpaceShip.body.velocity.x, playerSpaceShip.body.velocity.x);
            emitter.setYSpeed(playerSpaceShip.body.velocity.y + 150, playerSpaceShip.body.velocity.y + 150);
            //emitter.start(false, 2000, 750, 1, 20);
            emitter.on = true;
        };
        //function collectGem2(player, gem) {
        //    gemSound.play();
        //    gem.kill();
        //}
        this.fireBullet = function (bullet, playerBox) {
            if (_this.game.time.now > _this.playerBox.bulletTime) {
                //this.bullet = this.bullets.getFirstExists(false);
                if (bullet) {
                    if (playerBox.isFacingRight) {
                        bullet.reset(_this.playerBox.playerGun.body.x + 30, _this.playerBox.playerGun.body.y + 20);
                        bullet.body.velocity.x = 500;
                        bullet.body.velocity.y = 0;
                        //bullet.scale.setTo(0.5, 0.5);
                        //bullet.anchor.setTo(0.5, 0.5);
                    }
                    else {
                        bullet.reset(_this.playerBox.playerGun.body.x, _this.playerBox.playerGun.body.y + 20);
                        bullet.body.velocity.x = -500;
                        bullet.body.velocity.y = 0;
                        //bullet.scale.setTo(0.5, 0.5);
                        //bullet.anchor.setTo(0.5, 0.5);
                    }
                    _this.playerBox.bulletTime = _this.game.time.now + 150;
                    _this.laserSound.play();
                }
            }
        };
        this.bulletIntervalElapsed = function (now, time) {
            return now > time;
        };
        //  Called if the bullet goes out of the screen
        this.resetBullet = function (bullet) {
            bullet.kill();
        };
        this.game = new Phaser.Game(1280, 720, Phaser.CANVAS, 'phaser-platformer', { preload: this.preload, create: this.create, update: this.update, render: this.render });
    }
    return MyGame;
}());
window.onload = function () {
    var game = new MyGame();
};
