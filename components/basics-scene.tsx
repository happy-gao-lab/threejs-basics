"use client";

import { FC, useEffect, useRef } from "react";
import {
  Mesh,
  BufferGeometry,
  MeshBasicMaterial,
  Group,
  Euler,
  BoxGeometry,
  Color,
  SphereGeometry,
  ConeGeometry,
  AxesHelper,
} from "three";
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
  mesh: Mesh<BufferGeometry, MeshBasicMaterial>;
  wireframeMesh: Mesh<BufferGeometry, MeshBasicMaterial>;
  pivotGroup: Group;
}

const addRotation = (euler: Euler) =>
  gsap.to(euler, {
    x: Math.PI,
    y: Math.PI,
    z: Math.PI,
    duration: 1,
    repeat: -1,
    ease: "none",
  });

const addOrbitalRotation = (euler: Euler, orbit: "x" | "y" | "z") =>
  gsap.to(euler, {
    [orbit]: -Math.PI * 2,
    duration: 3,
    repeat: -1,
    ease: "none",
  });

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

  const getCube = () => {
    const props = {
      orbit: "y" as const,
      subdivision: 2,
      color: "#ff0000",
      wireframeColor: "#ffffff",
      ownRotation: false,
      orbitalRotation: false,
    };

    const geometry = new BoxGeometry(0.35, 0.35, 0.35);
    const material = new MeshBasicMaterial();
    const wireframeMaterial = new MeshBasicMaterial();
    const mesh = new Mesh(geometry, material);
    const wireframeMesh = new Mesh(geometry, wireframeMaterial);
    const pivotGroup = new Group();

    mesh.add(wireframeMesh);
    mesh.position.set(0, 0, 1);
    pivotGroup.add(mesh);

    material.color = new Color(props.color);
    material.transparent = true;
    material.opacity = 0.5;
    wireframeMaterial.color = new Color(props.wireframeColor);
    wireframeMaterial.wireframe = true;

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
        const newGeometry = new BoxGeometry(
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

    const geometry = new SphereGeometry(
      0.25,
      props.subdivision,
      props.subdivision,
    );
    const material = new MeshBasicMaterial();
    const wireframeMaterial = new MeshBasicMaterial();
    const mesh = new Mesh(geometry, material);
    const wireframeMesh = new Mesh(geometry, wireframeMaterial);
    const pivotGroup = new Group();

    mesh.add(wireframeMesh);
    mesh.position.set(0, 1, 0);
    pivotGroup.add(mesh);

    material.color = new Color(props.color);
    material.transparent = true;
    material.opacity = 0.5;
    wireframeMaterial.color = new Color(props.wireframeColor);
    wireframeMaterial.wireframe = true;

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
        const newGeometry = new SphereGeometry(
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

    const geometry = new ConeGeometry(0.25, 0.45, props.subdivision);
    const material = new MeshBasicMaterial();
    const wireframeMaterial = new MeshBasicMaterial();
    const mesh = new Mesh(geometry, material);
    const wireframeMesh = new Mesh(geometry, wireframeMaterial);
    const pivotGroup = new Group();

    mesh.position.set(1, 0, 0);
    mesh.add(wireframeMesh);
    pivotGroup.add(mesh);

    material.color = new Color(props.color);
    material.transparent = true;
    material.opacity = 0.5;
    wireframeMaterial.color = new Color(props.wireframeColor);
    wireframeMaterial.wireframe = true;

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
        const newGeometry = new ConeGeometry(0.25, 0.45, props.subdivision);

        mesh.geometry.dispose();
        mesh.geometry = newGeometry;
        wireframeMesh.geometry = newGeometry;
      });

    return pivotGroup;
  };

  const { canvasRef } = useThreeScene({
    fieldOfView: 75,
    onInit: (scene) => {
      guiRef.current = new GUI({ width: 300, title: "Basics" });

      const axesHelper = new AxesHelper();
      const cube = getCube();
      const sphere = getSphere();
      const cone = getCone();

      scene.add(axesHelper, cube, sphere, cone);

      guiRef.current?.add(axesHelper, "visible").name("Toggle axes helper");
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
