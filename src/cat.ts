import 'pixi';
import 'p2';
import * as Phaser from 'phaser';
import {HealthBar} from './healthbar';
import {Player} from "./player";

const SCALE_BLOOD = 1;
const SCALE_CAT = 1;
const VELOCITY = 100;

class Cat extends Phaser.Sprite {

    private static player: Player;

    private blood: Phaser.Sprite;
    private currentMove: string;
    private healthBar: HealthBar;
    private life: number;
    private playerDetected: boolean;
    private sounds: {
        die: Phaser.Sound,
        meow: Phaser.Sound
    };
    private visibleTimeout: number;
    private xMin: number;
    private xMax: number;

    static loadAssets(game: Phaser.Game): void {
        game.load.atlasJSONHash('cat-blood', 'assets/sprites/cat/blood.png', 'assets/sprites/cat/blood.json');
        game.load.atlasJSONHash('cat-dead', 'assets/sprites/cat/dead.png', 'assets/sprites/cat/dead.json');
        game.load.atlasJSONHash('cat-run', 'assets/sprites/cat/run.png', 'assets/sprites/cat/run.json');
        game.load.atlasJSONHash('cat-walk', 'assets/sprites/cat/walk.png', 'assets/sprites/cat/walk.json');
        game.load.audio('cat-die', 'assets/audio/cat/die.wav');
        game.load.audio('cat-meow', 'assets/audio/cat/meow.m4a');
    }

    constructor(game: Phaser.Game, xMin: number, y: number, sens: number) {
        let xMax = xMin + 400;

        super(game, sens > 0 ? xMin : xMax, y, 'cat-walk');
        game.add.existing(this);

        this.xMin = xMin;
        this.xMax = xMax;

        this.playerDetected = false;

        this.scale.set(sens * SCALE_CAT, SCALE_CAT);
        this.anchor.x = 0.5;

        this.blood = game.add.sprite(0, 0, 'cat-blood');
        this.blood.scale.set(SCALE_BLOOD, SCALE_BLOOD);
        this.blood.anchor.x = 0.5;
        this.blood.visible = false;

        let bloodAnim = this.blood.animations.add('cat-blood', null, 10);
        bloodAnim.onComplete.add(() => {
            this.blood.visible = false;
        }, this);

        let deadAnim = this.animations.add('dead', null, 10);
        deadAnim.onComplete.add(() => {
            this.body = null;
            this.blood.destroy();
        }, this);

        this.animations.add('run', null, 25, true);
        this.animations.add('walk', null, 15, true);
        this.animations.play('walk');

        game.physics.arcade.enable(this);

        this.body.setSize(Math.abs(this.width) - 52, this.height - 10, 23, 7);
        this.body.velocity.x = sens * 100;
        this.body.velocity.y = 0;
        this.body.bounce.y = 0.3;
        this.body.friction = 1;
        this.body.collideWorldBounds = true;

        this.sounds = {
            die: game.add.audio('cat-die'),
            meow: game.add.audio('cat-meow')
        };

        this.life = 100;
        this.alive = true;
    }

    static setPlayer(player: Player) {
        Cat.player = player;
    }

    hurt(): void {
        this.life = Math.max(0, this.life - 100 / 3);

        if (!this.healthBar) {
            this.healthBar = new HealthBar(this.game);
        }

        this.healthBar.setPercent(this.life);
        this.updateHealthBarPosition();
        this.showBlood();

        if (this.life === 0) {
            this.kill();
        } else if (!this.isPlayerVisible()) {
            this.body.velocity.x *= -1;
            this.scale.x *= -1;
        }
    }

    kill(): Phaser.Sprite {
        this.alive = false;
        this.updateBloodPosition(true);
        this.setAnimation('dead');
        this.sounds.die.play();
        this.body.velocity.x = 0;
        this.healthBar.destroy();
        return this;
    }

    update(): void {

        // Useful when dead animation is playing
        if (!this.alive) {
            return;
        }

        if (!this.playerDetected) {
            let sens = this.scale.x / SCALE_CAT;

            if (sens < 0 && this.body.position.x < this.xMin) {
                this.scale.set(SCALE_CAT, SCALE_CAT);
                this.body.velocity.x = VELOCITY;
            } else if (sens > 0 && this.body.position.x > this.xMax) {
                this.scale.set(-SCALE_CAT, SCALE_CAT);
                this.body.velocity.x = -VELOCITY;
            }
        } else if (Math.abs(this.x - Cat.player.x) > 100) {
            let sens = Cat.player.x < this.x ? -1 : 1;
            this.scale.set(sens * SCALE_CAT, SCALE_CAT);
            this.body.velocity.x = sens * VELOCITY * 2;
        } else if (this.isPlayerVisible()) {
            Cat.player.hurt();
        }

        if (this.isPlayerVisible()) {
            this.body.velocity.x = this.scale.x / SCALE_CAT * VELOCITY * 2;

            if (!this.playerDetected) {
                this.setAnimation('run');
                this.sounds.meow.play();
                this.playerDetected = true;
            }

            if (this.visibleTimeout) {
                clearTimeout(this.visibleTimeout);
                this.visibleTimeout = null;
            }

        } else if (this.playerDetected) {
            if (!this.visibleTimeout) {
                this.visibleTimeout = setTimeout(() => {
                    this.body.velocity.x = this.scale.x / SCALE_CAT * VELOCITY;
                    this.setAnimation('walk');
                    this.playerDetected = false;
                    this.visibleTimeout = null;
                }, 3000, this);
            }
        }

        if (this.healthBar) {
            this.updateHealthBarPosition();
        }

        if (this.blood.visible) {
            this.updateBloodPosition();
        }
    }

    private isPlayerVisible(): boolean {
        return ((Cat.player.x < this.x && this.scale.x < 0) || (Cat.player.x > this.x && this.scale.x > 0)) &&
            Math.abs(Cat.player.y - this.y) <= 200 &&
            Math.abs(this.x - Cat.player.x) < 500;
    }

    private showBlood(): void {
        this.blood.visible = true;
        this.updateBloodPosition();
        this.blood.animations.stop();
        this.blood.animations.play('cat-blood');
    }

    private setAnimation(name: string): void {
        if (this.currentMove !== name) {
            this.loadTexture('cat-' + name, 0);
            this.animations.play(name);
            this.currentMove = name;
        }
    }

    private updateBloodPosition(dying = false) {
        let sens = this.scale.x / SCALE_CAT,
            offset = dying ? 20 : 0;
        this.blood.x = this.body.x + (sens < 0 ? 25 + offset : 30 - offset);
        this.blood.y = this.body.y + 10;
        this.blood.scale.set(-sens * SCALE_BLOOD, SCALE_BLOOD);
    }

    private updateHealthBarPosition(): void {
        this.healthBar.setPosition(this.x, this.y - 20);
    }
}

export {Cat};