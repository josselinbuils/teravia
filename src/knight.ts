import 'pixi';
import 'p2';
import * as Phaser from 'phaser';
import {Player} from "./player";

class Knight extends Player {

    static loadAssets(game: Phaser.Game) {
        Player.loadAssets(game);
        game.load.atlasJSONHash('knight-attack', 'assets/sprites/knight/attack.png', 'assets/sprites/knight/attack.json');
        game.load.atlasJSONHash('knight-dead', 'assets/sprites/knight/dead.png', 'assets/sprites/knight/dead.json');
        game.load.atlasJSONHash('knight-idle', 'assets/sprites/knight/idle.png', 'assets/sprites/knight/idle.json');
        game.load.atlasJSONHash('knight-jump', 'assets/sprites/knight/jump.png', 'assets/sprites/knight/jump.json');
        game.load.atlasJSONHash('knight-run', 'assets/sprites/knight/run.png', 'assets/sprites/knight/run.json');
        game.load.audio('knight-attack', 'assets/audio/knight/attack.wav');
    }

    constructor(game: Phaser.Game, x: number, y: number) {

        super(game, x, y, 'knight');

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

        this.animations.getAnimation('dead').speed = 10;
        this.animations.getAnimation('idle').speed = 10;
        this.animations.getAnimation('jump').speed = 20;
        this.animations.getAnimation('run').speed = 30;

        this.body.setSize(this.width - 15, this.height - 15, 5, 7);

        this.sounds.attack = game.add.audio('knight-attack');

        this.setAnimation('idle');
    }
}

export {Knight};