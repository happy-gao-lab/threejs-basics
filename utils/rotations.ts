import { Euler } from "three";
import gsap from "gsap";

export const addRotation = (
  euler: Euler,
  vars: Partial<{ x: number; y: number; z: number; duration: number }>,
) =>
  gsap.to(euler, {
    ...vars,
    repeat: -1,
    ease: "none",
  });

export const addOrbitalRotation = (euler: Euler, orbit: "x" | "y" | "z") =>
  gsap.to(euler, {
    [orbit]: -Math.PI * 2,
    duration: 3,
    repeat: -1,
    ease: "none",
  });
