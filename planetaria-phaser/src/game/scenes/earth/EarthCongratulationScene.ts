import Phaser from "phaser";
import { EventBus } from "../../EventBus";

/**
 * EarthCongratulationScene.ts
 *
 * A bridge scene that triggers the React-based EarthCongratulationCinematic.
 */

export default class EarthCongratulationScene extends Phaser.Scene {
  constructor() {
    super("EarthCongratulationScene");
  }

  create() {
    const { width, height } = this.scale;

    // Deep space background while transitioning
    this.add.rectangle(0, 0, width, height, 0x000000).setOrigin(0);

    // Trigger React Cinematic
    this.time.delayedCall(500, () => {
      EventBus.emit("start-earth-congratulation");
    });
  }
}
