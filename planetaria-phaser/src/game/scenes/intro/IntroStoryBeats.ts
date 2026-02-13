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
      "At the edge of the Solar System, something stirs…\n\n" +
      "A formless darkness — the Void Devourer — has begun\n" +
      "consuming everything in its path.\n\n" +
      "Pluto is gone. Neptune trembles.",
  },
  {
    id: "planetary_cores",
    text:
      "Ancient records speak of Planetary Cores — primordial\n" +
      "energy sources buried deep within each world.\n\n" +
      "If all eight cores are reactivated, they will generate\n" +
      "a shield powerful enough to repel the Void Devourer.",
  },
  {
    id: "ss_astra",
    text:
      "Aboard the research vessel S.S. Astra, a young\n" +
      "Galactic Cadet is on a routine training mission\n" +
      "near Mercury — the innermost planet.\n\n" +
      "Nothing about today was supposed to be extraordinary.",
  },
  {
    id: "shockwave",
    text:
      "Without warning, a shockwave tears across the system.\n\n" +
      "The Void Devourer has reached Uranus.\n" +
      "Its gravitational death-pulse slams into the Astra.",
  },
  {
    id: "crash",
    text:
      "Systems fail. Alarms scream.\n\n" +
      "The S.S. Astra spirals downward and crash-lands\n" +
      "on the scorched surface of Mercury.\n\n" +
      "The journey begins here.",
  },
];
