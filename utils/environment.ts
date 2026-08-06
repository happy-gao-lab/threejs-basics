import { PMREMGenerator, Scene, WebGLRenderer } from "three";
import { HDRLoader } from "three/addons/loaders/HDRLoader.js";

export const addEnvironment = (
  scene: Scene,
  renderer: WebGLRenderer,
  environmentMapUrl: string,
) => {
  const pmremGenerator = new PMREMGenerator(renderer);
  pmremGenerator.compileEquirectangularShader();

  new HDRLoader().load(environmentMapUrl, (texture) => {
    const envMap = pmremGenerator.fromEquirectangular(texture).texture;

    scene.environment = envMap;
    scene.background = envMap;

    texture.dispose();
    pmremGenerator.dispose();
  });
};
