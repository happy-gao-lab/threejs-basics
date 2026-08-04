import fs from "fs";
import path from "path";
import Link from "next/link";

const getPageLinks = () => {
  const appDir = path.join(process.cwd(), "app");

  const folders = fs
    .readdirSync(appDir, { withFileTypes: true })
    .filter((entry) => entry.isDirectory())
    .filter((entry) => !entry.name.startsWith("("))
    .map((entry) => entry.name);

  return folders.map((folder) => {
    const label = folder.replace(/-/g, " ");
    return {
      href: `/${folder}`,
      label: label.charAt(0).toUpperCase() + label.slice(1),
    };
  });
};

const HomePage = () => {
  const links = getPageLinks();

  return (
    <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-slate-50 to-slate-200">
      <div className="w-full max-w-md">
        <p className="text-sm font-medium text-slate-500 mb-1">
          Three.js Basics
        </p>
        <h1 className="text-3xl font-semibold mb-8 text-slate-900">Зміст</h1>
        <ul className="flex flex-col gap-3">
          {links.map(({ href, label }) => (
            <li key={href}>
              <Link
                href={href}
                className="group flex items-center justify-between px-5 py-4 rounded-xl bg-white border border-slate-200 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all duration-200"
              >
                <span className="font-medium text-slate-800">{label}</span>
                <span className="text-slate-400 group-hover:text-slate-800 group-hover:translate-x-0.5 transition-all duration-200">
                  →
                </span>
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default HomePage;
