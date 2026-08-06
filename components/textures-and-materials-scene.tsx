"use client";

import { FC, RefObject, useEffect, useMemo, useRef } from "react";
import {
  AmbientLight,
  Color,
  DoubleSide,
  Euler,
  Group,
  Mesh,
  MeshBasicMaterial,
  MeshDepthMaterial,
  MeshLambertMaterial,
  MeshMatcapMaterial,
  MeshNormalMaterial,
  MeshPhongMaterial,
  MeshPhysicalMaterial,
  MeshStandardMaterial,
  MeshToonMaterial,
  PerspectiveCamera,
  PMREMGenerator,
  PointLight,
  Scene,
  SRGBColorSpace,
  Texture,
  TextureLoader,
  TorusGeometry,
  Vector2,
  WebGLRenderer,
} from "three";
import gsap from "gsap";
import GUI from "lil-gui";
import { EXRLoader } from "three/addons/loaders/EXRLoader.js";
import { HDRLoader } from "three/addons/loaders/HDRLoader.js";
import useThreeScene from "@/hooks/use-three-scene";

import environmentMap from "@/assets/environment-maps/env-map.hdr";

import sphereAmbientOcclusionMap from "@/assets/rattan-weave/ambient-occlusion.jpg";
import sphereColorMap from "@/assets/rattan-weave/color.jpg";
import sphereMetalnessMap from "@/assets/rattan-weave/metalness.jpg";
import sphereNormalMap from "@/assets/rattan-weave/normal.png";
import sphereRoughnessMap from "@/assets/rattan-weave/roughness.jpg";
import sphereDisplacementMap from "@/assets/rattan-weave/displacement.png";

import matcap1 from "@/assets/matcaps/1.png";
import matcap2 from "@/assets/matcaps/2.png";
import matcap3 from "@/assets/matcaps/3.png";

import pebblesColorMap from "@/assets/pebbles/dry_river_pebbles_diff_2k.jpg";
import pebblesDisplacementMap from "@/assets/pebbles/dry_river_pebbles_disp_2k.png";
import pebblesNormalMap from "@/assets/pebbles/dry_river_pebbles_nor_gl_2k.exr";
import pebblesRoughnessMap from "@/assets/pebbles/dry_river_pebbles_rough_2k.exr";

const torusLabels: Record<number, string> = {
  1: "1: Basic + transparency",
  2: "2: Normal + flat shading",
  3: "3: Matcap",
  4: "4: Depth",
  5: "5: Lambert",
  6: "6: Phong",
  7: "7: Toon",
  8: "8: Standard metal",
  9: "9: Physical + clearcoat",
  10: "10: Physical (pebbles textures)",
  11: "11: Physical + sheen",
  12: "12: Physical + iridescence",
  13: "13: Physical + transmission",
};

const runWhenIdle = (callback: () => void) => {
  if (typeof window !== "undefined" && "requestIdleCallback" in window) {
    window.requestIdleCallback(callback);
  } else {
    setTimeout(callback, 1);
  }
};

const addRotation = (euler: Euler) =>
  gsap.to(euler, {
    x: -Math.PI,
    y: Math.PI,
    z: -Math.PI,
    duration: 8,
    repeat: -1,
    ease: "none",
  });

// Renders one torus per material/texture concept and returns a lookup of index -> render function.
// camera/pointLight are only known once useThreeScene's onInit runs, so they're read from refs at call time instead of being passed in directly.
const useTorusRenderers = (
  guiRef: RefObject<GUI | null>,
  cameraRef: RefObject<PerspectiveCamera | null>,
  pointLightRef: RefObject<PointLight | null>,
) => {
  const textureLoader = useMemo(() => new TextureLoader(), []);

  // MeshBasicMaterial ignores scene lighting entirely — color, opacity, and wireframe here are purely visual, not driven by any lighting model.
  const renderTorus1 = () => {
    const props = {
      color: 0xa71663,
    };

    const geometry = new TorusGeometry(4, 2);
    const material = new MeshBasicMaterial();
    const mesh = new Mesh(geometry, material);

    material.color = new Color(props.color); // Create color object to apply it to the mesh
    material.side = DoubleSide; // Render texture on the inner side of the mesh (longer to render)
    material.transparent = true;
    material.opacity = 0.5; // Doesn't work without transparent = true

    // Debug UI
    const folder = guiRef.current?.addFolder(torusLabels[1]);
    mesh.userData.folder = folder;

    folder?.add(material, "wireframe").name("Toggle wireframe");
    folder?.add(material, "opacity").name("Opacity").min(0).max(1).step(0.1);
    folder
      ?.addColor(props, "color")
      .name("Color")
      .onChange(() => {
        material.color.set(props.color);
      });

    return mesh;
  };

  // MeshNormalMaterial. flatShading rebuilds the shader itself, not just a uniform — the GUI toggle only takes effect because onChange sets needsUpdate = true.
  const renderTorus2 = () => {
    const geometry = new TorusGeometry(4, 2);
    const material = new MeshNormalMaterial();
    const mesh = new Mesh(geometry, material);

    // Debug UI
    const folder = guiRef.current?.addFolder(torusLabels[2]);
    mesh.userData.folder = folder;

    folder?.add(material, "wireframe").name("Toggle wireframe");
    folder
      ?.add(material, "flatShading")
      .name("Toggle flat shading")
      .onChange(() => {
        material.needsUpdate = true;
      });

    return mesh;
  };

  // MeshMatcapMaterial bakes lighting into the texture itself, so swapping matcaps needs no needsUpdate — nothing is computed at runtime.
  const renderTorus3 = () => {
    const props = { matcap: "Metallic" };

    const matcapTexture1 = textureLoader.load(matcap1.src);
    const matcapTexture2 = textureLoader.load(matcap2.src);
    const matcapTexture3 = textureLoader.load(matcap3.src);

    matcapTexture1.colorSpace = SRGBColorSpace;
    matcapTexture2.colorSpace = SRGBColorSpace;
    matcapTexture3.colorSpace = SRGBColorSpace;

    const matcaps: Record<string, Texture> = {
      Metallic: matcapTexture1,
      "Pink-Orange": matcapTexture2,
      "Heavy Green": matcapTexture3,
    };

    const geometry = new TorusGeometry(4, 2);
    const material = new MeshMatcapMaterial();
    const mesh = new Mesh(geometry, material);

    material.matcap = matcapTexture1;

    // Debug UI
    const folder = guiRef.current?.addFolder(torusLabels[3]);
    mesh.userData.folder = folder;

    folder
      ?.add(props, "matcap", Object.keys(matcaps))
      .name("Matcap")
      .onChange((value: string) => {
        material.matcap = matcaps[value];
      });

    return mesh;
  };

  // MeshDepthMaterial visualizes raw camera depth (z-buffer), not color or lighting — it only reads as a gradient when camera.near/far are tightly bound around the scene, otherwise everything collapses to near-white or near-black.
  const renderTorus4 = () => {
    const camera = cameraRef.current!;

    const geometry = new TorusGeometry(4, 2);
    const material = new MeshDepthMaterial();
    const mesh = new Mesh(geometry, material);

    // Debug UI
    const folder = guiRef.current?.addFolder(torusLabels[4]);
    mesh.userData.folder = folder;

    folder
      ?.add(camera, "near")
      .name("Camera near")
      .min(0.1)
      .max(20)
      .step(0.1)
      .onChange(() => {
        camera.updateProjectionMatrix();
      });
    folder
      ?.add(camera, "far")
      .name("Camera far")
      .min(1)
      .max(50)
      .step(0.1)
      .onChange(() => {
        camera.updateProjectionMatrix();
      });

    return mesh;
  };

  // MeshLambertMaterial computes lighting per-vertex, not per-pixel — cheapest material that actually reacts to light, but it can't produce sharp specular highlights and looks faceted on low-poly geometry.
  const renderTorus5 = () => {
    const pointLight = pointLightRef.current!;

    const geometry = new TorusGeometry(4, 2);
    const material = new MeshLambertMaterial();
    const mesh = new Mesh(geometry, material);

    // Debug UI
    const folder = guiRef.current?.addFolder(torusLabels[5]);
    mesh.userData.folder = folder;

    folder
      ?.add(pointLight.position, "x")
      .name("Light X")
      .min(-10)
      .max(10)
      .step(0.1);
    folder
      ?.add(pointLight.position, "y")
      .name("Light Y")
      .min(-10)
      .max(10)
      .step(0.1);
    folder
      ?.add(pointLight.position, "z")
      .name("Light Z")
      .min(-10)
      .max(10)
      .step(0.1);
    folder
      ?.add(pointLight, "intensity")
      .name("Light Intensity")
      .min(0)
      .max(500)
      .step(1);

    return mesh;
  };

  // MeshPhongMaterial's specular highlight is the brightest point on the surface — without tone mapping, a strong enough light clips it straight to white, hiding the specular color entirely regardless of what it's set to.
  const renderTorus6 = () => {
    const props = {
      specular: 0x0f17ff,
      color: 0xff0000,
    };

    const geometry = new TorusGeometry(4, 2);
    const material = new MeshPhongMaterial();
    const mesh = new Mesh(geometry, material);

    material.color = new Color(props.color);
    material.specular = new Color(props.specular);
    material.shininess = 200;

    // Debug UI
    const folder = guiRef.current?.addFolder(torusLabels[6]);
    mesh.userData.folder = folder;

    folder
      ?.add(material, "shininess")
      .name("Shininess")
      .min(0)
      .max(300)
      .step(1);
    folder
      ?.addColor(props, "color")
      .name("Color")
      .onChange(() => {
        mesh.material.color.set(props.color);
      });
    folder
      ?.addColor(props, "specular")
      .name("specular")
      .onChange(() => {
        mesh.material.specular.set(props.specular);
      });

    return mesh;
  };

  // MeshToonMaterial quantizes lighting into flat, stepped bands (cel-shading) instead of a smooth gradient — same underlying lighting as Lambert, just remapped through a small gradient texture (3 steps by default when none is provided).
  const renderTorus7 = () => {
    const props = {
      color: 0x808080,
    };

    const geometry = new TorusGeometry(4, 2);
    const material = new MeshToonMaterial();
    const mesh = new Mesh(geometry, material);

    material.color = new Color(props.color);

    // Debug UI
    const folder = guiRef.current?.addFolder(torusLabels[7]);
    mesh.userData.folder = folder;

    folder
      ?.addColor(props, "color")
      .name("Color")
      .onChange(() => {
        mesh.material.color.set(props.color);
      });

    return mesh;
  };

  // MeshStandardMaterial uses the physically-based metalness/roughness model instead of Phong's arbitrary specular color — metalness: 1 with roughness: 0 leaves no diffuse term at all, just a mirror-like reflection.
  const renderTorus8 = () => {
    const props = {
      color: 0x40964f,
    };

    const geometry = new TorusGeometry(4, 2);
    const material = new MeshStandardMaterial();
    const mesh = new Mesh(geometry, material);

    material.color = new Color(props.color);
    material.metalness = 1;
    material.roughness = 0;

    // Debug UI
    const folder = guiRef.current?.addFolder(torusLabels[8]);
    mesh.userData.folder = folder;

    folder
      ?.add(material, "metalness")
      .name("Metalness")
      .min(0)
      .max(1)
      .step(0.1);
    folder
      ?.add(material, "roughness")
      .name("Roughness")
      .min(0)
      .max(1)
      .step(0.1);
    folder
      ?.addColor(props, "color")
      .name("Color")
      .onChange(() => {
        mesh.material.color.set(props.color);
      });

    return mesh;
  };

  // MeshPhysicalMaterial - the worst for performance -  extends MeshStandardMaterial with extra physically-based layers like clearcoat — the same texture maps still drive the base layer, clearcoat sits independently on top of them.
  const renderTorus9 = () => {
    // Textures
    const colorTexture = textureLoader.load(sphereColorMap.src);
    const normalTexture = textureLoader.load(sphereNormalMap.src);
    const metalnessTexture = textureLoader.load(sphereMetalnessMap.src);
    const roughnessTexture = textureLoader.load(sphereRoughnessMap.src);
    const displacementTexture = textureLoader.load(sphereDisplacementMap.src);
    const ambientOcclusionTexture = textureLoader.load(
      sphereAmbientOcclusionMap.src,
    );

    colorTexture.colorSpace = SRGBColorSpace;

    const geometry = new TorusGeometry(4, 2, 256, 256);
    const material = new MeshPhysicalMaterial();
    const mesh = new Mesh(geometry, material);

    material.map = colorTexture;
    material.aoMap = ambientOcclusionTexture;
    material.aoMapIntensity = 1;
    material.normalMap = normalTexture;
    material.normalScale = new Vector2(0.5, 0.5);
    material.metalnessMap = metalnessTexture;
    material.metalness = 1;
    material.roughnessMap = roughnessTexture;
    material.roughness = 1;
    material.displacementMap = displacementTexture;
    material.displacementScale = 1;
    material.clearcoat = 1;
    material.clearcoatRoughness = 0;

    // Debug UI
    const folder = guiRef.current?.addFolder(torusLabels[9]);
    mesh.userData.folder = folder;

    folder
      ?.add(material, "clearcoat")
      .name("Clearcoat")
      .min(0)
      .max(1)
      .step(0.1);
    folder
      ?.add(material, "clearcoatRoughness")
      .name("Clearcoat Roughness")
      .min(0)
      .max(1)
      .step(0.1);
    folder
      ?.add(material, "aoMapIntensity")
      .name("AO Map Intensity")
      .min(0)
      .max(1)
      .step(0.1);
    folder
      ?.add(material, "metalness")
      .name("Metalness")
      .min(0)
      .max(1)
      .step(0.1);
    folder
      ?.add(material, "roughness")
      .name("Roughness")
      .min(0)
      .max(1)
      .step(0.1);
    folder
      ?.add(material, "displacementScale")
      .name("Displacement Scale")
      .min(0)
      .max(2)
      .step(0.1);

    return mesh;
  };

  // A texture set doesn't need every map to work — map/normalMap/roughnessMap/displacementMap are independent slots; missing aoMap or metalnessMap just falls back to the material's scalar defaults.
  const renderTorus10 = () => {
    // Textures
    const exrLoader = new EXRLoader();
    const colorTexture = textureLoader.load(pebblesColorMap.src);
    const normalTexture = exrLoader.load(pebblesNormalMap);
    const roughnessTexture = exrLoader.load(pebblesRoughnessMap);
    const displacementTexture = textureLoader.load(pebblesDisplacementMap.src);

    colorTexture.colorSpace = SRGBColorSpace;

    const geometry = new TorusGeometry(4, 2, 256, 256);
    const material = new MeshPhysicalMaterial();
    const mesh = new Mesh(geometry, material);

    material.map = colorTexture;
    material.normalMap = normalTexture;
    material.roughnessMap = roughnessTexture;
    material.roughness = 1;
    material.metalness = 0;
    material.displacementMap = displacementTexture;
    material.displacementScale = 1;

    // Debug UI
    const folder = guiRef.current?.addFolder(torusLabels[10]);
    mesh.userData.folder = folder;

    folder
      ?.add(material, "aoMapIntensity")
      .name("AO Map Intensity")
      .min(0)
      .max(1)
      .step(0.1);
    folder
      ?.add(material, "metalness")
      .name("Metalness")
      .min(0)
      .max(1)
      .step(0.1);
    folder
      ?.add(material, "roughness")
      .name("Roughness")
      .min(0)
      .max(1)
      .step(0.1);
    folder
      ?.add(material, "displacementScale")
      .name("Displacement Scale")
      .min(0)
      .max(2)
      .step(0.1);

    return mesh;
  };

  // material.sheen adds a soft, fabric-like microfiber highlight at grazing angles — a separate BRDF layer from the base specular, tuned by sheenColor/sheenRoughness independently of metalness or roughness.
  const renderTorus11 = () => {
    const props = {
      color: 0x463d76,
      sheenColor: 0xffffff,
    };

    const geometry = new TorusGeometry(4, 2, 128, 128);
    const material = new MeshPhysicalMaterial();
    const mesh = new Mesh(geometry, material);

    material.sheen = 1;
    material.sheenRoughness = 0.25;
    material.sheenColor.set(1, 1, 1);
    material.color = new Color(props.color);

    // Debug UI
    const folder = guiRef.current?.addFolder(torusLabels[11]);
    mesh.userData.folder = folder;

    folder
      ?.addColor(props, "color")
      .name("Color")
      .onChange(() => {
        mesh.material.color.set(props.color);
      });
    folder?.add(material, "sheen").name("Sheen").min(0).max(1).step(0.01);
    folder
      ?.add(material, "sheenRoughness")
      .name("Sheen Roughness")
      .min(0)
      .max(1)
      .step(0.01);
    folder
      ?.addColor(props, "sheenColor")
      .name("Sheen Color")
      .onChange(() => {
        material.sheenColor.set(props.sheenColor);
      });

    return mesh;
  };

  // iridescence simulates a thin-film interference effect (like a soap bubble or oil slick) — the color shift comes from iridescenceThicknessRange, not from any texture or light color.
  const renderTorus12 = () => {
    const props = {
      color: 0x000000,
      thicknessMin: 0,
      thicknessMax: 1000,
    };

    const geometry = new TorusGeometry(4, 2);
    const material = new MeshPhysicalMaterial();
    const mesh = new Mesh(geometry, material);

    material.color = new Color(props.color);
    material.iridescence = 1;
    material.iridescenceIOR = 1;
    material.iridescenceThicknessRange = [
      props.thicknessMin,
      props.thicknessMax,
    ];

    // Debug UI
    const folder = guiRef.current?.addFolder(torusLabels[12]);
    mesh.userData.folder = folder;

    folder
      ?.addColor(props, "color")
      .name("Color")
      .onChange(() => {
        mesh.material.color.set(props.color);
      });
    folder
      ?.add(material, "iridescence")
      .name("Iridescence")
      .min(0)
      .max(1)
      .step(0.01);
    folder
      ?.add(material, "iridescenceIOR")
      .name("Iridescence IOR")
      .min(1)
      .max(2.333)
      .step(0.01);
    folder
      ?.add(props, "thicknessMin")
      .name("Thickness Min")
      .min(0)
      .max(1000)
      .step(10)
      .onChange(() => {
        material.iridescenceThicknessRange = [
          props.thicknessMin,
          props.thicknessMax,
        ];
      });
    folder
      ?.add(props, "thicknessMax")
      .name("Thickness Max")
      .min(0)
      .max(1000)
      .step(10)
      .onChange(() => {
        material.iridescenceThicknessRange = [
          props.thicknessMin,
          props.thicknessMax,
        ];
      });

    return mesh;
  };

  // transmission lets light pass through the material instead of just reflecting it — combined with ior (refraction) and thickness (how far light travels inside before exiting), this is how three.js fakes glass without real ray tracing.
  const renderTorus13 = () => {
    const props = {
      color: 0xffffff,
    };

    const geometry = new TorusGeometry(4, 2);
    const material = new MeshPhysicalMaterial();
    const mesh = new Mesh(geometry, material);

    material.color = new Color(props.color);
    material.transmission = 1;
    material.ior = 1.5;
    material.thickness = 0.5;
    material.metalness = 0;
    material.roughness = 0;

    // Debug UI
    const folder = guiRef.current?.addFolder(torusLabels[13]);
    mesh.userData.folder = folder;

    folder
      ?.addColor(props, "color")
      .name("Color")
      .onChange(() => {
        mesh.material.color.set(props.color);
      });
    folder
      ?.add(material, "transmission")
      .name("Transmission")
      .min(0)
      .max(1)
      .step(0.01);
    folder?.add(material, "ior").name("IOR").min(1).max(2.333).step(0.01);
    folder
      ?.add(material, "thickness")
      .name("Thickness")
      .min(0)
      .max(5)
      .step(0.01);
    folder
      ?.add(material, "metalness")
      .name("Metalness")
      .min(0)
      .max(1)
      .step(0.1);
    folder
      ?.add(material, "roughness")
      .name("Roughness")
      .min(0)
      .max(1)
      .step(0.1);

    return mesh;
  };

  const renderers: Record<number, () => Mesh> = {
    1: renderTorus1,
    2: renderTorus2,
    3: renderTorus3,
    4: renderTorus4,
    5: renderTorus5,
    6: renderTorus6,
    7: renderTorus7,
    8: renderTorus8,
    9: renderTorus9,
    10: renderTorus10,
    11: renderTorus11,
    12: renderTorus12,
    13: renderTorus13,
  };

  return renderers;
};

const TexturesAndMaterialsScene: FC = () => {
  const guiRef = useRef<GUI | null>(null);
  const cameraRef = useRef<PerspectiveCamera | null>(null);
  const pointLightRef = useRef<PointLight | null>(null);

  const renderers = useTorusRenderers(guiRef, cameraRef, pointLightRef);

  const addLight = () => {
    const distance = 5;
    const intensity = 200;
    const ambientLight = new AmbientLight(0xffffff, 1);

    const pointLightXPos = new PointLight(0xffffff, intensity);
    pointLightXPos.position.set(distance, 0, 0);

    const group = new Group();

    group.add(ambientLight, pointLightXPos);

    return { group, pointLight: pointLightXPos };
  };

  const addEnvironment = (
    scene: Scene,
    renderer: WebGLRenderer,
  ) => {
    const pmremGenerator = new PMREMGenerator(renderer);
    pmremGenerator.compileEquirectangularShader();

    new HDRLoader().load(environmentMap, (texture) => {
      const envMap = pmremGenerator.fromEquirectangular(texture).texture;

      scene.environment = envMap;
      scene.background = envMap;

      texture.dispose();
      pmremGenerator.dispose();
    });
  };

  const setupTorusSwitcher = () => {
    const group = new Group();
    const rotationTween = addRotation(group.rotation);

    // Only one torus exists (geometry/material/textures) at a time — switching disposes the previous one instead of just hiding it, so idle toruses cost nothing.
    let activeMesh: Mesh | null = null;

    const disposeMesh = (mesh: Mesh) => {
      mesh.geometry.dispose();

      const materials = Array.isArray(mesh.material)
        ? mesh.material
        : [mesh.material];

      materials.forEach((material) => {
        Object.values(material).forEach((value) => {
          if (value instanceof Texture) {
            value.dispose();
          }
        });
        material.dispose();
      });

      (mesh.userData.folder as GUI | undefined)?.destroy();
    };

    const switchTorus = (index: number) => {
      if (activeMesh) {
        group.remove(activeMesh);
        disposeMesh(activeMesh);
      }

      const mesh = renderers[index]();
      group.add(mesh);
      activeMesh = mesh;
    };

    const props = { torus: 1, animate: true };

    const torusOptions = Object.fromEntries(
      Object.entries(torusLabels).map(([key, label]) => [label, Number(key)]),
    );

    guiRef.current
      ?.add(props, "animate")
      .name("Rotate")
      .onChange((value: boolean) => {
        if (value) {
          rotationTween.play();
        } else {
          rotationTween.pause();
        }
      });
    guiRef.current
      ?.add(props, "torus", torusOptions)
      .name("Active torus")
      .onChange((value: number) => switchTorus(value));

    switchTorus(1);

    return group;
  };

  const { canvasRef } = useThreeScene({
    fieldOfView: 75,
    onInit: (scene, camera, renderer) => {
      camera.position.z = 10;
      camera.near = 0.1;
      camera.updateProjectionMatrix();

      guiRef.current = new GUI({ width: 400, title: "Textures and Materials" });

      // The HDR environment map is a multi-MB download plus a PMREM
      // compile — deferring it off the initial frame keeps that work from
      // showing up as a single long blocking task right at startup.
      runWhenIdle(() => addEnvironment(scene, renderer));

      const { group: lights, pointLight } = addLight();
      const torusSwitcherGroup = setupTorusSwitcher();

      cameraRef.current = camera;
      pointLightRef.current = pointLight;

      scene.add(lights, torusSwitcherGroup);
    },
  });

  useEffect(() => {
    return () => guiRef.current?.destroy();
  }, []);

  return (
    <div className="w-full h-full relative">
      <canvas
        ref={canvasRef}
        className="outline-none fixed top-0 left-0"
      ></canvas>
    </div>
  );
};

export default TexturesAndMaterialsScene;
