"use client";

import dynamic from "next/dynamic";

const TexturesAndMaterialsScene = dynamic(
  () => import("../../components/textures-and-materials-scene"),
  {
    ssr: false,
  },
);

const TexturesAndMaterialsPage = () => {
  return <TexturesAndMaterialsScene />;
};

export default TexturesAndMaterialsPage;
