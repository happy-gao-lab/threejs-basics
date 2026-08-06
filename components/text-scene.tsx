"use client";

import { FC, useEffect, useRef } from "react";
import {} from "three";
import gsap from "gsap";
import GUI from "lil-gui";

import useThreeScene from "@/hooks/use-three-scene";
const TextScene: FC = () => {
  const guiRef = useRef<GUI | null>(null);

  const { canvasRef } = useThreeScene({
    fieldOfView: 75,
    onInit: (scene) => {
      guiRef.current = new GUI({ width: 300, title: "3D text" });

      scene.add();
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

export default TextScene;
