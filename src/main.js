import Phaser from 'phaser';
import { SpinePlugin } from '@esotericsoftware/spine-phaser-v4';

/** Portrait 9:16 — same aspect as Variant games (e.g. 720×1280). */
const VIEW_W = 720;
const VIEW_H = 1280;

// Ground constant
const GROUND_Y = VIEW_H * 0.78;

/** Shared Variant man rig — see public/spine/man/animations.json & ANIMATIONS.md */
const DEMO_WALK = 'Walk';
const DEMO_JUMP = 'Jump';

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

      // Create a ground
      this.ground = this.add.rectangle(VIEW_W / 2, GROUND_Y, VIEW_W, 20);
      this.ground.setVisible(false);
      this.physics.add.existing(this.ground, true);

    this.hero = this.add.spine(width * 0.2, GROUND_Y - 50, 'man', 'manAtlas');

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
      //this.hero.animationState.setAnimation(0, DEMO_JUMP, false);
      //this.hero.animationState.addAnimation(0, DEMO_WALK, true, 0);
      this.hero.body.setVelocityY(-250);
      // Since up is negative, and gravity already exists, I just need to set the velocity and done.
    }

    // Detects when the space key pressed to trigger jump.
    this.input.keyboard?.on('keydown-SPACE', doJump);
    /*this.input.keyboard?.on('keydown-SPACE', () => { 
      // Set animation forces the jump.
      this.hero.animationState.setAnimation(0, DEMO_JUMP, false);
      // Add animation waits for jump animation to finish before starting the walk again.
      this.hero.animationState.addAnimation(0, DEMO_WALK, true, 0);
    });*/

    this.input.on('pointerdown', doJump);

    /*
    First actual addition I make:
    Make the character also jump on a mouse click.
    Copying the old jump code and looking up how to detect mouse clicks.
    */
   /*this.input.on('pointerdown', () => { 
      this.hero.animationState.setAnimation(0, DEMO_JUMP, false);
      this.hero.animationState.addAnimation(0, DEMO_WALK, true, 0);
    });*/

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
