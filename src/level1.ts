import 'pixi';
import 'p2';
import * as Phaser from 'phaser';

const WIDTH = 1365;
const HEIGHT = 768;

class Level1 {
    ground: Phaser.TilemapLayer;

    static loadAssets(game: Phaser.Game) {
        game.load.audio('music', 'assets/audio/come_and_Find_Me.mp3');
        game.load.image('background', 'assets/images/BG_resize.png');
        game.load.image('tileset', 'assets/images/tiles/tileset.png');
        game.load.image('Bone (1)', 'assets/images/tiles/Bone (1).png');
        game.load.image('Bone (2)', 'assets/images/tiles/Bone (2).png');
        game.load.image('Bone (3)', 'assets/images/tiles/Bone (3).png');
        game.load.image('Bone (4)', 'assets/images/tiles/Bone (4).png');
        game.load.image('ArrowSign', 'assets/images/objects/ArrowSign.png');
        game.load.image('Bush (1)', 'assets/images/objects/Bush (1).png');
        game.load.image('Bush (2)', 'assets/images/objects/Bush (2).png');
        game.load.image('Crate', 'assets/images/objects/Crate.png');
        game.load.image('DeadBush', 'assets/images/objects/DeadBush.png');
        game.load.image('Skeleton', 'assets/images/objects/Skeleton.png');
        game.load.image('TombStone (1)', 'assets/images/objects/TombStone (1).png');
        game.load.image('TombStone (2)', 'assets/images/objects/TombStone (2).png');
        game.load.image('Tree', 'assets/images/objects/Tree.png');
        game.load.tilemap('map', 'assets/tilemaps/tilemap.json', null, Phaser.Tilemap.TILED_JSON);
    }

    constructor(game: Phaser.Game) {

        let music = game.add.audio('music');
        // music.play();

        let background = game.add.tileSprite(0, 0, WIDTH, HEIGHT, 'background');
        background.fixedToCamera = true;

        let map = game.add.tilemap('map');

        map.addTilesetImage('tileset');
        map.addTilesetImage('Bone (1)');
        map.addTilesetImage('Bone (2)');
        map.addTilesetImage('Bone (3)');
        map.addTilesetImage('Bone (4)');
        map.addTilesetImage('ArrowSign');
        map.addTilesetImage('Bush (1)');
        map.addTilesetImage('Bush (2)');
        map.addTilesetImage('Crate');
        map.addTilesetImage('DeadBush');
        map.addTilesetImage('Skeleton');
        map.addTilesetImage('TombStone (1)');
        map.addTilesetImage('TombStone (2)');
        map.addTilesetImage('Tree');

        map.createFromObjects('background', 21, 'Tree');
        map.createFromObjects('background', 22, 'Skeleton');
        map.createFromObjects('background', 23, 'ArrowSign');
        map.createFromObjects('background', 24, 'Bush (1)');
        map.createFromObjects('background', 25, 'Bush (2)');
        map.createFromObjects('background', 26, 'TombStone (1)');
        map.createFromObjects('background', 27, 'TombStone (2)');
        map.createFromObjects('background', 28, 'DeadBush');

        this.ground = map.createLayer('ground');
        this.ground.resizeWorld();

        game.physics.arcade.enable(this.ground);
        this.ground.body.friction.x = 1;

        map.setCollisionBetween(1, 16, true, 'ground');

        let deco = map.createLayer('deco');
        deco.alpha = 0.5;
    }
}

export {Level1};