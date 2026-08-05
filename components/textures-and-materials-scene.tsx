"use client";

import { FC, useEffect, useRef } from "react";
import * as THREE from "three";
import gsap from "gsap";
import GUI from "lil-gui";

import useThreeScene from "@/hooks/use-three-scene";

import doorAlphaMap from "@/assets/door/alpha.jpg";
import doorAmbientOcclusionMap from "@/assets/door/ambient-occlusion.jpg";
import doorColorMap from "@/assets/door/color.jpg";
import doorHeightMap from "@/assets/door/height.jpg";
import doorMetalnessMap from "@/assets/door/metalness.jpg";
import doorNormalMap from "@/assets/door/normal.jpg";
import doorRoughnessMap from "@/assets/door/roughness.jpg";

import sphereAmbientOcclusionMap from "@/assets/rattan-weave/ambient-occlusion.jpg";
import sphereColorMap from "@/assets/rattan-weave/color.jpg";
import sphereMetalnessMap from "@/assets/rattan-weave/metalness.jpg";
import sphereNormalMap from "@/assets/rattan-weave/normal.png";
import sphereRoughnessMap from "@/assets/rattan-weave/roughness.jpg";
import sphereDisplacementMap from "@/assets/rattan-weave/displacement.png";

const TexturesAndMaterialsScene: FC = () => {
  const guiRef = useRef<GUI | null>(null);

  const textureLoader = new THREE.TextureLoader();

  const addRotation = (euler: THREE.Euler) =>
    gsap.to(euler, {
      y: Math.PI * 2,
      duration: 8,
      repeat: -1,
      ease: "none",
    });

  const getLight = () => {
    const ambientLight = new THREE.AmbientLight(0xffffff, 1);
    const pointLight = new THREE.PointLight(0xffffff, 100);
    pointLight.position.set(3, 4, 5);

    const folder = guiRef.current?.addFolder("Point light");
    folder?.close();

    folder
      ?.add(pointLight.position, "x")
      .min(-10)
      .max(10)
      .step(0.25)
      .name("Position X");
    folder
      ?.add(pointLight.position, "y")
      .min(-10)
      .max(10)
      .step(0.25)
      .name("Position Y");
    folder
      ?.add(pointLight.position, "z")
      .min(-10)
      .max(10)
      .step(0.25)
      .name("Position Z");

    return { ambientLight, pointLight };
  };

  const getPlain = () => {
    // Textures
    const colorTexture = textureLoader.load(doorColorMap.src);
    const alphaTexture = textureLoader.load(doorAlphaMap.src);
    const heightTexture = textureLoader.load(doorHeightMap.src);
    const normalTexture = textureLoader.load(doorNormalMap.src);
    const metalnessTexture = textureLoader.load(doorMetalnessMap.src);
    const roughnessTexture = textureLoader.load(doorRoughnessMap.src);
    const ambientOcclusionTexture = textureLoader.load(
      doorAmbientOcclusionMap.src,
    );

    colorTexture.colorSpace = THREE.SRGBColorSpace;

    // Geometry
    const geometry = new THREE.PlaneGeometry(3, 4, 100, 100);
    const material = new THREE.MeshStandardMaterial({
      side: THREE.DoubleSide,
      map: colorTexture,
      aoMap: ambientOcclusionTexture,
      aoMapIntensity: 1,
      displacementMap: heightTexture,
      displacementScale: 0.1,
      alphaMap: alphaTexture,
      transparent: true,
      normalMap: normalTexture,
      normalScale: new THREE.Vector2(0.5, 0.5),
      metalnessMap: metalnessTexture,
      metalness: 0,
      roughnessMap: roughnessTexture,
      roughness: 0.15,
    });
    const mesh = new THREE.Mesh(geometry, material);

    addRotation(mesh.rotation);

    // Debug UI
    const folder = guiRef.current?.addFolder("Door");
    folder?.close();
    folder?.add(material, "aoMapIntensity").min(0).max(1).step(0.01);
    folder?.add(material, "displacementScale").min(0).max(1).step(0.01);
    folder?.add(material, "metalness").min(0).max(1).step(0.001);
    folder?.add(material, "roughness").min(0).max(1).step(0.001);

    return mesh;
  };

  const getSphere = () => {
    // Textures
    const colorTexture = textureLoader.load(sphereColorMap.src);
    const normalTexture = textureLoader.load(sphereNormalMap.src);
    const metalnessTexture = textureLoader.load(sphereMetalnessMap.src);
    const roughnessTexture = textureLoader.load(sphereRoughnessMap.src);
    const displacementTexture = textureLoader.load(sphereDisplacementMap.src);
    const ambientOcclusionTexture = textureLoader.load(
      sphereAmbientOcclusionMap.src,
    );

    colorTexture.colorSpace = THREE.SRGBColorSpace;

    // Geometry
    const geometry = new THREE.SphereGeometry(0.5, 128, 128);

    const material = new THREE.MeshStandardMaterial({
      map: colorTexture,
      aoMap: ambientOcclusionTexture,
      aoMapIntensity: 1,
      normalMap: normalTexture,
      normalScale: new THREE.Vector2(0.5, 0.5),
      metalnessMap: metalnessTexture,
      metalness: 1,
      roughnessMap: roughnessTexture,
      roughness: 1,
      displacementMap: displacementTexture,
      displacementScale: 0.3,
    });

    const mesh = new THREE.Mesh(geometry, material);

    mesh.position.set(2, 0, 0);

    addRotation(mesh.rotation);

    // Debug UI
    const folder = guiRef.current?.addFolder("sphere");
    folder?.close();

    folder?.add(material, "aoMapIntensity").min(0).max(1).step(0.01);
    folder?.add(material, "displacementScale").min(0).max(1).step(0.01);
    folder?.add(material, "metalness").min(0).max(1).step(0.001);
    folder?.add(material, "roughness").min(0).max(1).step(0.001);

    return mesh;
  };

  const { canvasRef } = useThreeScene({
    fieldOfView: 75,
    onInit: (scene) => {
      guiRef.current = new GUI({ width: 300, title: "Textures and Materials" });

      const { ambientLight, pointLight } = getLight();
      const plain = getPlain();
      const sphere = getSphere();

      scene.add(ambientLight, pointLight, plain, sphere);
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
