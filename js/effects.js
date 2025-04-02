import * as THREE from "three";
export class Effects {
  constructor(scene, camera) {
    this.scene = scene;
    this.camera = camera;
    this.composer = null;
    this.grayscalePass = null;
    this.isGrayscaleActive = false;
  }

  initPostProcessing() {
    // Load the necessary modules if not using ES modules
    if (typeof THREE.EffectComposer === "undefined") {
      this.loadScriptAsync(
        "https://cdn.jsdelivr.net/npm/three@0.157.0/examples/js/postprocessing/EffectComposer.js"
      )
        .then(() =>
          this.loadScriptAsync(
            "https://cdn.jsdelivr.net/npm/three@0.157.0/examples/js/postprocessing/RenderPass.js"
          )
        )
        .then(() =>
          this.loadScriptAsync(
            "https://cdn.jsdelivr.net/npm/three@0.157.0/examples/js/postprocessing/ShaderPass.js"
          )
        )
        .then(() =>
          this.loadScriptAsync(
            "https://cdn.jsdelivr.net/npm/three@0.157.0/examples/js/shaders/LuminosityShader.js"
          )
        )
        .then(() => this.setupComposer());
    } else {
      this.setupComposer();
    }
  }

  loadScriptAsync(url) {
    return new Promise((resolve, reject) => {
      const script = document.createElement("script");
      script.src = url;
      script.onload = () => resolve();
      script.onerror = reject;
      document.body.appendChild(script);
    });
  }

  setupComposer() {
    // Create effect composer
    this.composer = new THREE.EffectComposer(renderer);

    // Create render pass
    const renderPass = new THREE.RenderPass(this.scene, this.camera);
    this.composer.addPass(renderPass);

    // Create grayscale pass
    this.grayscalePass = new THREE.ShaderPass(THREE.LuminosityShader);
    this.composer.addPass(this.grayscalePass);

    // Make sure the final pass renders to the screen
    this.grayscalePass.renderToScreen = true;
  }

  applyGrayscale() {
    if (!this.composer) {
      this.initPostProcessing();
    } else {
      this.grayscalePass.enabled = true;
      this.isGrayscaleActive = true;
    }
  }

  removeGrayscale() {
    if (this.composer && this.grayscalePass) {
      this.grayscalePass.enabled = false;
      this.isGrayscaleActive = false;
    }
  }

  // Alternative grayscale method if post-processing is not available
  applyGrayscaleMaterials() {
    this.scene.traverse((object) => {
      if (object.isMesh && object.material) {
        if (Array.isArray(object.material)) {
          object.userData.originalMaterials = object.material.map((m) =>
            m.clone()
          );
          object.material.forEach((material) => {
            this.convertMaterialToGrayscale(material);
          });
        } else {
          object.userData.originalMaterial = object.material.clone();
          this.convertMaterialToGrayscale(object.material);
        }
      }
    });
  }

  removeGrayscaleMaterials() {
    this.scene.traverse((object) => {
      if (object.isMesh) {
        if (object.userData.originalMaterials) {
          object.material = object.userData.originalMaterials;
          delete object.userData.originalMaterials;
        } else if (object.userData.originalMaterial) {
          object.material = object.userData.originalMaterial;
          delete object.userData.originalMaterial;
        }
      }
    });
  }

  convertMaterialToGrayscale(material) {
    // Create a grayscale shader
    material.onBeforeCompile = (shader) => {
      shader.fragmentShader = shader.fragmentShader.replace(
        "gl_FragColor = vec4( outgoingLight, diffuseColor.a );",
        `
        float gray = dot(outgoingLight, vec3(0.299, 0.587, 0.114));
        gl_FragColor = vec4(vec3(gray), diffuseColor.a);
        `
      );
    };

    material.needsUpdate = true;
  }
}
