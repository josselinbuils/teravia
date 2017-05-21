import 'pixi';
import 'p2';
import * as Phaser from 'phaser';

import {Cat} from './cat';
import {HealthBar} from './healthbar';
import {Knight} from './knight';
import {Level1} from './level1';

const WIDTH = 1365;
const HEIGHT = 768;
const TILE_BIAS = 32;

class Teravia {
    private cursors: Phaser.CursorKeys;
    private enemies: Phaser.Group;
    private game: Phaser.Game;
    private healthBar: HealthBar;
    private level: Level1;
    private player: Knight;

    constructor() {
        this.game = new Phaser.Game(WIDTH, HEIGHT, Phaser.AUTO, 'content', this);
    }

    preload(game: Phaser.Game): void {
        // game.time.advancedTiming = true;
        Cat.loadAssets(game);
        Level1.loadAssets(game);
        Knight.loadAssets(game);
    }

    create(game: Phaser.Game): void {
        game.physics.startSystem(Phaser.Physics.ARCADE);

        Teravia.setTileBias(game);

        this.cursors = game.input.keyboard.createCursorKeys();

        this.level = new Level1(game);

        this.healthBar = new HealthBar(game, {
            x: 95,
            y: 25,
            width: 150,
            height: 15,
            fixedToCamera: true
        });

        this.enemies = game.add.group();

        for (let i = 0; i < 4; i++) {
            this.enemies.add(new Cat(this.game, 400 + (i * 750), HEIGHT - 205, i % 2 === 0 ? 1 : -1));
        }

        this.enemies.add(new Cat(this.game, 415, HEIGHT - 480, 1));
        this.enemies.add(new Cat(this.game, 4680, HEIGHT - 205, 1));

        // Must be added after enemies
        this.player = new Knight(game, 30, HEIGHT / 2);
        Cat.setPlayer(this.player);

        game.camera.follow(this.player);

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

    update(game: Phaser.Game): void {
        let self = this,
            cursors = this.cursors,
            player = this.player;

        // game.debug.text(game.time.fps || '--', 2, 14, '#00ff00');

        game.physics.arcade.collide(this.player, this.level.ground);
        game.physics.arcade.collide(this.enemies, this.level.ground);
        game.physics.arcade.collide(this.enemies, this.enemies);

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

    render(game: Phaser.Game): void {
        // game.debug.bodyInfo(this.player, 32, 32);
        // game.debug.body(this.player);
        // game.debug.body(this.enemies.getAt(0));
    }

    // game has type any because TILE_BIAS is not known as property
    private static setTileBias(game: any): void {
        game.physics.arcade.TILE_BIAS = TILE_BIAS;
    }
}

window.onload = () => new Teravia();