import Phaser from "phaser";

/**
 * JupiterIntroScene.ts
 *
 * Final "To Be Continued" screen for the current available scenes.
 */

export default class JupiterIntroScene extends Phaser.Scene {
  constructor() {
    super("JupiterIntroScene");
  }

  create() {
    const { width, height } = this.scale;

    // Dark Space Background
    this.add.rectangle(0, 0, width, height, 0x000000).setOrigin(0);

    // Success Header
    this.add
      .text(width / 2, height * 0.3, "MISSION LOG: COMPLETE", {
        font: "bold 24px 'Courier New'",
        color: "#00ffcc",
      })
      .setOrigin(0.5);

    // Body Text
    this.add
      .text(
        width / 2,
        height * 0.5,
        `You have successfully analyzed
Mercury, Venus, Earth, and Mars.

The S.S. Astra is now refueling for the
outer planetary expedition.`,
        {
          font: "14px 'Courier New'",
          color: "#ffffff",
          align: "center",
          lineSpacing: 8,
        }
      )
      .setOrigin(0.5); // Jupiter Coming Soon
    this.add
      .text(width / 2, height * 0.7, "JUPITER SECTOR: COMING SOON", {
        font: "italic 16px 'Courier New'",
        color: "#ffaa00",
      })
      .setOrigin(0.5);

    // Back to Menu Button
    const btn = this.add
      .rectangle(width / 2, height * 0.85, 200, 40, 0x00ffcc, 0.2)
      .setStrokeStyle(1, 0x00ffcc)
      .setInteractive({ useHandCursor: true });
    this.add
      .text(width / 2, height * 0.85, "RETURN TO MENU", {
        font: "bold 14px 'Courier New'",
        color: "#00ffcc",
      })
      .setOrigin(0.5);

    btn.on("pointerdown", () => {
      window.location.reload(); // Simple way to go back to initial React state
    });

    this.cameras.main.fadeIn(1000, 0, 0, 0);
  }
}
