"use client";

import { FC } from "react";
import * as THREE from "three";
import useThreeScene from "@/hooks/use-three-scene";

import gsap from "gsap";

const BasicsScene: FC = () => {
  const addRotation = (euler: THREE.Euler) =>
    gsap.to(euler, {
      x: Math.PI,
      y: Math.PI,
      z: Math.PI,
      duration: 1,
      repeat: -1,
      ease: "none",
    });

  const addOrbitalRotation = (meshObj: THREE.Mesh, orbit: "x" | "y" | "z") => {
    const groupPivot = new THREE.Group();
    groupPivot.add(meshObj);

    gsap.to(groupPivot.rotation, {
      [orbit]: -Math.PI * 2,
      duration: 3,
      repeat: -1,
      ease: "none",
    });

    return groupPivot;
  };

  const getCube = () => {
    const cubeGeometry = new THREE.BoxGeometry(0.35, 0.35, 0.35);

    const cubeMaterial = new THREE.MeshBasicMaterial({
      color: "red",
      transparent: true,
      opacity: 0.5,
    });
    const cubeWireframeMaterial = new THREE.MeshBasicMaterial({
      color: "black",
      wireframe: true,
    });

    const cube = new THREE.Mesh(cubeGeometry, cubeMaterial);
    const cubeWireframeMesh = new THREE.Mesh(
      cubeGeometry,
      cubeWireframeMaterial,
    );

    cube.position.set(0, 0, 1);
    cube.add(cubeWireframeMesh);

    addRotation(cube.rotation);
    const cubePivot = addOrbitalRotation(cube, "y");

    return cubePivot;
  };

  const getSphere = () => {
    const sphereGeometry = new THREE.SphereGeometry(0.25);

    const sphereMaterial = new THREE.MeshBasicMaterial({
      color: "green",
      transparent: true,
      opacity: 0.5,
    });
    const sphereWireframeMaterial = new THREE.MeshBasicMaterial({
      color: "black",
      wireframe: true,
    });

    const sphere = new THREE.Mesh(sphereGeometry, sphereMaterial);
    const sphereWireframeMesh = new THREE.Mesh(
      sphereGeometry,
      sphereWireframeMaterial,
    );

    sphere.position.set(0, 1, 0);
    sphere.add(sphereWireframeMesh);

    addRotation(sphere.rotation);
    const spherePivot = addOrbitalRotation(sphere, "x");

    return spherePivot;
  };

  const getCone = () => {
    const coneGeometry = new THREE.ConeGeometry(0.25, 0.45);

    const coneMaterial = new THREE.MeshBasicMaterial({
      color: "blue",
      transparent: true,
      opacity: 0.5,
    });
    const coneWireframeMaterial = new THREE.MeshBasicMaterial({
      color: "black",
      wireframe: true,
    });

    const cone = new THREE.Mesh(coneGeometry, coneMaterial);
    const coneWireframeMesh = new THREE.Mesh(
      coneGeometry,
      coneWireframeMaterial,
    );

    cone.position.set(1, 0, 0);
    cone.add(coneWireframeMesh);

    addRotation(cone.rotation);
    const conePivot = addOrbitalRotation(cone, "z");

    return conePivot;
  };

  const { canvasRef } = useThreeScene({
    onInit: (scene) => {
      // Axes helper
      const axesHelper = new THREE.AxesHelper();
      scene.add(axesHelper);

      const cube = getCube();
      scene.add(cube);

      const sphere = getSphere();
      scene.add(sphere);

      const cone = getCone();
      scene.add(cone);
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

export default BasicsScene;
