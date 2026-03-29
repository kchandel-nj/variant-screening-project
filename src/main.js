import Phaser from 'phaser';
import { SpinePlugin } from '@esotericsoftware/spine-phaser-v4';

/** Portrait 9:16 — same aspect as Variant games (e.g. 720×1280). */
const VIEW_W = 720;
const VIEW_H = 1280;

// Ground constant
const GROUND_Y = VIEW_H * 0.78;

// Bullet constants
const OBJECT_SPEED = 300;
const OBJECT_MIN_DELAY = 3000; // ms
const OBJECT_MAX_DELAY = 5000; // ms

/** Shared Variant man rig — see public/spine/man/animations.json & ANIMATIONS.md */
const DEMO_WALK = 'Walk';
const DEMO_JUMP = 'Jump';

// Score tracker
let score = 0;

// Phaser.Scene must be the base scene creation platform.
// Presumable all other scenes must extend Phaser.Scene as seen here.
class HelloScene extends Phaser.Scene {
  constructor() {
    super({ key: 'HelloScene' });
    this.hero = null;
    this.walkSpeed = 200; // Initial speed in pixels(?) per second: 200.
    // Obviously changing speed makes them faster or slower.
    // Don't make it negative.
    this.direction = 1; // Initial direction vector, + for right - for left.
  }

  preload() {
    this.load.spineJson('man', '/spine/man/skeleton.json');
    this.load.spineAtlas('manAtlas', '/spine/man/skeleton.atlas', true);
  }

  create() {
    const { width, height } = this.scale;

    const gfx = this.make.graphics({ x: 0, y: 0, add: false });
    gfx.fillStyle(0xff4444);
    gfx.fillRect(0, 0, 80, 80);
    gfx.generateTexture('obstacle', 80, 80);
    gfx.destroy();

    this.add
      .text(width / 2, 20, 'Hello world — shared man Spine walks (public/spine/man/)', {
        fontSize: '14px',
        color: '#eaeaea',
        fontFamily: 'system-ui, sans-serif'
      })
      .setOrigin(0.5, 0);

    this.add
      .text(width / 2, 44, 'Gray silhouette = CDN placeholder base sheet; npm run copy-spine for real skin', {
        fontSize: '11px',
        color: '#8a9',
        fontFamily: 'system-ui, sans-serif'
      })
      .setOrigin(0.5, 0);
    
    this.scoreText = this.add
      .text(width / 2, 64, 'Score: ' + score, {
        fontSize: '20px',
        color: '#e8e8e8',
        fontFamily: 'system-ui, sans-serif'
      })
      .setOrigin(0.5, 0);

      // Create a ground
      this.ground = this.add.rectangle(VIEW_W / 2, GROUND_Y, VIEW_W, 20);
      this.ground.setVisible(false);
      this.physics.add.existing(this.ground, true);

    // Physics group
    this.obstacles = this.physics.add.group();

    this.hero = this.add.spine(width * 0.2, GROUND_Y - 50, 'man', 'manAtlas');

    // Collision detection
    this.physics.add.overlap(this.hero, this.obstacles, this.onHit, null, this);

    // Adding physics to the hero.
    this.physics.add.existing(this.hero);
    this.hero.body.setCollideWorldBounds(true);
    this.hero.body.setSize(180, 1000);
    this.hero.body.setOffset(40, 0);
    this.physics.add.collider(this.hero, this.ground);
    
    this.hero.setDepth(10);
    this.hero.setScale(0.14); // Set relative size of the character? Initial: 0.28
    this.hero.animationState.data.defaultMix = 0.15;
    this.hero.animationState.setAnimation(0, DEMO_WALK, true);
    this.hero.skeleton.scaleX = Math.abs(this.hero.skeleton.scaleX);

    // Creating an actual physics jump.
    const doJump = () => {
      if (this.hero.body.blocked.down){
      this.hero.animationState.setAnimation(0, DEMO_JUMP, false);
      this.hero.animationState.addAnimation(0, DEMO_WALK, true, 0);
      this.hero.body.setVelocityY(-250);
    }
      // Since up is negative, and gravity already exists, I just need to set the velocity and done.
    }

    // Detects when the space key pressed to trigger jump.
    this.input.keyboard?.on('keydown-SPACE', doJump);

    this.input.on('pointerdown', doJump);

    this.spawnObstacle();

    this.add
      .text(width / 2, height - 36, 'Animations: public/spine/man/animations.json & ANIMATIONS.md', {
        fontSize: '16px',
        color: '#889'
      })
      .setOrigin(0.5, 1);
  }

  update(_, deltaMs) { // Runs every "tick"/frame?
    if (!this.hero) return; // Updates only run on the hero.
    const dt = deltaMs / 1000;
    const w = this.scale.width;
    this.hero.x += this.walkSpeed * this.direction * dt;

    // Detects if hero is on the edge of the screen, and flips the direction if so.
    const margin = 36; // A constant number of pixels(?) Initial: 72
    if (this.hero.x > w - margin) {
      this.hero.x = w - margin;
      this.direction = -1;
      this.hero.skeleton.scaleX = -Math.abs(this.hero.skeleton.scaleX);
      this.hero.body.setSize(-180, 1000);
      this.hero.body.setOffset(40, 0);
    } else if (this.hero.x < margin) {
      this.hero.x = margin;
      this.direction = 1;
      this.hero.skeleton.scaleX = Math.abs(this.hero.skeleton.scaleX);
      this.hero.body.setSize(180, 1000);
      this.hero.body.setOffset(40, 0);
    }

    // Delete bullets that go off screen.
    this.obstacles.getChildren().forEach(obj => {
      if (obj.x < -200 || obj.x > VIEW_W + 200) {
      obj.destroy();
      // Increment score if object is destroyed off screen.
      score++;
      this.scoreText.setText('Score: ' + score);
      console.log(score);
      }
    });
  }

  spawnObstacle() {
    // Choose between spawning from left or right
    const fromLeft = Phaser.Math.Between(0, 1) === 0;
    const x = fromLeft ? -50 : VIEW_W + 50;
    const velocityX = fromLeft ? OBJECT_SPEED : -OBJECT_SPEED;

    // Spawn object
    const obj = this.obstacles.create(x, GROUND_Y, 'obstacle');
    obj.setDepth(100);
    obj.body.setAllowGravity(false);
    obj.body.setVelocityX(velocityX);

    // Spawn the next object
    const delay = Phaser.Math.Between(OBJECT_MIN_DELAY, OBJECT_MAX_DELAY);
    this.time.delayedCall(delay, () => this.spawnObstacle());
  }

  // What happens when bullet collides with hero?
  onHit(hero, obstacle) {
    obstacle.destroy();
    score--;
  }
}

const config = {
  type: Phaser.WEBGL,
  parent: 'app',
  width: VIEW_W,
  height: VIEW_H,
  backgroundColor: '#2d2d44',
  scene: [HelloScene], // Similar to a level?
  plugins: {
    scene: [{ key: 'SpinePlugin', plugin: SpinePlugin, mapping: 'spine' }]
  },
  scale: {
    mode: Phaser.Scale.FIT,
    autoCenter: Phaser.Scale.CENTER_BOTH
  },
  physics: {
    default: 'arcade',
    arcade: {
      gravity: {y: 300},
      debug: true
    }
  }
};

// Officially creates the game object that runs in browser.
new Phaser.Game(config);
