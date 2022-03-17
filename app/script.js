// Pie-Ball
/*^*^*^*^*^*^*^*
script.js
The main script for Pie-Ball.
*^*^*^*^*^*^*^*/

// ********** Main Game Scene **********
let game = {
  pieAngle: 0,
  pieDir: -2,
  holdDur: 0,
  sfx: {},
  playerFrozen: false
};
class Game extends Phaser.Scene {
  constructor(key, levelNum, normalCount, fastCount, cheaterCount, multiCount) {
    super(key);
    this.enemyCount = {
      "normal": normalCount,
      "fast": fastCount,
      "cheater": cheaterCount,
      "multi": multiCount
    };
    this.levelNum = levelNum;
  }
  preload() {
    // Load assets
    this.load.image("player", "assets/player.png");
    this.load.image("boundaries", "assets/boundaries.png");
    this.load.image("pie", "assets/pie.png");
    this.load.image("arrow", "assets/arrow.png");
    this.load.image("meter", "assets/meter.png");
    this.load.image("meterIndicator", "assets/meterIndicator.png");
    this.load.image("reloadBar", "assets/reloadBar.png");
    this.load.image("enemy", "assets/enemy.png");
    this.load.image("fastEnemy", "assets/fastEnemy.png");
    this.load.image("multiEnemy", "assets/multiEnemy.png");
    this.load.image("cheaterEnemy", "assets/cheaterEnemy.png");
    this.load.image("boss", "assets/boss.png");
    this.load.image("floor0", "assets/floor0.png");
    this.load.image("floor1", "assets/floor1.png");
    this.load.image("floor2", "assets/floor2.png");
    this.load.audio("music", "assets/music.mp3");
    this.load.audio("hit", "assets/hit.wav");
    this.load.audio("ready", "assets/ready.wav");
    this.load.audio("throw", "assets/throw.wav");
  }
  create() {
    game.engine = new Engine(this);
    game.engine.mouseInput();

    // Sounds
    game.sfx.music = this.sound.add("music").setLoop(true).play({volume: 0.5});
    game.sfx.hit = this.sound.add("hit");
    game.sfx.ready = this.sound.add("ready");
    game.sfx.throw = this.sound.add("throw");

    // Create groups
    game.boundaries = this.physics.add.group();
    game.pies = this.physics.add.group();
    game.enemyPies = this.physics.add.group();
    game.enemies = this.physics.add.group();

    // Create the floor
    for (var x = 0; x < Math.round(game.engine.gameWidth * 8); x += 64) {
      for (var y = 0; y < Math.round(game.engine.gameHeight * 8); y += 64) {
        this.add.image(x, y, `floor${Math.floor(Math.random() * 3)}`).setScale(8);
      }
    }

    // Create player
    game.player = this.physics.add.sprite(game.engine.gameWidthCenter, 3 * (game.engine.gameHeight / 4), "player").setScale(8).setGravityY(-1500).setDrag(500).setSize(5, 3).setOffset(0, 0).setCollideWorldBounds(true);
    game.playerFrozen = false;

    // Create boundary
    for (var i = 0; i < 400 * Math.round(game.engine.gameWidth / 400) + 1; i += 400) {
      game.boundaries.create(i, game.engine.gameHeightCenter, "boundaries").setScale(8).setSize(400, 1).setOffset(0, 0).setImmovable(true).setGravityY(-1500);
    }

    // Create arrow
    game.arrow = this.physics.add.staticSprite(game.player.x - 10, game.player.y - 20, "arrow").setScale(8).setGravityY(-1500);

    // Create meter
    game.meter = this.add.image(120, game.engine.gameHeightCenter, "meter").setScale(8).setDepth(1);
    game.meterIndicator = this.add.image(120, game.engine.gameHeightCenter + 256, "meterIndicator").setScale(8).setDepth(1);

    // Create reload bar
    game.reloadBar = this.add.image(game.engine.gameWidth - 80, game.engine.gameHeightCenter, "reloadBar").setScale(8).setDepth(1);
    game.reloadBarStuff = this.add.rectangle(game.engine.gameWidth - 84, game.reloadBar.y - 272, 56, 0, 0x000000).setDepth(1);

    // Create enemies
    for (var i = 0; i < this.enemyCount["normal"]; i++) {
      let enemy = game.enemies.create(game.engine.gameWidthCenter, game.engine.gameHeight / 4, "enemy").setScale(8).setGravityY(-1500).setSize(5, 3).setOffset(0, 0).setCollideWorldBounds(true);
      enemy.pieTimerMax = game.engine.randomBetween(50, 500);
      enemy.pieTimer = 0;
    }
    for (var i = 0; i < this.enemyCount["fast"]; i++) {
      let enemy = game.enemies.create(game.engine.gameWidthCenter, game.engine.gameHeight / 4, "fastEnemy").setScale(8).setGravityY(-1500).setSize(5, 3).setOffset(0, 0).setCollideWorldBounds(true);
      enemy.pieTimerMax = game.engine.randomBetween(50, 250);
      enemy.pieTimer = 0;
    }
    for (var i = 0; i < this.enemyCount["multi"]; i++) {
      let enemy = game.enemies.create(game.engine.gameWidthCenter, game.engine.gameHeight / 4, "multiEnemy").setScale(8).setGravityY(-1500).setSize(5, 3).setOffset(0, 0).setCollideWorldBounds(true);
      enemy.pieTimerMax = game.engine.randomBetween(50, 250);
      enemy.pieTimer = 0;
    }
    for (var i = 0; i < this.enemyCount["cheater"]; i++) {
      let enemy = game.enemies.create(game.engine.gameWidthCenter, game.engine.gameHeight / 4, "cheaterEnemy").setScale(8).setGravityY(-1500).setSize(5, 3).setOffset(0, 0).setCollideWorldBounds(true);
      enemy.pieTimerMax = game.engine.randomBetween(50, 500);
      enemy.pieTimer = 0;
      enemy.lives = 2;
    }
    if (this.levelNum === 4) {
      let enemy = game.enemies.create(game.engine.gameWidthCenter, game.engine.gameHeight / 4, "boss").setScale(8).setGravityY(-1500).setSize(8, 4).setOffset(0, 0).setCollideWorldBounds(true);
      enemy.pieTimerMax = game.engine.randomBetween(1, 50);
      enemy.pieTimer = 0;
      enemy.lives = 3;
    }

    // ********** Colliders **********
    this.physics.add.collider(game.player, game.boundaries);
    this.physics.add.collider(game.player, game.enemyPies);
    this.physics.add.collider(game.enemies, game.boundaries);
    this.physics.add.collider(game.pies, game.pies);
    this.physics.add.collider(game.pies, game.enemyPies);
    this.physics.add.collider(game.enemies, game.pies, (enemy, pie) => {
      game.sfx.hit.play();
      if (enemy.texture.key === "cheaterEnemy" || enemy.texture.key === "boss") {
        enemy.lives--;
        if (enemy.lives <= 0) {
          enemy.destroy();
        }
      } else {
        enemy.destroy();
      }
      pie.destroy();
    });

    // ********** Interaction **********
    this.input.on("pointerup", () => {
      if (game.reloadBarStuff.height >= 544) {
        game.sfx.throw.play();
        let pie = game.pies.create(game.player.x, game.player.y, "pie").setScale(8).setGravityY(-1500).setSize(6, 4).setOffset(0, 0);
        this.physics.velocityFromAngle(game.pieAngle, game.holdDur * 1.5, pie.body.velocity);
        game.meterIndicator.y = game.engine.gameHeightCenter + 256;
        game.holdDur = 0;
        game.reloadBarStuff.height = 0;
      }
    });

    // ********** Timers **********
    this.time.addEvent({
      delay: 2000,
      callback: () => {
        game.enemies.getChildren().forEach(enemy => {
          if (enemy.texture.key === "fastEnemy" || enemy.texture.key === "boss") {
            enemy.setVelocityY(game.engine.randomBetween(-600, 600));
            enemy.setVelocityX(game.engine.randomBetween(-600, 600));
          } else {
            enemy.setVelocityY(game.engine.randomBetween(-300, 300));
            enemy.setVelocityX(game.engine.randomBetween(-300, 300));
          }
        });
      },
      callbackScope: this,
      repeat: -1
    });
  }
  update() {
    // Player movement
    if (!game.playerFrozen) {
      if (this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.A).isDown) {
        game.player.setVelocityX(-300);
        game.pieDir = -2;
      }
      if (this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.D).isDown) {
        game.player.setVelocityX(300);
        game.pieDir = 2;
      }
      if (this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.S).isDown) {
        game.player.setVelocityY(300);
      }
      if (this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.W).isDown) {
        game.player.setVelocityY(-300);
      }
    }
    if (game.engine.mouseDown && game.holdDur < 500 && game.reloadBarStuff.height >= 544) {
      game.holdDur += 5;
      game.meterIndicator.y = (game.engine.gameHeightCenter + 256) - game.holdDur;
    }
    if (game.reloadBarStuff.height < 544) {
      game.reloadBarStuff.height += 5;
    }
    if (game.reloadBarStuff.height === 540) {
      game.sfx.ready.play();
    }
    game.pieAngle += game.pieDir;
    game.arrow.x = game.player.x - 10;
    game.arrow.y = game.player.y - 20;
    game.arrow.angle = game.pieAngle + 160;
    game.enemies.getChildren().forEach(enemy => {
      enemy.pieTimer++;
      if (enemy.pieTimer >= enemy.pieTimerMax) {
        game.enemyPies.create(enemy.x, enemy.y, "pie").setScale(8).setGravityY(-1500).setSize(6, 4).setOffset(0, 0).setVelocityY(300).setVelocityX(game.engine.randomBetween(-500, 500));
        if (enemy.texture.key === "multiEnemy") {
          game.enemyPies.create(enemy.x, enemy.y, "pie").setScale(8).setGravityY(-1500).setSize(6, 4).setOffset(0, 0).setVelocityY(300).setVelocityX(game.engine.randomBetween(-500, 500));
        }
        enemy.pieTimerMax = game.engine.randomBetween(100, 500);
        if (enemy.texture.key === "fastEnemy") {
          enemy.pieTimerMax = game.engine.randomBetween(50, 250);
        }
        if (enemy.texture.key === "boss") {
          enemy.pieTimerMax = game.engine.randomBetween(1, 50);
        }
        enemy.pieTimer = 0;
      }
    });
    let phaser = this;
    if (game.enemies.getChildren().length === 0) {
      setTimeout(function () {
        game.playerFrozen = true;
        phaser.scene.stop();
        phaser.scene.start(`PiFact${this.levelNum}`);
      }, 1000);
    }
  }
}

// ********** Start Scene **********
class Start extends Phaser.Scene {
  constructor() {
    super("Start");
  }
  preload() {
    this.load.image("title", "assets/title.png");
    this.load.image("start", "assets/start.png");
    this.load.image("picker", "assets/picker.png");
  }
  create() {
    this.engine = new Engine(this);

    // Create title
    this.add.image(this.engine.gameWidthCenter, this.engine.gameHeight / 4, "title").setScale(8);

    // Picker group
    this.pickerGroup = this.physics.add.staticGroup();

    // Create start button
    let phaser = this;
    this.startButton = this.add.image(this.engine.gameWidthCenter, (this.engine.gameHeight / 4) * 3, "start").setScale(8).setInteractive();
    this.startButton.on("pointerup", () => {
      this.scene.stop();
      this.scene.start("Boss");
    });
    this.startButton.on("pointerover", () => {
      phaser.pickerGroup.create(phaser.startButton.x - 160, phaser.startButton.y - 8, "picker").setScale(8);
      phaser.pickerGroup.create(phaser.startButton.x + 100, phaser.startButton.y - 8, "picker").setScale(8).flipX = true;
    });
    this.startButton.on("pointerout", () => {
      phaser.pickerGroup.getChildren().forEach(picker => {
        picker.visible = false;
      });
    });
  }
}

// ********** Levels **********
class Level1 extends Game {
  constructor() {
    super("Level1", 1, 4, 1, 0, 0);
  }
}
class Level2 extends Game {
  constructor() {
    super("Level2", 2, 3, 1, 1, 0);
  }
}
class Level3 extends Game {
  constructor() {
    super("Level3", 3, 1, 2, 1, 1);
  }
}
class Boss extends Game {
  constructor() {
    super("Boss", 4, 0, 0, 0, 0);
  }
}

// ********** Cutscenes **********
class PiFact extends Phaser.Scene {
  constructor(key, factNum) {
    super(key);
    this.factNum = factNum;
  }
  preload() {
    // Load assets
    this.load.image("pi", "assets/pi.png");
    this.load.image("piFact1", "assets/piFact1.png");
    this.load.image("piFact2", "assets/piFact2.png");
    this.load.image("piFact3", "assets/piFact3.png");
  }
  create() {
    this.engine = new Engine(this);

    // Create pi symbol
    this.add.image(this.engine.gameWidthCenter, this.engine.gameHeight / 4, "pi").setScale(8);

    // Create the fact
    this.add.image(this.engine.gameWidthCenter, (this.engine.gameHeight / 4) * 3, `piFact${this.factNum}`).setScale(8);

    // Transition to next scene
    this.input.on("pointerup", () => {
      this.scene.stop();
      this.scene.start(`Level${this.factNum + 1}`);
    });
  }
}
class PiFact1 extends PiFact {
  constructor() {
    super("PiFact1", 1);
  }
}
class PiFact2 extends PiFact {
  constructor() {
    super("PiFact2", 2);
  }
}
class PiFact3 extends PiFact {
  constructor() {
    super("PiFact3", 3);
  }
}
