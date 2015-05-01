
var game = new Phaser.Game(1280, 720, Phaser.AUTO, 'phaser-example', { preload: preload, create: create, update: update });

function preload() {

    //game.load.tilemap('mario', 'assets/tilemaps/maps/super_mario.json', null, Phaser.Tilemap.TILED_JSON);
    //game.load.image('tiles', 'assets/tilemaps/tiles/super_mario.png');

    game.load.tilemap('level1', 'assets/tilemaps/maps/alien-platformer-level01.json', null, Phaser.Tilemap.TILED_JSON);
    game.load.image('tiles', 'assets/tilemaps/tiles/spritesheet_tiles.png');
    game.load.image('items', 'assets/tilemaps/tiles/spritesheet_items.png');
    game.load.image('ground', 'assets/tilemaps/tiles/spritesheet_ground.png');

    //game.load.image('player', 'assets/sprites/phaser-dude.png');

}

var map;
var layer;
var p;
var cursors;

function create() {

    game.stage.backgroundColor = '#787878';

    map = game.add.tilemap('level1');

    //map.addTilesetImage('SuperMarioBros-World1-1', 'tiles');
    map.addTilesetImage('spritesheet_tiles', 'tiles');
    map.addTilesetImage('spritesheet_items', 'items');
    map.addTilesetImage('spritesheet_ground', 'ground');
    
    //layer = map.createLayer('World1');
    layer = map.createLayer('nonpassableBlocksLayer');

    layer.resizeWorld();

    layer.wrap = true;

    cursors = game.input.keyboard.createCursorKeys();

    //game.camera.x = (game.width * -0.5);
    //game.camera.y = (game.height * -0.5);
    //game.world.scale.set(0.5);
}

function update() {

    if (cursors.left.isDown)
    {
        game.camera.x -= 8;
    }
    else if (cursors.right.isDown)
    {
        game.camera.x += 8;
    }

    if (cursors.up.isDown)
    {
        game.camera.y -= 8;
    }
    else if (cursors.down.isDown)
    {
        game.camera.y += 8;
    }

}