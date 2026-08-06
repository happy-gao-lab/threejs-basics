"use client";

import { FC, useEffect, useMemo, useRef } from "react";
import {
  MeshNormalMaterial,
  Mesh,
  MeshMatcapMaterial,
  MeshPhysicalMaterial,
  Color,
  TextureLoader,
  SRGBColorSpace,
  Texture,
} from "three";
import GUI from "lil-gui";

import useThreeScene from "@/hooks/use-three-scene";
import { addLights } from "@/utils/lights";
import {
  Font,
  FontData,
  FontLoader,
  TextGeometry,
} from "three/examples/jsm/Addons.js";

import bitcountFontData from "@/assets/fonts/Bitcount Prop Single_Regular.json";
import sekuyaFontData from "@/assets/fonts/Sekuya_Regular.json";
import lavishlyFontData from "@/assets/fonts/Lavishly Yours_Regular.json";

import matcap1 from "@/assets/textures/matcaps/1.png";
import matcap2 from "@/assets/textures/matcaps/2.png";
import matcap3 from "@/assets/textures/matcaps/3.png";
import matcap4 from "@/assets/textures/matcaps/4.png";
import matcap5 from "@/assets/textures/matcaps/5.png";
import matcap6 from "@/assets/textures/matcaps/6.png";
import matcap7 from "@/assets/textures/matcaps/7.png";
import matcap8 from "@/assets/textures/matcaps/8.png";

const text = "Hello World!";

const defaultProps = {
  size: 2,
  depth: 0.5,
  curveSegments: 5,
  bevelEnabled: true,
  bevelThickness: 0.03,
  bevelSize: 0.02,
  bevelOffset: 0,
  bevelSegments: 4,
};

const TextScene: FC = () => {
  const guiRef = useRef<GUI | null>(null);
  const bitcountFontRef = useRef<Font | null>(null);
  const sekuyaFontRef = useRef<Font | null>(null);
  const lavishlyFontRef = useRef<Font | null>(null);

  const fontLoader = useMemo(() => new FontLoader(), []);
  const textureLoader = useMemo(() => new TextureLoader(), []);

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

  const renderNormalText = () => {
    const props = {
      ...defaultProps,
      font: lavishlyFontRef.current!,
    };

    const material = new MeshNormalMaterial();
    const geometry = new TextGeometry(text, props);
    const text3d = new Mesh(geometry, material);

    geometry.computeBoundingBox();
    geometry.center();
    text3d.position.y = 3;

    const rebuildGeometry = () => {
      text3d.geometry.dispose();
      text3d.geometry = new TextGeometry(text, props);
      text3d.geometry.computeBoundingBox();
      text3d.geometry.center();
    };

    // Debug UI
    const folder = guiRef.current?.addFolder("Lavishly Yours");

    folder?.add(material, "wireframe").name("Toggle wireframe");
    folder
      ?.add(props, "size")
      .min(0.1)
      .max(2)
      .step(0.01)
      .name("Size")
      .onFinishChange(rebuildGeometry);
    folder
      ?.add(props, "depth")
      .min(0)
      .max(1)
      .step(0.1)
      .name("Depth")
      .onFinishChange(rebuildGeometry);
    folder
      ?.add(props, "curveSegments")
      .min(1)
      .max(32)
      .step(1)
      .name("Curve segments")
      .onFinishChange(rebuildGeometry);
    folder
      ?.add(props, "bevelEnabled")
      .name("Toggle bevel")
      .onFinishChange(rebuildGeometry);
    folder
      ?.add(props, "bevelThickness")
      .min(0)
      .max(1)
      .step(0.01)
      .name("Bevel thickness")
      .onFinishChange(rebuildGeometry);
    folder
      ?.add(props, "bevelSize")
      .min(0)
      .max(1)
      .step(0.01)
      .name("Bevel size")
      .onFinishChange(rebuildGeometry);
    folder
      ?.add(props, "bevelOffset")
      .min(-1)
      .max(1)
      .step(0.1)
      .name("Bevel offset")
      .onFinishChange(rebuildGeometry);
    folder
      ?.add(props, "bevelSegments")
      .min(1)
      .max(16)
      .step(1)
      .name("Bevel segments")
      .onFinishChange(rebuildGeometry);

    return text3d;
  };

  const renderMatcapText = () => {
    const matcapTextures = [
      matcap1,
      matcap2,
      matcap3,
      matcap4,
      matcap5,
      matcap6,
      matcap7,
      matcap8,
    ].map((matcap) => {
      const texture = textureLoader.load(matcap.src);
      texture.colorSpace = SRGBColorSpace;
      return texture;
    });

    const matcaps: Record<string, Texture> = Object.fromEntries(
      matcapTextures.map((texture, index) => [`Matcap ${index + 1}`, texture]),
    );

    const props = {
      ...defaultProps,
      font: sekuyaFontRef.current!,
      matcap: "Matcap 1",
    };

    const material = new MeshMatcapMaterial();
    const geometry = new TextGeometry(text, props);
    const text3d = new Mesh(geometry, material);

    geometry.computeBoundingBox();
    geometry.center();
    material.matcap = matcaps[props.matcap];

    // Debug UI
    const folder = guiRef.current?.addFolder("Sekuya");

    folder
      ?.add(props, "matcap", Object.keys(matcaps))
      .name("Matcap")
      .onChange((value: string) => {
        material.matcap = matcaps[value];
      });

    return text3d;
  };

  const renderPhysicalText = () => {
    const sheenProps = {
      color: 0x463d76,
      sheenColor: 0xffffff,
    };

    const props = {
      ...defaultProps,
      font: bitcountFontRef.current!,
    };

    const material = new MeshPhysicalMaterial();
    const geometry = new TextGeometry(text, props);
    const text3d = new Mesh(geometry, material);

    geometry.computeBoundingBox();
    geometry.center();
    text3d.position.y = -3;

    material.sheen = 1;
    material.sheenRoughness = 0.25;
    material.sheenColor.set(1, 1, 1);
    material.color = new Color(sheenProps.color);

    // Debug UI
    const folder = guiRef.current?.addFolder("Bitcount");

    folder
      ?.addColor(sheenProps, "color")
      .name("Color")
      .onChange(() => {
        material.color.set(sheenProps.color);
      });
    folder?.add(material, "sheen").name("Sheen").min(0).max(1).step(0.01);
    folder
      ?.add(material, "sheenRoughness")
      .name("Sheen Roughness")
      .min(0)
      .max(1)
      .step(0.01);
    folder
      ?.addColor(sheenProps, "sheenColor")
      .name("Sheen Color")
      .onChange(() => {
        material.sheenColor.set(sheenProps.sheenColor);
      });

    return text3d;
  };

  const { canvasRef } = useThreeScene({
    fieldOfView: 75,
    onInit: (scene, camera) => {
      camera.position.z = 10;
      scene.background = new Color(0xffdd00);

      guiRef.current = new GUI({ width: 300, title: "3D text" });

      parseFonts();

      const lavishlyText = renderNormalText();
      const sekuyaText = renderMatcapText();
      const bitcountText = renderPhysicalText();
      const { group: lightsGroup } = addLights();

      scene.add(lavishlyText, sekuyaText, bitcountText, lightsGroup);
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
