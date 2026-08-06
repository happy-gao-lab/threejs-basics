"use client";

import { useEffect, useRef } from "react";
import { PerspectiveCamera, Scene, WebGLRenderer } from "three";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";
import useWindowDimensions from "@/hooks/use-window-dimensions";

interface UseThreeSceneOptions {
  fieldOfView?: number;
  onInit?: (
    scene: Scene,
    camera: PerspectiveCamera,
    renderer: WebGLRenderer,
  ) => void;
}

const useThreeScene = (
  { fieldOfView, onInit }: UseThreeSceneOptions = { fieldOfView: 50 },
) => {
  const { width, height } = useWindowDimensions();

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const sceneRef = useRef<Scene | null>(null);
  const cameraRef = useRef<PerspectiveCamera | null>(null);
  const rendererRef = useRef<WebGLRenderer | null>(null);
  const controlsRef = useRef<OrbitControls | null>(null);

  //   Scene, camera, renderer  initial setup
  useEffect(() => {
    if (!canvasRef.current) return;

    // Scene
    sceneRef.current = new Scene();

    // Camera
    cameraRef.current = new PerspectiveCamera(fieldOfView, 1);

    cameraRef.current.position.set(1, 2, 3);
    sceneRef.current.add(cameraRef.current);

    // Renderer
    rendererRef.current = new WebGLRenderer({
      canvas: canvasRef.current,
    });

    // Controls
    controlsRef.current = new OrbitControls(
      cameraRef.current,
      canvasRef.current,
    );

    onInit?.(sceneRef.current, cameraRef.current, rendererRef.current);

    return () => {
      rendererRef.current?.dispose();
      controlsRef.current?.dispose();
    };
  }, []);

  // Resizing setup according to width and height
  useEffect(() => {
    if (!cameraRef.current || !rendererRef.current) return;
    if (width === 0 || height === 0) return;

    cameraRef.current.aspect = width / height;
    cameraRef.current.updateProjectionMatrix();
    rendererRef.current.setSize(width, height);
  }, [width, height]);

  // Fullscreen toggle on double click
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const toggleFullscreen = () => {
      if (!document.fullscreenElement) {
        canvas.requestFullscreen();
      } else {
        document.exitFullscreen();
      }
    };

    canvas.addEventListener("dblclick", toggleFullscreen);
    return () => canvas.removeEventListener("dblclick", toggleFullscreen);
  }, []);

  // Animation cycle
  useEffect(() => {
    if (
      !sceneRef.current ||
      !cameraRef.current ||
      !rendererRef.current ||
      !controlsRef.current
    )
      return;

    let frameId: number;
    const animate = () => {
      controlsRef.current!.update();
      rendererRef.current!.render(sceneRef.current!, cameraRef.current!);
      frameId = window.requestAnimationFrame(animate);
    };
    animate();

    return () => window.cancelAnimationFrame(frameId);
  }, []);

  return { canvasRef, sceneRef, cameraRef };
};

export default useThreeScene;
