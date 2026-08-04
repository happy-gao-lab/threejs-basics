"use client";

import { FC, useEffect, useRef } from "react";
import * as THREE from "three";
import gsap from "gsap";
import GUI from "lil-gui";

import useThreeScene from "@/hooks/use-three-scene";

interface DebugUiParams {
  folderName: string;
  props: {
    orbit: "x" | "y" | "z";
    subdivision: number;
    color: string;
    wireframeColor: string;
    ownRotation: boolean;
    orbitalRotation: boolean;
  };
  mesh: THREE.Mesh<THREE.BufferGeometry, THREE.MeshBasicMaterial>;
  wireframeMesh: THREE.Mesh<THREE.BufferGeometry, THREE.MeshBasicMaterial>;
  pivotGroup: THREE.Group;
}

const BasicsScene: FC = () => {
  const guiRef = useRef<GUI | null>(null);

  const addDebugUi = ({
    folderName,
    props,
    mesh,
    wireframeMesh,
    pivotGroup,
  }: DebugUiParams) => {
    const ownRotationTween = addRotation(mesh.rotation);
    if (!props.ownRotation) ownRotationTween.pause();

    const orbitalRotationTween = addOrbitalRotation(
      pivotGroup.rotation,
      props.orbit,
    );
    if (!props.orbitalRotation) orbitalRotationTween.pause();

    const actions = {
      copySettings: () => {
        const settings = {
          position: {
            x: mesh.position.x,
            y: mesh.position.y,
            z: mesh.position.z,
          },
          color: props.color,
          wireframeColor: props.wireframeColor,
          subdivision: props.subdivision,
          ownRotation: props.ownRotation,
          orbitalRotation: props.orbitalRotation,
        };
        navigator.clipboard.writeText(JSON.stringify(settings, null, 2));
      },
    };

    const folder = guiRef.current?.addFolder(folderName);
    folder?.close();

    folder?.add(actions, "copySettings").name("Copy settings");

    folder
      ?.add(mesh.position, "x")
      .min(-2)
      .max(2)
      .step(0.25)
      .name("Position X");
    folder
      ?.add(mesh.position, "y")
      .min(-2)
      .max(2)
      .step(0.25)
      .name("Position Y");
    folder
      ?.add(mesh.position, "z")
      .min(-2)
      .max(2)
      .step(0.25)
      .name("Position Z");

    folder
      ?.addColor(props, "color")
      .name("Color")
      .onChange(() => {
        mesh.material.color.set(props.color);
      });
    folder
      ?.add(mesh.material, "opacity")
      .min(0.1)
      .max(1)
      .step(0.1)
      .name("Opacity");

    folder?.add(wireframeMesh, "visible").name("Toggle wireframe");
    folder
      ?.addColor(props, "wireframeColor")
      .name("Wireframe color")
      .onChange(() => {
        wireframeMesh.material.color.set(props.wireframeColor);
      });

    folder
      ?.add(props, "ownRotation")
      .name("Toggle own rotation")
      .onChange((value: boolean) => {
        if (value) {
          ownRotationTween.play();
        } else {
          ownRotationTween.pause();
        }
      });

    folder
      ?.add(props, "orbitalRotation")
      .name("Toggle orbital rotation")
      .onChange((value: boolean) => {
        if (value) {
          orbitalRotationTween.play();
        } else {
          orbitalRotationTween.pause();
        }
      });

    return folder;
  };

  const addRotation = (euler: THREE.Euler) =>
    gsap.to(euler, {
      x: Math.PI,
      y: Math.PI,
      z: Math.PI,
      duration: 1,
      repeat: -1,
      ease: "none",
    });

  const addOrbitalRotation = (euler: THREE.Euler, orbit: "x" | "y" | "z") =>
    gsap.to(euler, {
      [orbit]: -Math.PI * 2,
      duration: 3,
      repeat: -1,
      ease: "none",
    });

  const getCube = () => {
    const props = {
      orbit: "y" as const,
      subdivision: 2,
      color: "#ff0000",
      wireframeColor: "#ffffff",
      ownRotation: false,
      orbitalRotation: false,
    };

    // Geometry
    const geometry = new THREE.BoxGeometry(0.35, 0.35, 0.35);

    const material = new THREE.MeshBasicMaterial({
      color: props.color,
      transparent: true,
      opacity: 0.5,
    });
    const wireframeMaterial = new THREE.MeshBasicMaterial({
      color: props.wireframeColor,
      wireframe: true,
    });

    const mesh = new THREE.Mesh(geometry, material);
    const wireframeMesh = new THREE.Mesh(geometry, wireframeMaterial);

    mesh.position.set(0, 0, 1);
    mesh.add(wireframeMesh);

    const pivotGroup = new THREE.Group();
    pivotGroup.add(mesh);

    // Debug UI
    const folder = addDebugUi({
      folderName: "Cube",
      props,
      mesh,
      wireframeMesh,
      pivotGroup,
    });

    folder
      ?.add(props, "subdivision")
      .min(2)
      .max(10)
      .step(2)
      .name("Detail")
      .onFinishChange(() => {
        const newGeometry = new THREE.BoxGeometry(
          0.35,
          0.35,
          0.35,
          props.subdivision,
          props.subdivision,
          props.subdivision,
        );

        mesh.geometry.dispose();
        mesh.geometry = newGeometry;
        wireframeMesh.geometry = newGeometry;
      });

    return pivotGroup;
  };

  const getSphere = () => {
    const props = {
      orbit: "x" as const,
      subdivision: 16,
      color: "#00ff00",
      wireframeColor: "#ffffff",
      ownRotation: false,
      orbitalRotation: false,
    };

    // Geometry
    const geometry = new THREE.SphereGeometry(
      0.25,
      props.subdivision,
      props.subdivision,
    );

    const material = new THREE.MeshBasicMaterial({
      color: props.color,
      transparent: true,
      opacity: 0.5,
    });
    const wireframeMaterial = new THREE.MeshBasicMaterial({
      color: props.wireframeColor,
      wireframe: true,
    });

    const mesh = new THREE.Mesh(geometry, material);
    const wireframeMesh = new THREE.Mesh(geometry, wireframeMaterial);

    mesh.position.set(0, 1, 0);
    mesh.add(wireframeMesh);

    const pivotGroup = new THREE.Group();
    pivotGroup.add(mesh);

    // Debug UI
    const folder = addDebugUi({
      folderName: "Sphere",
      props,
      mesh,
      wireframeMesh,
      pivotGroup,
    });

    folder
      ?.add(props, "subdivision")
      .min(3)
      .max(32)
      .step(1)
      .name("Detail")
      .onFinishChange(() => {
        const newGeometry = new THREE.SphereGeometry(
          0.25,
          props.subdivision,
          props.subdivision,
        );

        mesh.geometry.dispose();
        mesh.geometry = newGeometry;
        wireframeMesh.geometry = newGeometry;
      });

    return pivotGroup;
  };

  const getCone = () => {
    const props = {
      orbit: "z" as const,
      subdivision: 8,
      color: "#0000ff",
      wireframeColor: "#ffffff",
      ownRotation: false,
      orbitalRotation: false,
    };

    // Geometry
    const geometry = new THREE.ConeGeometry(0.25, 0.45, props.subdivision);

    const material = new THREE.MeshBasicMaterial({
      color: props.color,
      transparent: true,
      opacity: 0.5,
    });
    const wireframeMaterial = new THREE.MeshBasicMaterial({
      color: props.wireframeColor,
      wireframe: true,
    });

    const mesh = new THREE.Mesh(geometry, material);
    const wireframeMesh = new THREE.Mesh(geometry, wireframeMaterial);

    mesh.position.set(1, 0, 0);
    mesh.add(wireframeMesh);

    const pivotGroup = new THREE.Group();
    pivotGroup.add(mesh);

    // Debug UI
    const folder = addDebugUi({
      folderName: "Cone",
      props,
      mesh,
      wireframeMesh,
      pivotGroup,
    });

    folder
      ?.add(props, "subdivision")
      .min(3)
      .max(32)
      .step(1)
      .name("Detail")
      .onFinishChange(() => {
        const newGeometry = new THREE.ConeGeometry(
          0.25,
          0.45,
          props.subdivision,
        );

        mesh.geometry.dispose();
        mesh.geometry = newGeometry;
        wireframeMesh.geometry = newGeometry;
      });

    return pivotGroup;
  };

  const { canvasRef } = useThreeScene({
    fieldOfView: 75,
    onInit: (scene) => {
      guiRef.current = new GUI({ width: 400, title: "Basics" });

      // Axes helper
      const axesHelper = new THREE.AxesHelper();
      scene.add(axesHelper);

      guiRef.current?.add(axesHelper, "visible").name("Toggle axes helper");

      const cube = getCube();
      scene.add(cube);

      const sphere = getSphere();
      scene.add(sphere);

      const cone = getCone();
      scene.add(cone);
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

export default BasicsScene;
