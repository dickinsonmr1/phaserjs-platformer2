
var game = new Phaser.Game(800, 600, Phaser.CANVAS, 'phaser-example', { preload: preload, create: create, update: update, render: render });

function preload() {

    //game.load.tilemap('mario', 'assets/tilemaps/maps/super_mario.json', null, Phaser.Tilemap.TILED_JSON);
    //game.load.image('tiles', 'assets/tilemaps/tiles/super_mario.png');
    game.load.image('player', 'assets/sprites/phaser-dude.png');

    game.load.tilemap('level1', 'assets/tilemaps/maps/alien-platformer-level01.json', null, Phaser.Tilemap.TILED_JSON);
    game.load.image('tiles', 'assets/tilemaps/tiles/spritesheet_tiles.png');
    game.load.image('items', 'assets/tilemaps/tiles/spritesheet_items.png');
    game.load.image('ground', 'assets/tilemaps/tiles/spritesheet_ground.png');
}

var map;
var tileset;
var layer;
var p;
var cursors;

var worldScale = 1;

function create() {

    game.physics.startSystem(Phaser.Physics.ARCADE);

    game.stage.backgroundColor = '#787878';

    //map = game.add.tilemap('mario');
    //map.addTilesetImage('SuperMarioBros-World1-1', 'tiles');

    map = game.add.tilemap('level1');

    //map.addTilesetImage('SuperMarioBros-World1-1', 'tiles');
    map.addTilesetImage('spritesheet_tiles', 'tiles');
    map.addTilesetImage('spritesheet_items', 'items');
    map.addTilesetImage('spritesheet_ground', 'ground');

    //  14 = ? block
    // map.setCollisionBetween(14, 15);

    //map.setCollisionBetween(15, 16);
    //map.setCollisionBetween(20, 25);
    //map.setCollisionBetween(27, 29);
    //map.setCollision(40);

    ////  This will set Tile ID 26 (the coin) to call the hitCoin function when collided with
    //map.setTileIndexCallback(26, hitCoin, this);
    ////  This will set the map location 2, 0 to call the function
    //map.setTileLocationCallback(2, 0, 1, 1, hitCoin, this);
    
    //layer = map.createLayer('World1');
    layer = map.createLayer('nonpassableBlocksLayer');
    layer2 = map.createLayer('passableBlocksLayer');
    //layer3 = map.createLayer('objectsLayer');

    map.setCollisionBetween(0, 200, true, layer, true);
    //map.setCollision();


    //  Un-comment this on to see the collision tiles
    layer.debug = true;
    layer2.debug = true;
    //layer3.debug = true;

    layer.resizeWorld();
    layer2.resizeWorld();
    //layer3.resizeWorld();

    p = game.add.sprite(32, 32, 'player');

    game.physics.enable(p);

    game.physics.arcade.gravity.y = 250;

    p.body.bounce.y = 0.2;
    p.body.linearDamping = 1;
    p.body.collideWorldBounds = true;

    game.camera.follow(p);

    cursors = game.input.keyboard.createCursorKeys();

}

function update() {

    game.physics.arcade.collide(p, layer);

    p.body.velocity.x = 0;

    if (cursors.up.isDown)
    {
        if (p.body.onFloor())
        {
            p.body.velocity.y = -200;
        }
    }

    if (cursors.left.isDown)
    {
        p.body.velocity.x = -150;
    }
    else if (cursors.right.isDown)
    {
        p.body.velocity.x = 150;
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
    game.debug.bodyInfo(p, 32, 320);

}

function hitCoin(sprite, tile) {

    tile.alpha = 0.2;

    layer.dirty = true;

    return false;

}

