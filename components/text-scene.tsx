"use client";

import { FC, useEffect, useRef } from "react";
import { MeshNormalMaterial, Mesh, Color } from "three";
import gsap from "gsap";
import GUI from "lil-gui";

import useThreeScene from "@/hooks/use-three-scene";
import {
  Font,
  FontData,
  FontLoader,
  TextGeometry,
} from "three/examples/jsm/Addons.js";

import bitcountFontData from "@/assets/fonts/Bitcount Prop Single_Regular.json";
import sekuyaFontData from "@/assets/fonts/Sekuya_Regular.json";
import lavishlyFontData from "@/assets/fonts/Lavishly Yours_Regular.json";

const TextScene: FC = () => {
  const guiRef = useRef<GUI | null>(null);
  const bitcountFontRef = useRef<Font | null>(null);
  const sekuyaFontRef = useRef<Font | null>(null);
  const lavishlyFontRef = useRef<Font | null>(null);

  const fontLoader = new FontLoader();

  const parseFonts = () => {
    bitcountFontRef.current = fontLoader.parse(
      bitcountFontData as unknown as FontData,
    );
    sekuyaFontRef.current = fontLoader.parse(
      sekuyaFontData as unknown as FontData,
    );
    lavishlyFontRef.current = fontLoader.parse(
      lavishlyFontData as unknown as FontData,
    );

    if (
      !bitcountFontRef.current ||
      !sekuyaFontRef.current ||
      !lavishlyFontRef.current
    ) {
      throw new Error("Failed to parse fonts");
    }
  };

  const renderText = (text: string, font: Font, name: string) => {
    const params = {
      size: 2,
      depth: 0.2,
      curveSegments: 5,
      bevelEnabled: true,
      bevelThickness: 0.03,
      bevelSize: 0.02,
      bevelOffset: 0,
      bevelSegments: 4,
    };

    const material = new MeshNormalMaterial();
    const geometry = new TextGeometry(text, { font, ...params });
    const text3d = new Mesh(geometry, material);

    geometry.computeBoundingBox();
    geometry.center();

    const rebuildGeometry = () => {
      text3d.geometry.dispose();
      text3d.geometry = new TextGeometry(text, { font, ...params });
      text3d.geometry.computeBoundingBox();
      text3d.geometry.center();
    };

    // Debug UI
    const folder = guiRef.current?.addFolder(name);

    folder?.add(material, "wireframe").name("Toggle wireframe");
    folder
      ?.add(params, "size")
      .min(0.1)
      .max(2)
      .step(0.01)
      .name("Size")
      .onFinishChange(rebuildGeometry);
    folder
      ?.add(params, "depth")
      .min(0)
      .max(1)
      .step(0.1)
      .name("Depth")
      .onFinishChange(rebuildGeometry);
    folder
      ?.add(params, "curveSegments")
      .min(1)
      .max(32)
      .step(1)
      .name("Curve segments")
      .onFinishChange(rebuildGeometry);
    folder
      ?.add(params, "bevelEnabled")
      .name("Toggle bevel")
      .onFinishChange(rebuildGeometry);
    folder
      ?.add(params, "bevelThickness")
      .min(0)
      .max(1)
      .step(0.01)
      .name("Bevel thickness")
      .onFinishChange(rebuildGeometry);
    folder
      ?.add(params, "bevelSize")
      .min(0)
      .max(1)
      .step(0.01)
      .name("Bevel size")
      .onFinishChange(rebuildGeometry);
    folder
      ?.add(params, "bevelOffset")
      .min(-1)
      .max(1)
      .step(0.1)
      .name("Bevel offset")
      .onFinishChange(rebuildGeometry);
    folder
      ?.add(params, "bevelSegments")
      .min(1)
      .max(16)
      .step(1)
      .name("Bevel segments")
      .onFinishChange(rebuildGeometry);

    return text3d;
  };

  const { canvasRef } = useThreeScene({
    fieldOfView: 75,
    onInit: (scene, camera) => {
      camera.position.z = 10;
      guiRef.current = new GUI({ width: 300, title: "3D text" });

      parseFonts();

      const bitcountText = renderText(
        "Hello World!",
        bitcountFontRef.current!,
        "Bitcount",
      );
      const sekuyaText = renderText(
        "Hello World!",
        sekuyaFontRef.current!,
        "Sekuya",
      );
      const lavishlyText = renderText(
        "Hello World!",
        lavishlyFontRef.current!,
        "Lavishly Yours",
      );

      bitcountText.position.y = 3;
      lavishlyText.position.y = -3;

      scene.add(bitcountText, sekuyaText, lavishlyText);
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
