/**
 * FFmpeg Filters Configuration
 * 60+ уникальных фильтров для обхода перцептивного хеша TikTok
 */

// =============================================
// LEVEL 1: COLOR CORRECTION (базовый уровень)
// =============================================
export const L1_COLOR = {
  // Hue shifts
  hue_shift: (degree) => `hue=h=${degree}`,
  
  // Saturation adjustments
  saturation: (value) => `eq=saturation=${value}`,
  
  // Brightness/Contrast
  brightness: (b, c) => `eq=brightness=${b}:contrast=${c}`,
  
  // Color balance
  colorbalance: (rs, gs, bs) => `colorbalance=rs=${rs}:gs=${gs}:bs=${bs}`,
  
  // Gamma correction
  gamma: (r, g, b) => `eq=gamma_r=${r}:gamma_g=${g}:gamma_b=${b}`,
  
  // Color curves
  curves: (preset) => `curves=preset=${preset}`,
  
  // Vibrance
  vibrance: (intensity) => `vibrance=intensity=${intensity}`,
  
  // Color temperature
  colortemp: (temp) => `colortemperature=temperature=${temp}`,
};

// =============================================
// LEVEL 2: TEXTURE MODIFICATIONS
// =============================================
export const L2_TEXTURE = {
  // Film grain
  grain: (strength) => `noise=alls=${strength}:allf=t`,
  
  // Gaussian blur (minimal)
  blur: (sigma) => `gblur=sigma=${sigma}`,
  
  // Sharpen
  sharpen: (amount) => `unsharp=5:5:${amount}:5:5:0`,
  
  // Vignette
  vignette: (angle) => `vignette=angle=${angle}`,
  
  // Denoise
  denoise: (sigma) => `nlmeans=s=${sigma}`,
  
  // Edge enhancement
  edge_enhance: () => `convolution="0 -1 0 -1 5 -1 0 -1 0:0 -1 0 -1 5 -1 0 -1 0:0 -1 0 -1 5 -1 0 -1 0:0 0 0 0 1 0 0 0 0"`,
  
  // Subtle pixelization
  pixelize: (w, h) => `scale=iw/${w}:ih/${h},scale=iw*${w}:ih*${h}:flags=neighbor`,
};

// =============================================
// LEVEL 3: TEMPORAL MODIFICATIONS
// =============================================
export const L3_TEMPORAL = {
  // Speed adjustment
  speed: (factor) => `setpts=${1/factor}*PTS`,
  
  // Frame interpolation
  fps_change: (fps) => `fps=${fps}`,
  
  // Reverse segments (редко)
  // reverse: () => 'reverse', // применяется к сегментам
  
  // Trim frames
  trim: (start, end) => `trim=start=${start}:end=${end},setpts=PTS-STARTPTS`,
  
  // Fade
  fade_in: (duration) => `fade=t=in:st=0:d=${duration}`,
  fade_out: (duration, total) => `fade=t=out:st=${total - duration}:d=${duration}`,
  
  // Frame blend
  tblend: (mode) => `tblend=all_mode=${mode}`,
};

// =============================================
// LEVEL 4: GEOMETRIC TRANSFORMS (aggressive)
// =============================================
export const L4_GEO = {
  // Scale with padding
  scale_pad: (w, h, padX, padY) => `scale=${w-padX*2}:${h-padY*2},pad=${w}:${h}:${padX}:${padY}`,
  
  // Slight rotation
  rotate: (angle) => `rotate=${angle}*PI/180:fillcolor=black`,
  
  // Flip (mirror)
  hflip: () => 'hflip',
  vflip: () => 'vflip',
  
  // Crop and scale back
  crop_scale: (cropPercent) => {
    const c = cropPercent / 100;
    return `crop=iw*${1-c}:ih*${1-c},scale=iw/${1-c}:ih/${1-c}`;
  },
  
  // Perspective transform (subtle)
  perspective: (x0, y0, x1, y1, x2, y2, x3, y3) => 
    `perspective=${x0}:${y0}:${x1}:${y1}:${x2}:${y2}:${x3}:${y3}`,
  
  // Lens distortion
  lenscorrection: (k1, k2) => `lenscorrection=k1=${k1}:k2=${k2}`,
};

// =============================================
// AUDIO FILTERS
// =============================================
export const AUDIO = {
  // Pitch shift
  pitch: (semitones) => `asetrate=44100*${Math.pow(2, semitones/12)},aresample=44100`,
  
  // Speed (tempo)
  atempo: (factor) => `atempo=${factor}`,
  
  // Volume
  volume: (db) => `volume=${db}dB`,
  
  // Low pass
  lowpass: (freq) => `lowpass=f=${freq}`,
  
  // High pass
  highpass: (freq) => `highpass=f=${freq}`,
  
  // Noise gate
  agate: (threshold) => `agate=threshold=${threshold}`,
  
  // Compressor
  acompressor: () => 'acompressor=threshold=-20dB:ratio=4',
};

// =============================================
// PROFILE PRESETS
// =============================================
export const PROFILES = {
  conservative: {
    name: 'Conservative',
    description: 'Только color-коррекция (L1)',
    levels: ['L1'],
    filters: {
      video: [
        { fn: L1_COLOR.hue_shift, range: [-15, 15] },
        { fn: L1_COLOR.saturation, range: [0.9, 1.1] },
        { fn: L1_COLOR.brightness, range: [[-0.05, 0.05], [0.95, 1.05]] },
      ],
      audio: [
        { fn: AUDIO.volume, range: [-1, 1] },
      ]
    }
  },
  
  moderate: {
    name: 'Moderate',
    description: 'Color + Texture + Temporal (L1-L3)',
    levels: ['L1', 'L2', 'L3'],
    filters: {
      video: [
        // L1
        { fn: L1_COLOR.hue_shift, range: [-20, 20] },
        { fn: L1_COLOR.saturation, range: [0.85, 1.15] },
        { fn: L1_COLOR.brightness, range: [[-0.08, 0.08], [0.92, 1.08]] },
        { fn: L1_COLOR.colorbalance, range: [[-0.1, 0.1], [-0.1, 0.1], [-0.1, 0.1]] },
        // L2
        { fn: L2_TEXTURE.grain, range: [2, 8] },
        { fn: L2_TEXTURE.sharpen, range: [0.3, 0.8] },
        // L3
        { fn: L3_TEMPORAL.speed, range: [0.98, 1.02] },
      ],
      audio: [
        { fn: AUDIO.volume, range: [-2, 2] },
        { fn: AUDIO.pitch, range: [-0.5, 0.5] },
      ]
    }
  },
  
  aggressive: {
    name: 'Aggressive',
    description: 'Все уровни включая geo-трансформации (L1-L4)',
    levels: ['L1', 'L2', 'L3', 'L4'],
    filters: {
      video: [
        // L1
        { fn: L1_COLOR.hue_shift, range: [-30, 30] },
        { fn: L1_COLOR.saturation, range: [0.8, 1.2] },
        { fn: L1_COLOR.brightness, range: [[-0.1, 0.1], [0.9, 1.1]] },
        { fn: L1_COLOR.gamma, range: [[0.9, 1.1], [0.9, 1.1], [0.9, 1.1]] },
        // L2
        { fn: L2_TEXTURE.grain, range: [3, 12] },
        { fn: L2_TEXTURE.blur, range: [0.3, 0.8] },
        { fn: L2_TEXTURE.sharpen, range: [0.2, 1.0] },
        { fn: L2_TEXTURE.vignette, range: [0.3, 0.5] },
        // L3
        { fn: L3_TEMPORAL.speed, range: [0.95, 1.05] },
        { fn: L3_TEMPORAL.fade_in, range: [0.1, 0.3] },
        // L4
        { fn: L4_GEO.crop_scale, range: [1, 3] },
        { fn: L4_GEO.rotate, range: [-1, 1] },
      ],
      audio: [
        { fn: AUDIO.volume, range: [-3, 3] },
        { fn: AUDIO.pitch, range: [-1, 1] },
        { fn: AUDIO.atempo, range: [0.97, 1.03] },
      ]
    }
  }
};

// =============================================
// RANDOM UTILITIES
// =============================================

/**
 * Get random value in range
 */
export function randomInRange(min, max) {
  return Math.random() * (max - min) + min;
}

/**
 * Get random integer in range
 */
export function randomInt(min, max) {
  return Math.floor(randomInRange(min, max + 1));
}

/**
 * Generate random filter value based on range config
 */
export function generateFilterValue(range) {
  if (Array.isArray(range[0])) {
    // Multiple parameters
    return range.map(r => randomInRange(r[0], r[1]).toFixed(3));
  }
  return randomInRange(range[0], range[1]).toFixed(3);
}

/**
 * Build random filter chain for profile
 */
export function buildFilterChain(profileName) {
  const profile = PROFILES[profileName] || PROFILES.moderate;
  const videoFilters = [];
  const audioFilters = [];
  const appliedFilters = [];
  
  // Process video filters
  profile.filters.video.forEach((filter, idx) => {
    // 70% chance to apply each filter
    if (Math.random() < 0.7) {
      const value = generateFilterValue(filter.range);
      const filterStr = Array.isArray(value) 
        ? filter.fn(...value) 
        : filter.fn(value);
      
      if (filterStr) {
        videoFilters.push(filterStr);
        appliedFilters.push({ type: 'video', filter: filterStr });
      }
    }
  });
  
  // Process audio filters
  profile.filters.audio.forEach((filter, idx) => {
    if (Math.random() < 0.6) {
      const value = generateFilterValue(filter.range);
      const filterStr = Array.isArray(value)
        ? filter.fn(...value)
        : filter.fn(value);
      
      if (filterStr) {
        audioFilters.push(filterStr);
        appliedFilters.push({ type: 'audio', filter: filterStr });
      }
    }
  });
  
  return {
    video: videoFilters.join(',') || 'null',
    audio: audioFilters.join(',') || 'anull',
    applied: appliedFilters
  };
}

/**
 * Calculate total combinations for a profile
 */
export function calculateCombinations(profileName) {
  const profile = PROFILES[profileName] || PROFILES.moderate;
  
  // Approximate: each filter has ~100 discrete values
  // Binary choice (apply/not) × values
  const videoCount = profile.filters.video.length;
  const audioCount = profile.filters.audio.length;
  
  // 2^n (apply/not) × 100^n (values) for each filter type
  const videoCombos = Math.pow(2, videoCount) * Math.pow(100, videoCount);
  const audioCombos = Math.pow(2, audioCount) * Math.pow(100, audioCount);
  
  return videoCombos * audioCombos;
}

export default {
  L1_COLOR,
  L2_TEXTURE,
  L3_TEMPORAL,
  L4_GEO,
  AUDIO,
  PROFILES,
  buildFilterChain,
  calculateCombinations,
  randomInRange,
  randomInt,
  generateFilterValue
};
