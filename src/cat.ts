import 'pixi';
import 'p2';
import * as Phaser from 'phaser';
import {HealthBar} from './healthbar';

const SCALE_BLOOD = 0.2;
const SCALE_CAT = 1;
const VELOCITY = 100;

class Cat extends Phaser.Sprite {

    private blood: Phaser.Sprite;
    private currentMove: string;
    private healthBar: HealthBar;
    private life: number;
    private player: Phaser.Sprite;
    private playerDetected: boolean;
    private xMin: number;
    private xMax: number;

    static loadAssets(game: Phaser.Game): void {
        game.load.atlasJSONHash('cat-dead', 'assets/sprites/cat/dead.png', 'assets/sprites/cat/dead.json');
        game.load.atlasJSONHash('cat-run', 'assets/sprites/cat/run.png', 'assets/sprites/cat/run.json');
        game.load.atlasJSONHash('cat-walk', 'assets/sprites/cat/walk.png', 'assets/sprites/cat/walk.json');
        game.load.atlasJSONHash('blood', 'assets/sprites/blood.png', 'assets/sprites/blood.json');
    }

    constructor(game: Phaser.Game, player: Phaser.Sprite, xMin: number, y: number, sens: number) {
        let xMax = xMin + 400;

        super(game, sens > 0 ? xMin : xMax, y, 'cat-walk');
        game.add.existing(this);

        this.player = player;
        this.xMin = xMin;
        this.xMax = xMax;

        this.playerDetected = false;

        this.scale.set(sens * SCALE_CAT, SCALE_CAT);
        this.anchor.x = 0.5;

        this.blood = game.add.sprite(0, 0, 'blood');
        this.blood.scale.set(SCALE_BLOOD, SCALE_BLOOD);
        this.blood.anchor.x = 0.5;
        this.blood.visible = false;

        this.blood.animations.add('blood', null, 10);


        let deadAnim = this.animations.add('dead', null, 10);
        deadAnim.onComplete.add(() => {
            this.destroy();
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
        this.body.collideWorldBounds = true;
        // this.body.immovable = true;

        this.life = 100;
        this.alive = true;
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
        } else if (!this.hasSamePlayerDirection()) {
            this.body.velocity.x *= -1;
            this.scale.x *= -1;
        }
    }

    kill(): Phaser.Sprite {
        let sens = this.body.velocity.x / VELOCITY;

        this.alive = false;

        this.setAnimation('dead');

        this.blood.visible = true;
        this.blood.x = this.body.x + (sens < 0 ? 55 : 5);
        this.blood.y = this.body.y + 50;
        this.blood.scale.set(-sens * SCALE_BLOOD, SCALE_BLOOD);
        this.blood.animations.play('blood');
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
        } else {
            let sens = this.player.x < this.x ? -1 : 1;
            this.scale.set(sens * SCALE_CAT, SCALE_CAT);
            this.body.velocity.x = sens * VELOCITY * 2;
        }

        let distance = this.game.physics.arcade.distanceBetween(this.player, this),
            isVisible = Math.abs(this.player.y - this.y) <= 200;

        if (isVisible && distance < 500) {
            if (this.hasSamePlayerDirection()) {
                this.body.velocity.x = this.scale.x / SCALE_CAT * VELOCITY * 2;
                this.setAnimation('run');
                this.playerDetected = true;
            }
        } else {
            this.body.velocity.x = this.scale.x / SCALE_CAT * VELOCITY;
            this.setAnimation('walk');
            this.playerDetected = false;
        }

        if (this.healthBar) {
            this.updateHealthBarPosition();
        }
    }

    private hasSamePlayerDirection(): boolean {
        return (this.player.x < this.x && this.scale.x < 0) || (this.player.x > this.x && this.scale.x > 0);
    }

    private setAnimation(name: string): void {
        if (this.currentMove !== name) {
            this.loadTexture('cat-' + name, 0);
            this.animations.play(name);
            this.currentMove = name;
        }
    }

    private updateHealthBarPosition(): void {
        this.healthBar.setPosition(this.x, this.y - 20);
    }
}

export {Cat};