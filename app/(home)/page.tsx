import Link from "next/link";

const HomePage = () => {
  return (
    <div className="w-full h-full">
      <Link href={"/basics"}>Basics</Link>
    </div>
  );
};

export default HomePage;
