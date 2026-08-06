"use client";

import dynamic from "next/dynamic";

const TextScene = dynamic(() => import("../../components/text-scene"), {
  ssr: false,
});

const TextPage = () => {
  return <TextScene />;
};

export default TextPage;
