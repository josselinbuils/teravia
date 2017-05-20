import 'pixi';
import 'p2';
import * as Phaser from 'phaser';
import * as _ from 'underscore';

const ACC_X = 10000;
const SCALE = 1;
const VELOCITY_X = 700;
const VELOCITY_Y = 800;

class Knight extends Phaser.Sprite {

    private canDoubleJump: boolean;
    private currentMove: string;
    private jumpKeyPushed: boolean;
    private jumpTime: number;
    private sounds: {
        attack: Phaser.Sound,
        jump: Phaser.Sound
    };

    static loadAssets(game: Phaser.Game) {
        game.load.atlasJSONHash('knight-attack', 'assets/sprites/knight/attack.png', 'assets/sprites/knight/attack.json');
        game.load.atlasJSONHash('knight-idle', 'assets/sprites/knight/idle.png', 'assets/sprites/knight/idle.json');
        game.load.atlasJSONHash('knight-jump', 'assets/sprites/knight/jump.png', 'assets/sprites/knight/jump.json');
        game.load.atlasJSONHash('knight-run', 'assets/sprites/knight/run.png', 'assets/sprites/knight/run.json');
        game.load.audio('knight-attack', 'assets/audio/knight/attack.wav');
        game.load.audio('knight-jump', 'assets/audio/knight/jump.m4a');
    }

    constructor(game: Phaser.Game, x: number, y: number) {

        super(game, x, y, 'knight-idle');
        game.add.existing(this);

        this.jumpKeyPushed = false;

        let attack = this.animations.add('attack', null, 25);

        // Weird hack to have nice animation
        attack.enableUpdate = true;
        let f = 0;
        attack.onUpdate.add(function () {
            f++;
            if (f === 4) {
                attack.stop();
                f = 0;
            }
        }, this);

        this.animations.add('idle', null, 10, true);
        this.animations.add('jump', null, 20);
        this.animations.add('run', null, 30, true);

        game.physics.arcade.enable(this);

        this.anchor.x = 0.5;

        this.body.setSize(this.width - 15, this.height - 15, 5, 7);
        this.body.velocity.x = 0;
        this.body.velocity.y = 0;
        this.body.bounce.y = 0;
        this.body.collideWorldBounds = true;

        this.scale.x = SCALE;
        this.scale.y = SCALE;

        this.sounds = {
            attack: game.add.audio('knight-attack'),
            jump: game.add.audio('knight-jump')
        };

        this.sounds.jump.volume = 0.3;

        this.attack = _.throttle(this.attack, 200);

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
        return (enemy.x < this.x && this.scale.x < 0) || (enemy.x > this.x && this.scale.x > 0);
    }

    idle(): void {
        if (!this.isBusy()) {
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

        if (this.isAttacking()) {
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

    moveLeft(): void {

        if (this.isAttacking()) {
            return;
        }

        if (!this.isJumping()) {
            this.setAnimation('run');
        }

        this.scale.x = -SCALE;

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

        this.scale.x = SCALE;

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

    private isBusy(): boolean {
        return this.isJumping() || this.isAttacking();
    }

    private isPlaying(animation): boolean {
        let currentAnim = this.animations.currentAnim;
        return currentAnim.name === animation && currentAnim.isPlaying;
    }

    private setAnimation(name: string, restart = false): void {
        if (this.currentMove !== name) {
            this.loadTexture('knight-' + name, 0);
            this.animations.play(name);
            this.currentMove = name;
        } else if (restart) {
            this.animations.stop();
            this.animations.play(name);
        }
    }
}

export {Knight};