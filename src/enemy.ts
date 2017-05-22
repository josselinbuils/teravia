import 'pixi';
import 'p2';
import * as Phaser from 'phaser';
import {HealthBar} from './healthbar';
import {Player} from "./player";

const DEFAULT_ANIMATION_FRAMERATE = 10;
const INVINCIBLE_DURATION = 2000;
const VELOCITY = 100;

class Enemy extends Phaser.Sprite {

    sounds: {
        die: Phaser.Sound,
        playerDetected: Phaser.Sound
    };

    private static player: Player;

    private currentMove: string;
    private healthBar: HealthBar;
    private life: number;
    private playerDetected: boolean;
    private texturePrefix: string;
    private visibleTimeout: number;
    private xMin: number;
    private xMax: number;

    constructor(game: Phaser.Game, xMin: number, y: number, sens: number, texturePrefix: string) {
        let xMax = xMin + 400;

        super(game, sens > 0 ? xMin : xMax, y, texturePrefix + '-walk');
        game.add.existing(this);

        this.xMin = xMin;
        this.xMax = xMax;

        this.playerDetected = false;
        this.texturePrefix = texturePrefix;

        this.scale.x = sens;
        this.anchor.x = 0.5;

        game.physics.arcade.enable(this);

        this.body.velocity.x = sens * 100;
        this.body.velocity.y = 0;
        this.body.bounce.y = 0.3;
        this.body.friction = 1;
        this.body.collideWorldBounds = true;

        this.sounds = {
            die: null,
            playerDetected: null
        };

        this.animations.add('dead', null, DEFAULT_ANIMATION_FRAMERATE);
        this.animations.add('run', null, DEFAULT_ANIMATION_FRAMERATE, true);
        this.animations.add('walk', null, DEFAULT_ANIMATION_FRAMERATE, true);

        this.life = 100;

        this.setAnimation('walk');
    }

    static setPlayer(player: Player) {
        Enemy.player = player;
    }

    hurt(): void {
        this.life = Math.max(0, this.life - 100 / 3);

        if (!this.healthBar) {
            this.healthBar = new HealthBar(this.game);
        }

        this.healthBar.setPercent(this.life);
        this.updateHealthBarPosition();

        if (this.life === 0) {
            this.kill();
        } else {

            if (!this.isPlayerVisible()) {
                this.body.velocity.x *= -1;
                this.scale.x *= -1;
            }

            this.x += -this.scale.x * 30;
        }
    }

    kill(): Phaser.Sprite {
        this.alive = false;
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
            let sens = this.scale.x;

            if (sens < 0 && this.body.position.x < this.xMin) {
                this.scale.x = 1;
                this.body.velocity.x = VELOCITY;
            } else if (sens > 0 && this.body.position.x > this.xMax) {
                this.scale.x = -1;
                this.body.velocity.x = -VELOCITY;
            }
        } else if (Math.abs(this.x - Enemy.player.x) > 100) {
            let sens = Enemy.player.x < this.x ? -1 : 1;
            this.scale.x = sens;
            this.body.velocity.x = sens * VELOCITY * 2;
        } else {
            this.body.velocity.x = Math.round(this.scale.x * VELOCITY);

            if (this.canHurtPlayer()) {
                Enemy.player.hurt();
            }
        }

        if (this.isPlayerVisible()) {

            if (!this.playerDetected) {
                this.body.velocity.x = this.scale.x * VELOCITY * 2;
                this.setAnimation('run');
                this.sounds.playerDetected.play();
                this.playerDetected = true;
            }

            if (this.visibleTimeout) {
                clearTimeout(this.visibleTimeout);
                this.visibleTimeout = null;
            }

        } else if (this.playerDetected) {
            if (!this.visibleTimeout) {
                this.visibleTimeout = setTimeout(() => {
                    this.body.velocity.x = this.scale.x * VELOCITY;
                    this.setAnimation('walk');
                    this.playerDetected = false;
                    this.visibleTimeout = null;
                }, INVINCIBLE_DURATION, this);
            }
        }

        if (this.healthBar) {
            this.updateHealthBarPosition();
        }
    }

    private canHurtPlayer(): boolean {
        let distance = this.game.physics.arcade.distanceBetween(this, Enemy.player);

        return distance < 80 && (
                (Enemy.player.x < this.x && this.scale.x < 0 && this.body.touching.left) ||
                (Enemy.player.x > this.x && this.scale.x > 0 && this.body.touching.right)
            );
    }

    private isPlayerVisible(): boolean {
        return ((Enemy.player.x < this.x && this.scale.x < 0) || (Enemy.player.x > this.x && this.scale.x > 0)) &&
            Math.abs(Enemy.player.y - this.y) <= 200 &&
            Math.abs(this.x - Enemy.player.x) < 500;
    }

    private setAnimation(name: string): void {
        if (this.currentMove !== name) {
            this.loadTexture(this.texturePrefix + '-' + name, 0);
            this.animations.play(name);
            this.currentMove = name;
        }
    }

    private updateHealthBarPosition(): void {
        this.healthBar.setPosition(this.x, this.y - 20);
    }
}

export {Enemy};