import Phaser from "phaser";
import { INTRO_CONFIG } from "./IntroTypes";

/**
 * IntroTextRenderer.ts
 *
 * Typewriter text effect for the intro cinematic.
 * Creates a text object that reveals characters one-by-one,
 * and provides methods to skip to completion or check status.
 */
export default class IntroTextRenderer {
  private scene: Phaser.Scene;
  private textObject: Phaser.GameObjects.Text;
  private fullText: string;
  private charIndex: number = 0;
  private typeTimer: Phaser.Time.TimerEvent | null = null;
  private isComplete: boolean = false;

  constructor(
    scene: Phaser.Scene,
    x: number,
    y: number,
    text: string,
    maxWidth: number
  ) {
    this.scene = scene;
    this.fullText = text;

    this.textObject = scene.add
      .text(x, y, "", {
        fontFamily: "monospace",
        fontSize: "16px",
        color: "#ccddff",
        align: "center",
        lineSpacing: 6,
        wordWrap: { width: maxWidth },
      })
      .setOrigin(0.5, 0);

    this.startTyping();
  }

  /* ------------------------------------------------------------------ */
  /*  Typing Control                                                     */
  /* ------------------------------------------------------------------ */

  /** Begin the typewriter animation. */
  private startTyping(): void {
    this.charIndex = 0;
    this.isComplete = false;

    this.typeTimer = this.scene.time.addEvent({
      delay: INTRO_CONFIG.TYPEWRITER_DELAY,
      repeat: this.fullText.length - 1,
      callback: () => {
        this.charIndex++;
        this.textObject.setText(this.fullText.substring(0, this.charIndex));

        if (this.charIndex >= this.fullText.length) {
          this.isComplete = true;
        }
      },
    });
  }

  /** Instantly reveal all remaining text. */
  skipToEnd(): void {
    if (this.isComplete) return;

    this.typeTimer?.remove();
    this.typeTimer = null;
    this.charIndex = this.fullText.length;
    this.textObject.setText(this.fullText);
    this.isComplete = true;
  }

  /** Returns true when all characters have been revealed. */
  getIsComplete(): boolean {
    return this.isComplete;
  }

  /** The total time (ms) the typewriter animation will take. */
  getTotalDuration(): number {
    return this.fullText.length * INTRO_CONFIG.TYPEWRITER_DELAY;
  }

  /** Get the underlying text object (for adding to containers). */
  getTextObject(): Phaser.GameObjects.Text {
    return this.textObject;
  }

  /** Clean up timers. */
  destroy(): void {
    this.typeTimer?.remove();
    this.textObject.destroy();
  }
}
