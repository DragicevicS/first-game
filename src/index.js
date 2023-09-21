import "./style.css";
import Phaser from "phaser";
import sky from "./assets/sky.png";
import platform from "./assets/platform.png";
import dude from "./assets/dude.png";
import star from "./assets/star.png";
import bomb from "./assets/bomb.png";

let stars;
let bombs;
let platforms;
let cursors;
let score = 0;
let gameOver = false;
let scoreText;

class Level extends Phaser.Scene {
  constructor(player) {
    super(player);
    this.player = player;
  }
  preload() {
    this.load.image("sky", sky);
    this.load.image("platform", platform);
    this.load.image("star", star);
    this.load.image("bomb", bomb);
    this.load.spritesheet("dude", dude, {
      frameWidth: 32,
      frameHeight: 48,
    });
  }

  create() {
    this.add.image(400, 300, "sky");

    platforms = this.physics.add.staticGroup();

    platforms.create(400, 568, "platform").setScale(2).refreshBody();

    platforms.create(600, 400, "platform");
    platforms.create(50, 250, "platform");
    platforms.create(750, 220, "platform");

    player = this.physics.add.sprite(100, 450, "dude");

    player.setCollideWorldBounds(true);

    this.anims.create({
      key: "left",
      frames: this.anims.generateFrameNumbers("dude", { start: 0, end: 3 }),
      frameRate: 10,
      repeat: -1,
    });

    this.anims.create({
      key: "turn",
      frames: [{ key: "dude", frame: 4 }],
      frameRate: 20,
    });

    this.anims.create({
      key: "right",
      frames: this.anims.generateFrameNumbers("dude", { start: 5, end: 8 }),
      frameRate: 10,
      repeat: -1,
    });

    cursors = this.input.keyboard.createCursorKeys();

    stars = this.physics.add.group({
      key: "star",
      repeat: 11,
      setXY: { x: 12, y: 0, stepX: 70 },
    });

    stars.children.iterate(function (child) {
      child.setBounceY(Phaser.Math.FloatBetween(0.4, 0.8));
    });

    bombs = this.physics.add.group();

    scoreText = this.add.text(16, 16, "score: 0", {
      fontSize: "32px",
      fill: "#000",
    });

    this.physics.add.collider(player, platforms);
    this.physics.add.collider(stars, platforms);
    this.physics.add.collider(bombs, platforms);

    function collectStar(player, star) {
      star.disableBody(true, true);

      score += 1;
      scoreText.setText("Score: " + score);

      if (stars.countActive(true) === 0) {
        stars.children.iterate(function (child) {
          child.enableBody(true, child.x, 0, true, true);
        });

        var x =
          player.x < 400
            ? Phaser.Math.Between(400, 800)
            : Phaser.Math.Between(0, 400);

        var bomb = bombs.create(x, 16, "bomb");
        bomb.setBounce(1);
        bomb.setCollideWorldBounds(true);
        bomb.setVelocity(Phaser.Math.Between(-200, 200), 20);
        bomb.allowGravity = false;
      }
    }

    this.physics.add.overlap(player, stars, collectStar, null, this);

    function hitBomb(player, bomb) {
      this.physics.pause();

      player.setTint(0xff0000);

      player.anims.play("turn");

      gameOver = true;

      setTimeout(() => location.reload(), 5000);
    }

    this.physics.add.overlap(player, bombs, hitBomb, null, this);
  }

  update() {
    if (gameOver) {
      return;
    }

    if (cursors.left.isDown) {
      player.setVelocityX(-160);

      player.anims.play("left", true);
    } else if (cursors.right.isDown) {
      player.setVelocityX(160);

      player.anims.play("right", true);
    } else {
      player.setVelocityX(0);

      player.anims.play("turn");
    }

    if (cursors.up.isDown && player.body.touching.down) {
      player.setVelocityY(-330);
    }
  }
}

var config = {
  type: Phaser.AUTO,
  width: 800,
  height: 600,
  physics: {
    default: "arcade",
    arcade: {
      gravity: { y: 300 },
      debug: false,
    },
  },
  scene: Level,
};

var game = new Phaser.Game(config);
