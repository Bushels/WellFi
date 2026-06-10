import * as THREE from 'three';

export interface PulseHandle {
  material: THREE.MeshStandardMaterial;
  /** head: 0..1 along the tube's u axis, or -1 to disable. strength: emissive multiplier. */
  setPulse(head: number, strength: number): void;
}

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
    setPulse(head, strength) {
      uniforms.uHead.value = head;
      uniforms.uStrength.value = strength;
    },
  };
}
