"use client";

import { FC } from "react";
import {
  Color,
  Group,
  Mesh,
  MeshPhysicalMaterial,
  SphereGeometry,
} from "three";
import gsap from "gsap";

import useThreeScene from "@/hooks/use-three-scene";
import { runWhenIdle } from "@/utils/idle";
import { addEnvironment } from "@/utils/environment";
import { addLights } from "@/utils/lights";

import environmentMap from "@/assets/textures/environment-maps/env-map.hdr";

const BubblesRoomScene: FC = () => {
  const renderSphere = () => {
    const props = {
      color: 0xffffff,
    };

    const geometry = new SphereGeometry(2);
    const material = new MeshPhysicalMaterial();

    material.color = new Color(props.color);
    material.transmission = 1;
    material.ior = 1.5;
    material.thickness = 0.5;
    material.metalness = 1;
    material.roughness = 0;

    material.iridescence = 1;
    material.iridescenceIOR = 1;
    material.iridescenceThicknessRange = [0, 1000];

    material.color = new Color(props.color);
    material.transparent = true;
    material.opacity = 0.5;

    return { geometry, material };
  };

  const renderBubbles = () => {
    const { geometry, material } = renderSphere();
    const group = new Group();

    for (let i = 0; i < 100; i++) {
      const sphere = new Mesh(geometry, material);

      sphere.position.x = (Math.random() - 0.5) * 50;
      sphere.position.y = (Math.random() - 0.5) * 50;
      sphere.position.z = (Math.random() - 0.5) * 50;

      sphere.scale.setScalar(Math.random() * 0.8 + 0.2);

      gsap.to(sphere.position, {
        x: `+=${(Math.random() - 0.5) * 8}`,
        y: `+=${(Math.random() - 0.5) * 8}`,
        z: `+=${(Math.random() - 0.5) * 8}`,
        duration: 10 + Math.random() * 5,
        repeat: -1,
        yoyo: true,
        ease: "sine.inOut",
      });

      group.add(sphere);
    }

    return group;
  };

  const { canvasRef } = useThreeScene({
    fieldOfView: 75,
    onInit: (scene, camera, renderer) => {
      camera.position.z = 15;
      camera.near = 0.1;
      camera.updateProjectionMatrix();

      runWhenIdle(() => addEnvironment(scene, renderer, environmentMap));
      const bubbles = renderBubbles();
      const { group: lights } = addLights();

      scene.add(bubbles, lights);
    },
  });

  return (
    <div className="w-full h-full relative">
      <canvas
        ref={canvasRef}
        className="outline-none fixed top-0 left-0"
      ></canvas>
    </div>
  );
};

export default BubblesRoomScene;
