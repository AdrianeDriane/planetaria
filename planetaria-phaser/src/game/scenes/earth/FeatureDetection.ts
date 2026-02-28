/**
 * FeatureDetection.ts
 *
 * Logic for detecting planetary features based on color analysis.
 * Encapsulated for performance testing and modularity.
 */

export interface ColorHSL {
    h: number;
    s: number;
    l: number;
}

export class FeatureDetection {
    /**
     * Helper: Convert RGB to HSL
     * r, g, b: 0-255
     * returns: { h, s, l } all in range 0-1
     */
    static rgbToHsl(r: number, g: number, b: number): ColorHSL {
        r /= 255;
        g /= 255;
        b /= 255;
        const max = Math.max(r, g, b),
            min = Math.min(r, g, b);
        let h = 0,
            s = 0,
            l = (max + min) / 2;

        if (max !== min) {
            const d = max - min;
            s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
            switch (max) {
                case r:
                    h = (g - b) / d + (g < b ? 6 : 0);
                    break;
                case g:
                    h = (b - r) / d + 2;
                    break;
                case b:
                    h = (r - g) / d + 4;
                    break;
            }
            h /= 6;
        }

        return { h, s, l };
    }

    /**
     * Analyzes a single pixel's color to identify if it belongs to a feature.
     * 
     * @param r Red component (0-255)
     * @param g Green component (0-255)
     * @param b Blue component (0-255)
     * @returns The feature ID or null if no feature detected
     */
    static analyzeColor(r: number, g: number, b: number): string | null {
        // Ignore transparent or pure black pixels
        if (r === 0 && g === 0 && b === 0) return null;

        const { h, s, l } = this.rgbToHsl(r, g, b);
        const hDeg = h * 360;

        // 1. ATMOSPHERE / CLOUDS
        // Clouds are bright or low-saturation (white/grey)
        if (l > 0.75 || (l > 0.55 && s < 0.2)) {
            return "atmosphere";
        }

        // 2. LIQUID WATER
        // Water is Deep Blue (H ~170-260)
        if (hDeg > 170 && hDeg < 260 && s > 0.25) {
            return "liquid_water";
        }

        // 3. LIVING THINGS (Land)
        // Green Range: ~60 to ~165 (Vegetation)
        if (hDeg >= 60 && hDeg <= 165 && s > 0.15 && l < 0.65) {
            return "living_things";
        }

        // Brown/Yellow/Dirt Range: ~15 to ~60
        if (hDeg >= 15 && hDeg < 60 && s > 0.15 && l < 0.65) {
             return "living_things";
        }
        
        // Deep Reddish/Brown fallback (Mountains)
        if ((hDeg < 15 || hDeg > 345) && s > 0.15 && l < 0.5) {
            return "living_things";
        }

        return null;
    }
}
