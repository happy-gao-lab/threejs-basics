"use client";

import dynamic from "next/dynamic";

const BubblesRoomScene = dynamic(
  () => import("../../components/bubbles-room-scene"),
  {
    ssr: false,
  },
);

const BubblesRoomPage = () => {
  return <BubblesRoomScene />;
};

export default BubblesRoomPage;
