import type * as THREE from 'three';

/**
 * Frees GPU-side geometry, textures and materials for everything under a
 * node. Three.js disposal is idempotent, so it is safe to call this on
 * objects that also share a base material disposed elsewhere.
 */
export function disposeObject3D(root: THREE.Object3D) {
  root.traverse((obj) => {
    const mesh = obj as THREE.Mesh;
    if (!mesh.isMesh) return;
    mesh.geometry?.dispose();
    const materials = Array.isArray(mesh.material) ? mesh.material : [mesh.material];
    materials.forEach((mat) => {
      const withMap = mat as THREE.Material & { map?: THREE.Texture | null };
      withMap.map?.dispose();
      mat.dispose();
    });
  });
}
