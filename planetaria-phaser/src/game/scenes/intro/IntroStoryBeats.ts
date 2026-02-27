import { StoryBeat } from "./IntroTypes";
/**
 * IntroStoryBeats.ts
 *
 * Defines the narrative beats for the intro cinematic sequence.
 * Each beat has a unique ID that maps to a visual builder in the
 * beats/ directory.
 */
export const STORY_BEATS: StoryBeat[] = [
  {
    id: "void_approach",
    text:
      "At the edge of our Solar System, a dark force is waking up.\n" +
      "This 'Void Devourer' is swallowing everything in its path.\n" +
      "Pluto is already gone, and Neptune is next.",
  },
  {
    id: "planetary_cores",
    text:
      "To stop it, you must find the Planetary Cores—ancient energy sources hidden inside every world.\n" +
      "If you turn on all eight cores, they will create a shield to drive the darkness away.",
  },
  {
    id: "ss_astra",
    text:
      "You are a Galactic Cadet on a research Spaceship.\n" +
      "You were on a simple training mission near Mercury when the trouble began.",
  },
  {
    id: "shockwave",
    text:
      "Suddenly, a massive shockwave hits the ship.\n" +
      "The Void Devourer has reached Uranus, and its power is tearing the Spaceship apart.",
  },
  {
    id: "crash",
    text:
      "Alarms scream as your ship lose control.\n" +
      "The Spaceship crashes onto the rocky surface of Mercury.\n" +
      "The mission to save the Solar System starts now.",
  },
];
