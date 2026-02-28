import { describe, it, expect, bench } from 'vitest';
import { FeatureDetection } from '../src/game/scenes/earth/FeatureDetection';

describe('FeatureDetection Logic', () => {
    it('should detect atmosphere (white/grey clouds)', () => {
        // Bright white pixel
        expect(FeatureDetection.analyzeColor(255, 255, 255)).toBe('atmosphere');
        // Very bright cyan-tinted clouds
        expect(FeatureDetection.analyzeColor(220, 240, 250)).toBe('atmosphere');
    });

    it('should detect liquid water (deep blue)', () => {
        // Deep blue ocean pixel
        expect(FeatureDetection.analyzeColor(30, 80, 200)).toBe('liquid_water');
    });

    it('should detect living things (green/brown land)', () => {
        // Green vegetation
        expect(FeatureDetection.analyzeColor(40, 160, 40)).toBe('living_things');
        // Brown/Yellow dirt
        expect(FeatureDetection.analyzeColor(160, 120, 60)).toBe('living_things');
    });

    it('should ignore pure black or transparent pixels', () => {
        expect(FeatureDetection.analyzeColor(0, 0, 0)).toBeNull();
    });

    // Simple performance benchmark
    it('performance check: should process 1,000,000 pixels in under 100ms', () => {
        const start = performance.now();
        for (let i = 0; i < 1_000_000; i++) {
            // Random RGB
            const r = (i % 256);
            const g = (i * 2 % 256);
            const b = (i * 3 % 256);
            FeatureDetection.analyzeColor(r, g, b);
        }
        const end = performance.now();
        const duration = end - start;
        console.log(`Processed 1M pixels in ${duration.toFixed(2)}ms`);
        expect(duration).toBeLessThan(100);
    });
});
