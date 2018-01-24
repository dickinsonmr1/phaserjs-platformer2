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
    return Constants;
}());
var MyGame = /** @class */ (function () {
    function MyGame() {
        var _this = this;
        // player selection
        this.playerPrefixes = ['alienBeige', 'alienBlue', 'alienGreen', 'alienPink', 'alienYellow'];
        this.selectedPlayerIndex = 0;
        this.bulletTime = 0;
        this.bulletDrawOffsetX = 6;
        this.bulletDrawOffsetY = 8;
        //gems;
        // display stuff
        this.playerDrawScale = 0.50;
        this.enemyDrawScale = 1;
        this.worldScale = 1;
        this.enemySpeed = 200;
        // initialization stuff
        this.isWorldLoaded = false;
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
            game.load.image('playerGunBullet', 'assets/sprites/player/laserPurpleDot.png');
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
            _this.sky = _this.game.add.tileSprite(0, 0, 20480, 1024, 'sky');
            _this.sky.fixedtoCamera = true;
            _this.hudGroup = _this.game.add.group();
            // http://www.html5gamedevs.com/topic/6380-moving-a-camera-fixed-sprite/
            _this.playerHudIcon = _this.game.add.image(0, 0, 'playerSprites', 'alienBlue_front.png');
            _this.playerHudIcon.fixedToCamera = true;
            _this.playerHudIcon.anchor.setTo(0, 0);
            //hudGroup.add(playerHudIcon);
            _this.createWorld('level1', _this.game, _this.enemies, _this.enemiesPhysics);
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
        };
        this.createWorld = function (worldName, game, enemies, enemiesPhysics) {
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
            _this.map = game.add.tilemap(worldName);
            //map.addTilesetImage('sky', 'backgroundImageLayer');
            _this.map.addTilesetImage('spritesheet_tiles_64x64', 'tiles');
            _this.map.addTilesetImage('spritesheet_items_64x64', 'items');
            _this.map.addTilesetImage('spritesheet_ground_64x64', 'ground');
            _this.map.addTilesetImage('spritesheet_enemies_64x64', 'enemyTiles');
            _this.map.addTilesetImage('platformer-requests-sheet_64x64', 'platformerRequestTiles');
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
            _this.layer01 = _this.map.createLayer('layer01-background-passable');
            _this.layer01.alpha = 1.0;
            _this.layer01.resizeWorld();
            // non-passable blocks layer
            _this.layer02 = _this.map.createLayer('layer02-nonpassable');
            _this.layer02.alpha = 1.0;
            //map.setCollisionBetween(0, 133, true, layer02, true);
            _this.map.setCollisionBetween(0, 2000, true, _this.layer02, true);
            //map.setCollisionBetween(158, 400, true, layer02, true);
            _this.layer02.resizeWorld();
            //map.setCollision();
            //  Un-comment this on to see the collision tiles
            //layer.debug = true;
            //layer2.debug = true;
            // add player between background and foreground layers
            _this.playerSpaceShip = _this.createSpaceShip(_this.game);
            _this.createPlayer(_this.player, _this.playerGun);
            //---------------------------------------------------------------------------------------------------
            // ENEMIES
            //---------------------------------------------------------------------------------------------------
            _this.layer07 = _this.map.createLayer('layer07-enemies');
            _this.layer07.alpha = 0.1;
            enemies = game.add.group();
            enemiesPhysics = game.add.group(); // removed 324
            _this.map.createFromTiles([297, 290, 322, 300, 380, 337, 395, 299, 323, 330, 353, 347, 371], null, 'ghost', 'layer07-enemies', enemiesPhysics); //, this.enemyPhysics);
            var enemiesNonGravity = game.add.group();
            _this.map.createFromTiles([324], null, 'piranha', 'layer07-enemies', enemiesNonGravity); //, this.enemyNonGravity);
            _this.layer07.resizeWorld();
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
            _this.layer05 = _this.map.createLayer('layer05-collectibles');
            _this.layer05.alpha = 1.0; //0.75;
            //map.setCollisionBetween(0, 400, true, layer05, true);
            // gem stuff... http://phaser.io/examples/v2/tilemaps/tile-callbacks
            _this.map.setCollision(Constants.tileKeyGemRed, true, _this.layer05, true);
            _this.map.setCollision(Constants.tileKeyGemGreen, true, _this.layer05, true);
            _this.map.setCollision(Constants.tileKeyGemYellow, true, _this.layer05, true);
            _this.map.setCollision(Constants.tileKeyGemBlue, true, _this.layer05, true);
            _this.map.setTileIndexCallback(Constants.tileKeyGemRed, _this.collectGem, _this, _this.layer05);
            _this.map.setTileIndexCallback(Constants.tileKeyGemGreen, _this.collectGem, _this, _this.layer05);
            _this.map.setTileIndexCallback(Constants.tileKeyGemYellow, _this.collectGem, _this, _this.layer05);
            _this.map.setTileIndexCallback(Constants.tileKeyGemBlue, _this.collectGem, _this, _this.layer05);
            // key
            _this.map.setCollision(Constants.tileKeyBlueKey, true, _this.layer05, true);
            _this.map.setTileIndexCallback(Constants.tileKeyBlueKey, _this.collectKey, _this, _this.layer05);
            // green flag no wind: 146
            _this.layer05.resizeWorld();
            //---------------------------------------------------------------------------------------------------
            // GAMEOBJECTS
            //---------------------------------------------------------------------------------------------------
            _this.layer06 = _this.map.createLayer('layer06-gameobjects');
            _this.layer06.alpha = 0.0; //0.75;
            //map.setCollisionBetween(0, 400, true, layer05, true);
            _this.springs = game.add.group();
            _this.map.setCollision(Constants.tileKeySpring, true, _this.layer06, true);
            _this.map.createFromTiles(Constants.tileKeySpring, null, 'tileObjectSprites', 'layer06-gameobjects', _this.springs); //, this.spring);
            _this.layer06.resizeWorld();
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
            _this.layer03 = _this.map.createLayer('layer03-foreground-passable-semitransparent');
            _this.layer03.alpha = 0.5;
            _this.layer03.resizeWorld();
            //---------------------------------------------------------------------------------------------------
            // FOREGROUND PASSABLE OPAQUE LAYER (front wall of a cave, plant, etc.)
            //---------------------------------------------------------------------------------------------------
            _this.layer04 = _this.map.createLayer('layer04-foreground-passable-opaque');
            _this.layer04.alpha = 1.0;
            _this.layer04.resizeWorld();
            // TODO: add HUD stuff here
            _this.bullets = game.add.group();
            game.physics.enable(_this.bullets);
            _this.bullets.enableBody = true;
            _this.bullets.allowGravity = false;
            for (var i = 0; i < 200; i++) {
                var b = _this.bullets.create(0, 0, 'playerGunBullet');
                b.name = 'bullet' + i;
                b.exists = false;
                b.visible = false;
                b.checkWorldBounds = true;
                b.body.gravity.y = 0;
                b.body.collideWorldBounds = true;
                b.events.onOutOfBounds.add(_this.resetBullet, _this);
            }
            _this.isWorldLoaded = true;
        };
        this.update = function () {
            if (_this.isWorldLoaded) {
                _this.sky.tilePosition.x = -(_this.game.camera.x * 0.25);
                _this.sky.tilePosition.y = -(_this.game.camera.y * 0.05) + 250;
                _this.emitTime++;
                _this.updatePhysics(_this.player, _this.enemies, _this.game.physics);
                _this.updatePlayer(_this.player, _this.playerGun, _this.playerSpaceShip, _this.game.input.keyboard, _this.cursors);
                _this.updateBullets(_this.bullets);
                _this.processInput(_this.game.input);
                _this.updateEnemies(_this.enemiesPhysics);
                _this.updateHud(_this.playerHudIcon);
            }
        };
        this.updatePhysics = function (player, enemies, physics) {
            if (!player.isInSpaceShip) {
                physics.arcade.collide(player, _this.layer02);
                physics.arcade.collide(player, _this.layer05);
                if (!physics.arcade.collide(player, _this.springs, _this.playerTouchingSpringHandler, null, _this)) {
                    player.isCurrentlyTouchingSpring = false;
                }
                physics.arcade.collide(_this.playerSpaceShip, player, _this.playerEnteringSpaceshipCollisionHandler, null, _this);
                physics.arcade.collide(player, enemies);
            }
            else {
                physics.arcade.collide(_this.playerSpaceShip, _this.layer02);
                physics.arcade.collide(_this.playerSpaceShip, _this.layer05);
                physics.arcade.collide(_this.playerSpaceShip, enemies);
            }
            var enemiesPhysics = enemies.filter(function (x) { return x.enemyType == "physics"; });
            physics.arcade.collide(enemiesPhysics, _this.layer02);
            physics.arcade.collide(enemiesPhysics, enemiesPhysics);
        };
        this.playerEnteringSpaceshipCollisionHandler = function (playerSpaceShip, player) {
            if (player.renderable) {
                player.isInSpaceShip = true;
                //particleBurst();
                _this.emitter.start(false, 1000, 100, 0);
            }
        };
        this.playerTouchingSpringHandler = function (player, springs) {
            if (!player.isInSpaceShip && !player.isCurrentlyTouchingSpring) {
                //if(springSound.)
                //if (tile.alpha > 0) {
                player.body.velocity.y = -650;
                _this.springSound.play();
                player.isCurrentlyTouchingSpring = true;
            }
        };
        this.playerExitingSpaceship = function (player, playerSpaceShip) {
            player.isInSpaceShip = false;
            player.body.velocity.y = -400;
            player.body.x = playerSpaceShip.body.x + 50;
            player.renderable = true;
            playerSpaceShip.body.velocity.x = 0;
            playerSpaceShip.body.velocity.y = 0;
            playerSpaceShip.frameName = "shipBeige.png"; //players[selectedPlayerIndex] + "_stand.png";
            _this.emitter.on = false;
        };
        this.updatePlayer = function (player, playerGun, playerSpaceShip, keyboard, cursors) {
            if (!player.isInSpaceShip) {
                player.body.velocity.x = 0;
                if (cursors.up.isDown || keyboard.isDown(Phaser.Keyboard.W) || keyboard.isDown(Phaser.Keyboard.SPACEBAR)) {
                    if (player.body.onFloor()) {
                        player.body.velocity.y = -500;
                        _this.jumpsound.play();
                    }
                }
                if (cursors.left.isDown || keyboard.isDown(Phaser.Keyboard.A)) {
                    player.isFacingRight = false;
                    //player.body.velocity.x = -150;
                    player.body.velocity.x = -200;
                    player.anchor.setTo(.5, .5);
                    player.scale.x = -_this.playerDrawScale;
                    player.scale.y = _this.playerDrawScale;
                    player.animations.play(_this.playerPrefixes[_this.selectedPlayerIndex] + 'walk');
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
                    player.scale.x = _this.playerDrawScale;
                    player.scale.y = _this.playerDrawScale;
                    player.animations.play(_this.playerPrefixes[_this.selectedPlayerIndex] + 'walk');
                    playerGun.scale.x = 0.8;
                    playerGun.scale.y = 0.8;
                    playerGun.anchor.setTo(.5, .5);
                    playerGun.body.x = player.body.x + 20;
                    playerGun.body.y = player.body.y - 22;
                }
                else if (cursors.down.isDown || keyboard.isDown(Phaser.Keyboard.S)) {
                    if (player.body.onFloor()) {
                        player.frameName = _this.playerPrefixes[_this.selectedPlayerIndex] + "_duck.png";
                        playerGun.body.y = player.body.y - 10;
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
                    if (_this.bulletIntervalElapsed(_this.game.time.now, _this.bulletTime)) {
                        _this.fireBullet(_this.bullets.getFirstExists(false));
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
            else {
                //if (emitTime > 40) {
                //emitTime = 0;
                _this.particleBurst();
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
                    _this.playerExitingSpaceship(player, playerSpaceShip);
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
            if (input.keyboard.isDown(Phaser.Keyboard.NUMPAD_0)) {
                _this.selectedPlayerIndex = 0;
            }
            if (input.keyboard.isDown(Phaser.Keyboard.NUMPAD_1)) {
                _this.selectedPlayerIndex = 1;
            }
            if (input.keyboard.isDown(Phaser.Keyboard.NUMPAD_2)) {
                _this.selectedPlayerIndex = 2;
            }
            if (input.keyboard.isDown(Phaser.Keyboard.NUMPAD_3)) {
                _this.selectedPlayerIndex = 3;
            }
            if (input.keyboard.isDown(Phaser.Keyboard.NUMPAD_4)) {
                _this.selectedPlayerIndex = 4;
            }
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
                if (enemy.body.blocked.right && enemy.isFacingRight) {
                    enemy.isFacingRight = false;
                }
                if (enemy.body.blocked.left && !enemy.isFacingRight) {
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
            }, _this);
            _this.enemiesNonGravity.forEach(function (enemy) {
                enemy.movementTime++;
                if (enemy.movementTime > 60) {
                    enemy.movementTime = 0;
                    enemy.body.velocity.y *= -1;
                    if (enemy.body.velocity.y > 0) {
                        enemy.anchor.setTo(.5, .5);
                        enemy.scale.y = -this.enemyDrawScale;
                    }
                    else {
                        enemy.anchor.setTo(.5, .5);
                        enemy.scale.y = this.enemyDrawScale;
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
                _this.layer05.dirty = true;
                _this.map.dirty = true;
                _this.map.setLayer(_this.layer05);
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
                _this.layer05.dirty = true;
                _this.map.dirty = true;
                _this.map.setLayer(_this.layer05);
            }
            return false;
        };
        this.createPlayer = function (player, playerGun) {
            player = _this.game.add.sprite(64, 64, 'playerSprites', 'alienBlue_front.png');
            player.scale.setTo(_this.playerDrawScale, _this.playerDrawScale);
            player.anchor.setTo(.5, .5);
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
            player.isInSpaceShip = false;
            player.isFacingRight = true;
            player.isCurrentlyTouchingSpring = false;
            playerGun = _this.game.add.sprite(64, 64, 'playerGun', 'playerGun');
            playerGun.anchor.setTo(0.5, 0.5);
            _this.game.physics.enable(playerGun);
            _this.game.camera.follow(player);
        };
        this.createSpaceShip = function (game) {
            var ship = game.add.sprite(400, 800, 'alienShipSprites', 'shipBeige.png');
            game.physics.enable(ship);
            ship.body.collideWorldBounds = true;
            ship.enableBody = true;
            ship.body.allowGravity = false;
            _this.createSpaceShipExhaustEmitter(game, ship);
            return ship;
        };
        this.createSpaceShipExhaustEmitter = function (game, playerSpaceShip) {
            _this.emitter = game.add.emitter(playerSpaceShip.body.x, playerSpaceShip.body.y, 200);
            _this.emitter.makeParticles('engineExhaust');
            _this.emitter.minRotation = 0;
            _this.emitter.maxRotation = 0;
            //emitter.gravity = 150;
            _this.emitter.setAlpha(1, 0, 1250);
            _this.emitter.setXSpeed(0, 0);
            _this.emitter.setYSpeed(100, 150);
            //emitter.bounce.setTo(0.5, 0.5);
            _this.emitter.setScale(0.1, 1, 0.25, 0.25, 1000, Phaser.Easing.Quintic.Out);
            _this.emitter.x = playerSpaceShip.x;
            _this.emitter.y = playerSpaceShip.y + 50;
        };
        this.particleBurst = function () {
            _this.emitter.x = _this.playerSpaceShip.x;
            _this.emitter.y = _this.playerSpaceShip.y + 50;
            _this.emitter.setXSpeed(_this.playerSpaceShip.body.velocity.x, _this.playerSpaceShip.body.velocity.x);
            _this.emitter.setYSpeed(_this.playerSpaceShip.body.velocity.y + 150, _this.playerSpaceShip.body.velocity.y + 150);
            //emitter.start(false, 2000, 750, 1, 20);
            _this.emitter.on = true;
        };
        //function collectGem2(player, gem) {
        //    gemSound.play();
        //    gem.kill();
        //}
        this.fireBullet = function (bullet) {
            if (_this.game.time.now > _this.bulletTime) {
                //this.bullet = this.bullets.getFirstExists(false);
                if (bullet) {
                    if (_this.player.isFacingRight) {
                        bullet.reset(_this.playerGun.body.x + 6, _this.playerGun.body.y - 8);
                        bullet.body.velocity.x = 500;
                        bullet.body.velocity.y = 0;
                    }
                    else {
                        bullet.reset(_this.playerGun.body.x - 20, _this.playerGun.body.y - 8);
                        bullet.body.velocity.x = -500;
                        bullet.body.velocity.y = 0;
                    }
                    _this.bulletTime = _this.game.time.now + 150;
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
        //this.game = new Phaser.Game(800, 600, Phaser.AUTO, 'content', { preload: this.preload, create: this.create });
        this.game = new Phaser.Game(1280, 720, Phaser.CANVAS, 'phaser-platformer', { preload: this.preload, create: this.create, update: this.update, render: this.render });
    }
    return MyGame;
}());
window.onload = function () {
    var game = new MyGame();
};
