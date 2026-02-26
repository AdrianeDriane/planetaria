// src/game/scenes/MarsScene.ts
import Phaser from "phaser";
import { EventBus } from "../EventBus";

export const EVENTS = {
  MARS_CORE_REACTIVATED: "mars-core-reactivated",
  NEXT_LEVEL_UNLOCKED: "next-level-unlocked",
};

export default class MarsScene extends Phaser.Scene {
  private atmosphere!: Phaser.GameObjects.Graphics;

  constructor() {
    super("MarsScene");
  }

  preload() {
    this.load.image("mars_bg", "assets/mars/mars_landscape.png");
  }

  create() {
    const { width, height } = this.scale;

    // 1. Background: Red Desert
    this.add
      .image(width / 2, height / 2, "mars_bg")
      .setDisplaySize(width, height);

    // 2. Atmospheric Haze
    this.atmosphere = this.add.graphics();
    this.atmosphere.fillStyle(0xff4500, 0.2); // Orange-Red haze
    this.atmosphere.fillRect(0, 0, width, height);

    // Immediately trigger the puzzle entry since the terminal is gone
    this.time.delayedCall(1000, () => {
      EventBus.emit("enter-mars-scene");
    });

    // 3. Listen for React UI Event (Optional: for background effects on win)
    EventBus.on(
      EVENTS.MARS_CORE_REACTIVATED,
      this.handleCoreReactivation,
      this
    );
  }

  private handleCoreReactivation() {
    // Flash atmosphere/camera when restored
    this.cameras.main.flash(1000, 255, 100, 50);
    
    // Add a subtle glow to the atmosphere
    this.tweens.add({
        targets: this.atmosphere,
        alpha: 0.5,
        duration: 2000,
        yoyo: true,
        repeat: -1
    });

    // Transition to Jupiter (Next Level)
    this.time.delayedCall(4000, () => {
        // Proceed to Jupiter
        console.log("Proceeding to Jupiter...");
        this.scene.start("JupiterScene"); 
    });
  }

  shutdown() {
    EventBus.off(EVENTS.MARS_CORE_REACTIVATED);
  }
}
