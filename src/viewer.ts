import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';

export class ThreeViewer {
  private container: HTMLElement;
  private scene!: THREE.Scene;
  private camera!: THREE.PerspectiveCamera;
  private renderer!: THREE.WebGLRenderer;
  private controls!: OrbitControls;
  private activeMeshes: THREE.Mesh[] = [];

  constructor(container: HTMLElement) {
    this.container = container;
    this.initScene();
    this.initLights();
    this.initControls();
    this.animate();

    window.addEventListener('resize', this.onWindowResize.bind(this));
  }

  private initScene() {
    this.scene = new THREE.Scene();
    this.scene.background = null; // transparent to allow CSS backgrounds

    this.camera = new THREE.PerspectiveCamera(
      45,
      this.container.clientWidth / this.container.clientHeight,
      1,
      1000
    );
    this.camera.position.set(90, 110, 130);

    this.renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    this.renderer.setSize(this.container.clientWidth, this.container.clientHeight);
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    this.renderer.shadowMap.enabled = true;
    this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;

    this.container.appendChild(this.renderer.domElement);

    // Subtle grid helper
    const gridHelper = new THREE.GridHelper(200, 40, 0x4facfe, 0x1f2937);
    gridHelper.position.y = -0.5;
    const gridMat = gridHelper.material as THREE.Material;
    gridMat.opacity = 0.2;
    gridMat.transparent = true;
    this.scene.add(gridHelper);
  }

  private initLights() {
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.4);
    this.scene.add(ambientLight);

    const dirLight1 = new THREE.DirectionalLight(0xffffff, 0.85);
    dirLight1.position.set(80, 120, 60);
    dirLight1.castShadow = true;
    dirLight1.shadow.mapSize.width = 1024;
    dirLight1.shadow.mapSize.height = 1024;
    dirLight1.shadow.bias = -0.001;
    this.scene.add(dirLight1);

    const dirLight2 = new THREE.DirectionalLight(0x4facfe, 0.5);
    dirLight2.position.set(-80, 60, -60);
    this.scene.add(dirLight2);

    const hemiLight = new THREE.HemisphereLight(0xffffff, 0x111827, 0.3);
    this.scene.add(hemiLight);
  }

  private initControls() {
    this.controls = new OrbitControls(this.camera, this.renderer.domElement);
    this.controls.enableDamping = true;
    this.controls.dampingFactor = 0.05;
    this.controls.maxPolarAngle = Math.PI / 2 + 0.05;
    this.controls.minDistance = 25;
    this.controls.maxDistance = 300;
    this.controls.target.set(25, 20, 0);
  }

  /**
   * Sets new meshes in the viewport, safely disposing of old ones.
   */
  public setMeshes(meshes: THREE.Mesh[]) {
    // Clear old active meshes and free up GPU resources
    for (const mesh of this.activeMeshes) {
      this.scene.remove(mesh);
      if (mesh.geometry) mesh.geometry.dispose();
      // Note: materials are shared and managed at app-level, but can be disposed if needed.
    }

    this.activeMeshes = [...meshes];

    // Add new meshes to the scene
    for (const mesh of this.activeMeshes) {
      this.scene.add(mesh);
    }

    // Automatically recalculate bounding box to adjust camera focus center
    if (this.activeMeshes.length > 0) {
      const box = new THREE.Box3();
      for (const mesh of this.activeMeshes) {
        mesh.updateMatrixWorld(true);
        if (mesh.geometry) {
          if (!mesh.geometry.boundingBox) mesh.geometry.computeBoundingBox();
          const tempBox = mesh.geometry.boundingBox!.clone();
          tempBox.applyMatrix4(mesh.matrixWorld);
          box.union(tempBox);
        }
      }
      const center = new THREE.Vector3();
      box.getCenter(center);
      this.controls.target.copy(center);
    }
  }

  /**
   * Gets list of active meshes in the scene
   */
  public getMeshes(): THREE.Mesh[] {
    return this.activeMeshes;
  }

  private animate() {
    requestAnimationFrame(this.animate.bind(this));
    this.controls.update();
    this.renderer.render(this.scene, this.camera);
  }

  private onWindowResize() {
    this.camera.aspect = this.container.clientWidth / this.container.clientHeight;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(this.container.clientWidth, this.container.clientHeight);
  }
}
