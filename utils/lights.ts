import { AmbientLight, Group, PointLight } from "three";

export const addLights = () => {
  const ambientLight = new AmbientLight(0xffffff, 0.5);

  const pointLight1 = new PointLight(0xffffff, 300);
  pointLight1.position.set(5, 5, 5);

  const pointLight2 = new PointLight(0xffffff, 120);
  pointLight2.position.set(-5, -3, -4);

  const group = new Group();
  group.add(ambientLight, pointLight1, pointLight2);

  return { group, pointLight1, pointLight2 };
};
