import 'pixi';
import 'p2';
import * as Phaser from 'phaser';

const ACC_X = 10000;
const SCALE = 0.1;
const VELOCITY_X = 700;
const VELOCITY_Y = 800;

class Knight extends Phaser.Sprite {

    private canDoubleJump: boolean;
    private currentMove: string;
    private jumpKeyPushed: boolean;
    private jumpTime: number;

    static loadAssets(game: Phaser.Game) {
        game.load.atlasJSONHash('knight-attack', 'assets/sprites/knight/attack.png', 'assets/sprites/knight/attack.json');
        game.load.atlasJSONHash('knight-idle', 'assets/sprites/knight/idle.png', 'assets/sprites/knight/idle.json');
        game.load.atlasJSONHash('knight-jump', 'assets/sprites/knight/jump.png', 'assets/sprites/knight/jump.json');
        game.load.atlasJSONHash('knight-run', 'assets/sprites/knight/run.png', 'assets/sprites/knight/run.json');
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

        this.body.velocity.x = 0;
        this.body.velocity.y = 0;
        this.body.bounce.y = 0;
        this.body.collideWorldBounds = true;

        this.scale.x = SCALE;
        this.scale.y = SCALE;

        this.setAnimation('idle');
    }

    attack(): boolean {
        if (!this.isJumping()) {
            this.setAnimation('attack');
            this.body.acceleration.x = 0;
            this.body.velocity.x = 0;
            return true;
        }
        return false;
    }

    idle() {
        if (!this.isBusy()) {
            this.setAnimation('idle');
            this.body.velocity.x = 0;
        }
        this.body.acceleration.x = 0;
    }

    isAttacking() {
        return this.isPlaying('attack');
    }

    jump() {

        if (this.isAttacking()) {
            return;
        }

        if (!this.jumpKeyPushed) {
            this.setAnimation('jump');

            if (!this.isJumping()) {
                this.body.velocity.y = -VELOCITY_Y;
                this.canDoubleJump = true;
                this.jumpTime = this.game.time.now;
            } else if (this.canDoubleJump && (this.game.time.now - this.jumpTime) < 500) {
                this.body.velocity.y = -Math.round(1.5 * VELOCITY_Y);
                this.canDoubleJump = false;
            }
        }

        this.jumpKeyPushed = true;
    }

    moveLeft() {

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

    moveRight() {

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

    releaseJumpKey() {
        this.jumpKeyPushed = false;
    }

    private isBusy() {
        return this.isJumping() || this.isAttacking();
    }

    private isPlaying(animation) {
        let currentAnim = this.animations.currentAnim;
        return currentAnim.name === animation && currentAnim.isPlaying;
    }

    private isJumping() {
        return this.body && !this.body.blocked.down && !this.body.touching.down;
    }

    private setAnimation(name: string) {
        if (this.currentMove !== name) {
            this.loadTexture('knight-' + name, 0);
            this.animations.play(name);
            this.currentMove = name;
        }
    }
}

export {Knight};