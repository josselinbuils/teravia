import 'pixi';
import 'p2';
import * as Phaser from 'phaser';
import * as _ from 'underscore';
import {HealthBar} from './healthbar';

const ACC_X = 10000;
const DEFAULT_ANIMATION_FRAMERATE = 10;
const VELOCITY_X = 700;
const VELOCITY_Y = 800;

class Player extends Phaser.Sprite {

    sounds: {
        attack: Phaser.Sound,
        jump: Phaser.Sound
    };

    private canDoubleJump: boolean;
    private currentMove: string;
    private healthBar: HealthBar;
    private jumpKeyPushed: boolean;
    private jumpTime: number;
    private life: number;
    private texturePrefix: string;

    static loadAssets(game: Phaser.Game) {
        game.load.audio('player-jump', 'assets/audio/player/jump.m4a');
    }

    constructor(game: Phaser.Game, x: number, y: number, texturePrefix: string) {

        super(game, x, y, texturePrefix + '-idle');
        game.add.existing(this);

        this.texturePrefix = texturePrefix;
        this.jumpKeyPushed = false;

        game.physics.arcade.enable(this);

        this.anchor.x = 0.5;

        this.body.velocity.x = 0;
        this.body.velocity.y = 0;
        this.body.bounce.y = 0;
        this.body.collideWorldBounds = true;

        this.sounds = {
            attack: null,
            jump: game.add.audio('player-jump')
        };

        this.sounds.jump.volume = 0.3;

        this.healthBar = new HealthBar(game, {
            x: 95,
            y: 25,
            width: 150,
            height: 15,
            fixedToCamera: true
        });

        this.life = 100;

        this.attack = _.throttle(this.attack, 200);
        this.hurt = _.throttle(this.hurt, 500);

        let deadAnim = this.animations.add('dead', null, DEFAULT_ANIMATION_FRAMERATE);
        deadAnim.onComplete.add(() => this.body = null, this);

        this.animations.add('idle', null, DEFAULT_ANIMATION_FRAMERATE, true);
        this.animations.add('jump', null, DEFAULT_ANIMATION_FRAMERATE);
        this.animations.add('run', null, DEFAULT_ANIMATION_FRAMERATE, true);

        this.setAnimation('idle');
    }

    attack(): boolean {
        if (!this.isJumping()) {
            this.setAnimation('attack', true);
            this.sounds.attack.play();
            this.body.acceleration.x = 0;
            this.body.velocity.x = Math.round(this.body.velocity.x / 2);
            return true;
        }
        return false;
    }

    canHurt(enemy: Phaser.Sprite): boolean {
        let distance = this.game.physics.arcade.distanceBetween(this, enemy);
        return distance < 80 && ((enemy.x < this.x && this.scale.x < 0) || (enemy.x > this.x && this.scale.x > 0));
    }

    hurt(): void {
        this.life -= 5;
        this.healthBar.setPercent(this.life);

        if (this.life <= 0) {
            this.kill();
        } else {
            this.tint = 0xFF0000;
            setTimeout(() => this.tint = 0xFFFFFF, 100, this);
        }
    }

    idle(): void {
        if (!this.isJumping() && !this.isAttacking()) {
            this.setAnimation('idle');
            this.body.velocity.x = 0;
        }
        this.body.acceleration.x = 0;
    }

    isAttacking(): boolean {
        return this.isPlaying('attack');
    }

    isJumping(): boolean {
        return this.body && !this.body.blocked.down && !this.body.touching.down;
    }

    jump(): void {

        if (this.isAttacking() || !this.alive) {
            return;
        }

        if (!this.jumpKeyPushed) {
            if (!this.isJumping()) {
                this.body.velocity.y = -VELOCITY_Y;
                this.canDoubleJump = true;
                this.jumpTime = this.game.time.now;
                this.setAnimation('jump', true);
                this.sounds.jump.play();
            } else if (this.canDoubleJump && (this.game.time.now - this.jumpTime) < 500) {
                this.body.velocity.y = -Math.round(1.5 * VELOCITY_Y);
                this.canDoubleJump = false;
                this.setAnimation('jump', true);
                this.sounds.jump.play();
            }
        }

        this.jumpKeyPushed = true;
    }

    kill(): Phaser.Sprite {
        this.alive = false;
        this.setAnimation('dead');
        // this.sounds.die.play();
        this.body.velocity.x = 0;
        return this;
    }

    moveLeft(): void {

        if (this.isAttacking()) {
            return;
        }

        if (!this.isJumping()) {
            this.setAnimation('run');
        }

        this.scale.x = -1;

        if (this.body.velocity.x > -VELOCITY_X) {
            this.body.acceleration.x = -ACC_X;
        } else {
            this.body.acceleration.x = 0;
            this.body.velocity.x = -VELOCITY_X;
        }
    }

    moveRight(): void {

        if (this.isAttacking()) {
            return;
        }

        if (!this.isJumping()) {
            this.setAnimation('run');
        }

        this.scale.x = 1;

        if (this.body.velocity.x < VELOCITY_X) {
            this.body.acceleration.x = ACC_X;
        } else {
            this.body.acceleration.x = 0;
            this.body.velocity.x = VELOCITY_X;
        }
    }

    releaseJumpKey(): void {
        this.jumpKeyPushed = false;
    }

    setAnimation(name: string, restart = false): void {
        if (this.currentMove !== name) {
            this.loadTexture(this.texturePrefix + '-' + name, 0);
            this.animations.play(name);
            this.currentMove = name;
        } else if (restart) {
            this.animations.stop();
            this.animations.play(name);
        }
    }

    private isPlaying(animation): boolean {
        let currentAnim = this.animations.currentAnim;
        return currentAnim.name === animation && currentAnim.isPlaying;
    }
}

export {Player};