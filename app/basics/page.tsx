"use client";

import dynamic from "next/dynamic";

const BasicsScene = dynamic(() => import("../../components/basics-scene"), {
  ssr: false,
});

const BasicsPage = () => {
  return <BasicsScene />;
};

export default BasicsPage;
