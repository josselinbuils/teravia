// From https://github.com/bmarwane/phaser.healthbar

class HealthBar {
    private barSprite: Phaser.Sprite;
    private bgSprite: Phaser.Sprite;
    private config: any;
    private flipped: boolean;
    private game: Phaser.Game;
    private x: number;
    private y: number;

    constructor(game: Phaser.Game, providedConfig = {}) {
        this.game = game;

        this.setupConfiguration(providedConfig);
        this.setPosition(this.config.x, this.config.y);
        this.drawBackground();
        this.drawHealthBar();
        this.setFixedToCamera(this.config.isFixedToCamera);
        this.setPercent(100);
    }

    kill() {
        this.bgSprite.kill();
        this.barSprite.kill();
    }

    setFixedToCamera(fixedToCamera: boolean) {
        this.bgSprite.fixedToCamera = fixedToCamera;
        this.barSprite.fixedToCamera = fixedToCamera;
    }

    setPercent(newValue: number) {
        newValue = Math.max(Math.min(newValue, 100), 0) / 100;
        this.config.bar.color = HealthBar.getColor(newValue);
        let width = this.barSprite.width;
        this.barSprite.kill();
        this.drawHealthBar();
        this.barSprite.width = width;
        this.setWidth(newValue * this.config.width);
    };

    setPosition(x: number, y: number) {
        this.x = x;
        this.y = y;

        if (this.bgSprite !== undefined && this.barSprite !== undefined) {
            this.bgSprite.position.x = x;
            this.bgSprite.position.y = y;

            this.barSprite.position.x = x - this.config.width / 2;
            this.barSprite.position.y = y;
        }
    }

    private drawBackground() {
        let bmd = this.game.add.bitmapData(this.config.width, this.config.height);
        bmd.ctx.fillStyle = this.config.bg.color;
        bmd.ctx.beginPath();
        bmd.ctx.rect(0, 0, this.config.width, this.config.height);
        bmd.ctx.fill();

        this.bgSprite = this.game.add.sprite(this.x, this.y, bmd);
        this.bgSprite.anchor.set(0.5);

        if (this.flipped) {
            this.bgSprite.scale.x = -1;
        }
    }

    private drawHealthBar() {
        let bmd = this.game.add.bitmapData(this.config.width, this.config.height);
        bmd.ctx.fillStyle = this.config.bar.color;
        bmd.ctx.beginPath();
        bmd.ctx.rect(0, 0, this.config.width, this.config.height);
        bmd.ctx.fill();

        this.barSprite = this.game.add.sprite(this.x - this.bgSprite.width / 2, this.y, bmd);
        this.barSprite.anchor.y = 0.5;

        if (this.flipped) {
            this.barSprite.scale.x = -1;
        }
    }

    private static getColor(value: number) {
        let hue = (value * 90).toString(10);
        return 'hsl(' + hue + ', 100%, 50%)';
    }

    private mergeObjetcs(targetObj: object, newObj: object) {
        for (let p in newObj) {
            try {
                targetObj[p] = newObj[p].constructor == Object ? this.mergeObjetcs(targetObj[p], newObj[p]) : newObj[p];
            } catch (e) {
                targetObj[p] = newObj[p];
            }
        }
        return targetObj;
    }

    private mergeWithDefaultConfiguration(newConfig: object) {
        let defaultConfig = {
            width: 50,
            height: 7,
            x: 0,
            y: 0,
            bg: {
                color: '#651828'
            },
            bar: {
                color: '#FEFF03'
            },
            animationDuration: 200,
            flipped: false,
            isFixedToCamera: false
        };

        return this.mergeObjetcs(defaultConfig, newConfig);
    }

    private setupConfiguration(providedConfig: object) {
        this.config = this.mergeWithDefaultConfiguration(providedConfig);
        this.flipped = this.config.flipped;
    }

    private setWidth(newWidth: number) {
        if (this.flipped) {
            newWidth = -1 * newWidth;
        }
        this.game.add.tween(this.barSprite).to({width: newWidth}, this.config.animationDuration, Phaser.Easing.Linear.None, true);
    }
}

export {HealthBar};