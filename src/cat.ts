import 'pixi';
import 'p2';
import * as Phaser from 'phaser';
import {Enemy} from './enemy';

class Cat extends Enemy {

    private blood: Phaser.Sprite;

    static loadAssets(game: Phaser.Game): void {
        game.load.atlasJSONHash('cat-blood', 'assets/sprites/cat/blood.png', 'assets/sprites/cat/blood.json');
        game.load.atlasJSONHash('cat-dead', 'assets/sprites/cat/dead.png', 'assets/sprites/cat/dead.json');
        game.load.atlasJSONHash('cat-run', 'assets/sprites/cat/run.png', 'assets/sprites/cat/run.json');
        game.load.atlasJSONHash('cat-walk', 'assets/sprites/cat/walk.png', 'assets/sprites/cat/walk.json');
        game.load.audio('cat-die', 'assets/audio/cat/die.wav');
        game.load.audio('cat-meow', 'assets/audio/cat/meow.m4a');
    }

    constructor(game: Phaser.Game, xMin: number, y: number, sens: number) {

        super(game, xMin, y, sens, 'cat');

        this.blood = game.add.sprite(0, 0, 'cat-blood');
        this.blood.anchor.x = 0.5;
        this.blood.visible = false;

        let bloodAnim = this.blood.animations.add('cat-blood', null, 10);
        bloodAnim.onComplete.add(() => {
            this.blood.visible = false;
        }, this);

        let deadAnim = this.animations.getAnimation('run');
        deadAnim.speed = 10;
        deadAnim.onComplete.add(() => {
            this.body = null;
            this.blood.destroy();
        }, this);

        this.animations.getAnimation('run').speed = 25;
        this.animations.getAnimation('walk').speed = 15;

        this.body.setSize(Math.abs(this.width) - 52, this.height - 10, 23, 7);

        this.sounds.die = game.add.audio('cat-die');
        this.sounds.playerDetected = game.add.audio('cat-meow');
    }

    hurt(): void {
        super.hurt();
        this.showBlood();
    }

    kill(): Phaser.Sprite {
        super.kill();
        this.updateBloodPosition(true);
        return this;
    }

    update(): void {
        super.update();

        if (this.alive && this.blood.visible) {
            this.updateBloodPosition();
        }
    }

    private showBlood(): void {
        this.blood.visible = true;
        this.updateBloodPosition();
        this.blood.animations.stop();
        this.blood.animations.play('cat-blood');
    }

    private updateBloodPosition(dying = false) {
        let offset = dying ? 20 : 0;
        this.blood.x = this.body.x + (this.scale.x < 0 ? 25 + offset : 30 - offset);
        this.blood.y = this.body.y + 10;
        this.blood.scale.x = -this.scale.x;
    }
}

export {Cat};