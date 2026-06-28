import * as THREE from 'three';

/**
 * Exports a list of Three.js Meshes to a binary STL file (ArrayBuffer)
 */
export function exportSTL(meshes: THREE.Mesh[]): ArrayBuffer {
  let totalTriangles = 0;

  const meshData = meshes.map(mesh => {
    const geometry = mesh.geometry;
    const positionAttribute = geometry.getAttribute('position') as THREE.BufferAttribute;
    
    if (!positionAttribute) {
      return { triCount: 0, positionAttribute: null, indexAttribute: null, matrix: mesh.matrixWorld };
    }

    const indexAttribute = geometry.getIndex();
    let triCount = 0;

    if (indexAttribute) {
      triCount = indexAttribute.count / 3;
    } else {
      triCount = positionAttribute.count / 3;
    }

    totalTriangles += triCount;
    mesh.updateMatrixWorld(true);

    return {
      triCount,
      positionAttribute,
      indexAttribute,
      matrix: mesh.matrixWorld
    };
  });

  // Binary STL: 84 bytes header + (Triangle Count * 50) bytes
  const bufferSize = 84 + (totalTriangles * 50);
  const buffer = new ArrayBuffer(bufferSize);
  const view = new DataView(buffer);

  // Write header
  const headerText = 'Exported from 3D Generator Engine client-side exporter';
  for (let i = 0; i < Math.min(headerText.length, 80); i++) {
    view.setUint8(i, headerText.charCodeAt(i));
  }

  // Write triangle count
  view.setUint32(80, totalTriangles, true);

  let offset = 84;
  const v1 = new THREE.Vector3();
  const v2 = new THREE.Vector3();
  const v3 = new THREE.Vector3();
  const normal = new THREE.Vector3();

  for (const data of meshData) {
    const { triCount, positionAttribute, indexAttribute, matrix } = data;
    if (triCount === 0 || !positionAttribute) continue;

    for (let i = 0; i < triCount; i++) {
      let idx1 = i * 3;
      let idx2 = i * 3 + 1;
      let idx3 = i * 3 + 2;

      if (indexAttribute) {
        idx1 = indexAttribute.getX(idx1);
        idx2 = indexAttribute.getX(idx2);
        idx3 = indexAttribute.getX(idx3);
      }

      // Read vertices and transform using mesh's world matrix
      v1.fromBufferAttribute(positionAttribute, idx1).applyMatrix4(matrix);
      v2.fromBufferAttribute(positionAttribute, idx2).applyMatrix4(matrix);
      v3.fromBufferAttribute(positionAttribute, idx3).applyMatrix4(matrix);

      // Compute geometric normal vector
      const edge1 = new THREE.Vector3().subVectors(v2, v1);
      const edge2 = new THREE.Vector3().subVectors(v3, v1);
      normal.crossVectors(edge1, edge2).normalize();

      // Write Normal (X, Y, Z)
      view.setFloat32(offset, normal.x, true);
      view.setFloat32(offset + 4, normal.y, true);
      view.setFloat32(offset + 8, normal.z, true);

      // Write Vertex 1 (X, Y, Z)
      view.setFloat32(offset + 12, v1.x, true);
      view.setFloat32(offset + 16, v1.y, true);
      view.setFloat32(offset + 20, v1.z, true);

      // Write Vertex 2 (X, Y, Z)
      view.setFloat32(offset + 24, v2.x, true);
      view.setFloat32(offset + 28, v2.y, true);
      view.setFloat32(offset + 32, v2.z, true);

      // Write Vertex 3 (X, Y, Z)
      view.setFloat32(offset + 36, v3.x, true);
      view.setFloat32(offset + 40, v3.y, true);
      view.setFloat32(offset + 44, v3.z, true);

      // Write attribute byte count (uint16 = 0)
      view.setUint16(offset + 48, 0, true);

      offset += 50;
    }
  }

  return buffer;
}

/**
 * Triggers a browser file download of the STL data
 */
export function downloadSTL(buffer: ArrayBuffer, filename: string): void {
  const blob = new Blob([buffer], { type: 'application/octet-stream' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  
  URL.revokeObjectURL(url);
}
export function getTriangleCount(meshes: THREE.Mesh[]): number {
  let count = 0;
  for (const mesh of meshes) {
    const pos = mesh.geometry.getAttribute('position');
    const idx = mesh.geometry.getIndex();
    if (pos) {
      count += idx ? idx.count / 3 : pos.count / 3;
    }
  }
  return count;
}
