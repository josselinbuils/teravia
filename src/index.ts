import 'pixi';
import 'p2';
import * as Phaser from 'phaser';

import {Cat} from './cat';
import {Knight} from './knight';
import {Level1} from './level1';

const WIDTH = 1365;
const HEIGHT = 768;

class Teravia {
    private cursors: Phaser.CursorKeys;
    private enemies: Phaser.Group;
    private game: Phaser.Game;
    private player: Knight;
    private level: Level1;

    constructor() {
        this.game = new Phaser.Game(WIDTH, HEIGHT, Phaser.AUTO, 'content', this);
    }

    preload(game): void {
        // game.time.advancedTiming = true;
        Cat.loadAssets(game);
        Level1.loadAssets(game);
        Knight.loadAssets(game);
    }

    create(game): void {
        game.physics.startSystem(Phaser.Physics.ARCADE);
        game.physics.arcade.TILE_BIAS = 32;

        this.cursors = game.input.keyboard.createCursorKeys();

        this.level = new Level1(game);

        this.enemies = game.add.group();

        for (let i = 0; i < 3; i++) {
            let enemy = new Cat(game, 400 + (i * 600), HEIGHT - 205, i % 2 === 0 ? 1 : -1);
            this.enemies.add(enemy);
            enemy.events.onDestroy.add(() => this.enemies.remove(enemy), this);
        }

        this.player = new Knight(game, 30, HEIGHT / 2);

        this.game.camera.follow(this.player);

        game.physics.arcade.gravity.y = 3000;

        game.scale.fullScreenScaleMode = Phaser.ScaleManager.SHOW_ALL;

        let fKey = game.input.keyboard.addKey(Phaser.Keyboard.F);
        fKey.onDown.add(() => game.scale.startFullScreen(), this);

        let escapeKey = game.input.keyboard.addKey(Phaser.Keyboard.ESC);
        escapeKey.onDown.add(() => game.scale.stopFullScreen(), this);

        let spaceKey = game.input.keyboard.addKey(Phaser.Keyboard.SPACEBAR);
        spaceKey.onDown.add(() => {
            if (this.player.attack() && !this.player.isJumping()) {
                this.enemies.forEach(function (enemy) {
                    if (enemy.alive && this.player.canHurt(enemy)) {
                        let distance = this.game.physics.arcade.distanceBetween(this.player, enemy);

                        if (distance < 80) {
                            enemy.hurt();
                        }
                    }
                }, this);
            }
        }, this);
    }

    update(): void {
        let self = this,
            cursors = this.cursors,
            player = this.player;

        // game.debug.text(game.time.fps || '--', 2, 14, '#00ff00');

        this.game.physics.arcade.collide(this.player, this.level.ground);
        this.game.physics.arcade.collide(this.enemies, this.level.ground);
        this.enemies.forEach(enemy => enemy.alive && this.game.physics.arcade.collide(self.player, enemy), this);

        let move = false;

        if (cursors.left.isDown) {
            player.moveLeft();
            move = true;
        }

        if (cursors.right.isDown) {
            player.moveRight();
            move = true;
        }

        if (cursors.up.isDown) {
            player.jump();
            move = true;
        } else {
            player.releaseJumpKey();
        }

        if (!move) {
            player.idle();
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