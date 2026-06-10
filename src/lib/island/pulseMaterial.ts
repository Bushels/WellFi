import * as THREE from 'three';

// three caches programs keyed (by default) on onBeforeCompile SOURCE TEXT,
// identical for every factory instance — without a unique key the 2nd material
// silently reuses the 1st's COMPILED SHADER TEXT (its uniforms still install,
// but any divergent GLSL edits would be discarded). Unique key = own program.
let pulseMaterialId = 0;

export interface PulseHandle {
  material: THREE.MeshStandardMaterial;
  /** head: 0..1 along the tube's u axis, or -1 to disable. strength: emissive multiplier. width: gaussian half-width in u (default 0.07). */
  setPulse(head: number, strength: number, width?: number): void;
}

// Contract: the mesh using this material must be a TubeGeometry — three maps
// uv.x along the tube length (0=start, 1=end), which is what uHead slides on.
export function createPulseMaterial(opts: {
  base: THREE.MeshStandardMaterialParameters;
  pulseColor: string;
}): PulseHandle {
  const uniforms = {
    uHead: { value: -1 },
    uWidth: { value: 0.07 },
    uStrength: { value: 0 },
    uPulseColor: { value: new THREE.Color(opts.pulseColor) },
  };

  const material = new THREE.MeshStandardMaterial(opts.base);
  material.toneMapped = false; // emission must not be crushed by tone mapping
  material.defines = { ...(material.defines ?? {}), USE_UV: '' };
  const cacheId = pulseMaterialId++;
  material.customProgramCacheKey = () => `pulse-${cacheId}`;
  material.onBeforeCompile = (shader) => {
    Object.assign(shader.uniforms, uniforms);
    shader.fragmentShader = shader.fragmentShader
      .replace(
        '#include <common>',
        '#include <common>\nuniform float uHead;\nuniform float uWidth;\nuniform float uStrength;\nuniform vec3 uPulseColor;',
      )
      .replace(
        '#include <emissivemap_fragment>',
        `#include <emissivemap_fragment>
        if (uHead >= 0.0) {
          float d = (vUv.x - uHead) / uWidth;
          totalEmissiveRadiance += uPulseColor * (uStrength * exp(-d * d));
        }`,
      );
  };

  return {
    material,
    setPulse(head, strength, width = 0.07) {
      uniforms.uHead.value = head;
      uniforms.uStrength.value = strength;
      uniforms.uWidth.value = width;
    },
  };
}
