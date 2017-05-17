import 'pixi';
import 'p2';
import * as Phaser from 'phaser';

const SCALE_BLOOD = 0.2;
const SCALE_CAT = 0.2;
const VELOCITY = 100;

class Cat extends Phaser.Sprite {

    alive: boolean;

    private blood: Phaser.Sprite;
    private xMin: number;
    private xMax: number;

    static loadAssets(game: Phaser.Game) {
        game.load.atlasJSONHash('cat-dead', 'assets/sprites/cat/dead.png', 'assets/sprites/cat/dead.json');
        game.load.atlasJSONHash('cat-walk', 'assets/sprites/cat/walk.png', 'assets/sprites/cat/walk.json');
        game.load.atlasJSONHash('blood', 'assets/sprites/blood.png', 'assets/sprites/blood.json');
    }

    constructor(game: Phaser.Game, xMin: number, y: number, sens: number) {
        let xMax = xMin + 400;

        super(game, sens > 0 ? xMin : xMax, y, 'cat-walk');
        game.add.existing(this);

        this.xMin = xMin;
        this.xMax = xMax;

        this.scale.set(sens * SCALE_CAT, SCALE_CAT);
        this.anchor.x = 0.5;

        this.blood = game.add.sprite(0, 0, 'blood');
        this.blood.scale.set(SCALE_BLOOD, SCALE_BLOOD);
        this.blood.anchor.x = 0.5;
        this.blood.visible = false;

        let sprite = this;

        let bloodAnim = this.blood.animations.add('blood', null, 10);
        bloodAnim.killOnComplete = true;

        let deadAnim = this.animations.add('dead', null, 10);
        deadAnim.killOnComplete = true;

        this.animations.add('walk', null, 15, true);
        this.animations.play('walk');

        game.physics.arcade.enable(sprite);

        this.body.velocity.x = sens * 100;
        this.body.velocity.y = 0;
        this.body.bounce.y = 0.3;
        this.body.collideWorldBounds = true;
        this.body.immovable = true;

        this.alive = true;
    }

    die() {
        if (this.alive) {
            let sens = this.body.velocity.x / VELOCITY;
            this.alive = false;
            this.loadTexture('cat-dead', 0);
            this.animations.play('dead');
            this.blood.visible = true;
            this.blood.x = this.body.x + (sens < 0 ? 55 : 5);
            this.blood.y = this.body.y + 50;
            this.blood.scale.set(-sens * SCALE_BLOOD, SCALE_BLOOD);
            this.blood.animations.play('blood');
            this.body.velocity.x = 0;
        } else {
            this.position.y -= 1;
        }
    }

    update() {

        if (!this.alive) {
            return;
        }

        let sens = this.body.velocity.x / VELOCITY;

        if (sens < 0 && this.body.position.x < this.xMin) {
            this.scale.set(SCALE_CAT, SCALE_CAT);
            this.body.velocity.x = VELOCITY;
        } else if (sens > 0 && this.body.position.x > this.xMax) {
            this.scale.set(-SCALE_CAT, SCALE_CAT);
            this.body.velocity.x = -VELOCITY;
        }
    }
}

export {Cat};