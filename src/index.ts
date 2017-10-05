import 'pixi';
import 'p2';
import * as Phaser from 'phaser-ce';

import { Cat } from './cat';
import { Knight } from './knight';
import { Level1 } from './level1';
import { Player } from './player';
import { Enemy } from './enemy';

const WIDTH = 1365;
const HEIGHT = 768;
const TILE_BIAS = 32;

class Teravia {
    private cursors: Phaser.CursorKeys;
    private enemies: Phaser.Group;
    private game: Phaser.Game;
    private level: Level1;
    private player: Player;

    constructor() {
        this.game = new Phaser.Game(WIDTH, HEIGHT, Phaser.AUTO, 'content', this);
    }

    preload(): void {
        this.game.time.advancedTiming = true;
        Cat.loadAssets(this.game);
        Level1.loadAssets(this.game);
        Knight.loadAssets(this.game);
    }

    create(): void {
        this.game.physics.startSystem(Phaser.Physics.ARCADE);

        // TILE_BIAS is an unknown property
        (<any> this.game.physics.arcade).TILE_BIAS = TILE_BIAS;

        this.cursors = this.game.input.keyboard.createCursorKeys();

        this.level = new Level1(this.game);

        this.enemies = this.game.add.group();

        for (let i = 0; i < 4; i++) {
            this.enemies.add(<Enemy> new Cat(this.game, 400 + (i * 750), HEIGHT - 205, i % 2 === 0 ? 1 : -1));
        }

        this.enemies.add(<Enemy> new Cat(this.game, 415, HEIGHT - 480, 1));
        this.enemies.add(<Enemy> new Cat(this.game, 4680, HEIGHT - 205, 1));

        // Must be added after enemies
        this.player = new Knight(this.game, 30, HEIGHT / 2);
        Cat.setPlayer(this.player);

        this.game.camera.follow(this.player);

        this.game.physics.arcade.gravity.y = 3000;

        this.game.scale.scaleMode = Phaser.ScaleManager.SHOW_ALL;
        this.game.scale.fullScreenScaleMode = Phaser.ScaleManager.SHOW_ALL;
        this.game.scale.setResizeCallback(this.setMaxDimensions, this);

        let fKey = this.game.input.keyboard.addKey(Phaser.Keyboard.F);
        fKey.onDown.add(() => {
            if (this.game.scale.isFullScreen) {
                this.game.scale.stopFullScreen();
            } else {
                this.game.scale.startFullScreen();
            }
        }, this);

        let escapeKey = this.game.input.keyboard.addKey(Phaser.Keyboard.ESC);
        escapeKey.onDown.add(() => this.game.scale.stopFullScreen(), this);

        let spaceKey = this.game.input.keyboard.addKey(Phaser.Keyboard.SPACEBAR);
        spaceKey.onDown.add(() => {
            if (this.player.attack()) {
                this.enemies.forEach(function (enemy) {
                    if (enemy.alive && this.player.canHurt(enemy)) {
                        enemy.hurt();
                    }
                }, this);
            }
        }, this);
    }

    update(): void {
        let cursors = this.cursors,
            player = this.player;

        this.game.physics.arcade.collide(this.player, this.level.ground);
        this.game.physics.arcade.collide(this.enemies, this.level.ground);

        if (this.player.alive) {
            this.enemies.forEach(enemy => enemy.alive && this.game.physics.arcade.collide(this.player, enemy), this);

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
    }

    render(): void {
        this.game.debug.text(this.game.time.fps.toString() || '--', this.game.width - 30, 20, '#2b5158');
        // this.game.debug.bodyInfo(this.player, 32, 32);
        // this.game.debug.body(this.player);
        // this.game.debug.body(<Phaser.Sprite> this.enemies.getAt(0));
    }

    private setMaxDimensions() {
        const gameRatio = this.game.scale.sourceAspectRatio;
        const screenRatio = window.innerWidth / window.innerHeight;
        const scaleToWidth = screenRatio < gameRatio;
        const maxWidth = Math.min(scaleToWidth ? window.innerWidth : window.innerHeight * gameRatio, WIDTH);
        const maxHeight = Math.min(scaleToWidth ? window.innerWidth / gameRatio : window.innerHeight, HEIGHT);
        this.game.scale.setMinMax(0, 0, maxWidth, maxHeight);
    }
}

window.onload = () => new Teravia();