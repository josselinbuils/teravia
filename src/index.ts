import 'pixi';
import 'p2';
import * as Phaser from 'phaser';

import {Cat} from './cat';
import {Knight} from './knight';
import {Level1} from './level1';

const WIDTH = 1365;
const HEIGHT = 768;

class Teravia {
    private cats;
    private cursors: Phaser.CursorKeys;
    private game: Phaser.Game;
    private knight: Knight;
    private level: Level1;

    constructor() {
        this.game = new Phaser.Game(WIDTH, HEIGHT, Phaser.AUTO, 'content', this);
    }

    preload(game) {
        // game.time.advancedTiming = true;
        Cat.loadAssets(game);
        Level1.loadAssets(game);
        Knight.loadAssets(game);
    }

    create(game) {
        game.physics.startSystem(Phaser.Physics.ARCADE);
        game.physics.arcade.TILE_BIAS = 32;

        this.cursors = game.input.keyboard.createCursorKeys();

        this.level = new Level1(game);

        this.cats = game.add.group();

        for (let i = 0; i < 3; i++) {
            this.cats.add(new Cat(game, 400 + (i * 600), HEIGHT - 205, i % 2 === 0 ? 1 : -1));
        }

        this.knight = new Knight(game, 30, HEIGHT / 2);

        this.game.camera.follow(this.knight);

        game.physics.arcade.gravity.y = 1200;

        game.scale.fullScreenScaleMode = Phaser.ScaleManager.SHOW_ALL;

        let fKey = game.input.keyboard.addKey(Phaser.Keyboard.F);
        fKey.onDown.add(() => game.scale.startFullScreen(), this);

        let escapeKey = game.input.keyboard.addKey(Phaser.Keyboard.ESC);
        escapeKey.onDown.add(() => game.scale.stopFullScreen(), this);
    }

    update() {
        let self = this,
            cursors = this.cursors,
            knight = this.knight;

        // game.debug.text(game.time.fps || '--', 2, 14, '#00ff00');

        this.game.physics.arcade.collide(this.knight, this.level.ground);
        this.game.physics.arcade.collide(this.cats, this.level.ground);

        this.cats.forEach(function (cat) {
            if (cat.alive) {
                self.game.physics.arcade.collide(self.knight, cat, (knight, cat) => knight.isAttacking() && cat.die());
                cat.update();
            }
        });

        let move = false;

        if (cursors.left.isDown) {
            knight.moveLeft();
            move = true;
        }

        if (cursors.right.isDown) {
            knight.moveRight();
            move = true;
        }

        if (cursors.up.isDown) {
            knight.jump();
            move = true;
        } else {
            knight.releaseJumpKey();
        }

        if (!move) {
            knight.idle();
        }
    }

    // render(game) {
        // game.debug.bodyInfo(this.cat.sprite, 32, 32);
        //
        // game.debug.body(this.layer);
        // game.debug.body(this.cats[0].sprite);
    // }
}

window.onload = () => new Teravia();