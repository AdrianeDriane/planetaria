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
      "At the edge of the Solar System, something stirs…\n" +
      "A formless darkness — the Void Devourer — has begun consuming everything in its path.\n" +
      "Pluto is gone. Neptune trembles.",
  },
  {
    id: "planetary_cores",
    text:
      "Ancient records speak of Planetary Cores — primordial energy sources buried deep within each world.\n" +
      "If all eight cores are reactivated, they will generate a shield powerful enough to repel the Void Devourer.",
  },
  {
    id: "ss_astra",
    text:
      "Aboard the research vessel S.S. Astra, a young Galactic Cadet is on a routine training mission near Mercury.\n" +
      "Nothing about today was supposed to be extraordinary.",
  },
  {
    id: "shockwave",
    text:
      "Without warning, a shockwave tears across the system.\n" +
      "The Void Devourer has reached Uranus. Its gravitational death-pulse slams into the Astra.",
  },
  {
    id: "crash",
    text:
      "Systems fail. Alarms scream.\n" +
      "The S.S. Astra spirals downward and crash-lands on the scorched surface of Mercury.\n" +
      "The journey begins here.",
  },
];
