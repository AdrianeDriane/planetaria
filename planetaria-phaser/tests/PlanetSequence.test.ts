import { describe, it, expect } from 'vitest';
import { PLANET_NAMES } from '../src/game/scenes/intro/IntroTypes';

describe('Planet Sequence Validation', () => {
    it('should follow the sequence: Mercury, Venus, Earth, Mars, Jupiter, Saturn, Uranus, Neptune', () => {
        const expected = [
            'Mercury',
            'Venus',
            'Earth',
            'Mars',
            'Jupiter',
            'Saturn',
            'Uranus',
            'Neptune'
        ];
        expect(PLANET_NAMES).toEqual(expected);
    });

    it('should have 8 planets in the intro system', () => {
        expect(PLANET_NAMES).toHaveLength(8);
    });
});
