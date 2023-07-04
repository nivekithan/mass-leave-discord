import type { LoaderArgs, V2_MetaFunction } from "@remix-run/node";

export const meta: V2_MetaFunction = () => {
  return [
    { title: "Mass Leave Discord Severs" },
    { name: "description", content: "Easily leave multiple discord servers" },
  ];
};

export async function loader({ request }: LoaderArgs) {
  return null;
}

export default function Index() {
  return (
    <main className="container py-32 flex justify-center">
      <div className="">
        <h1 className="text-4xl font-semibold leading-none tracking-tight text-center">
          Mass leave Discord Servers
        </h1>
        <p className="mt-8 max-w-xl text-center text-lg">
          Is your discord dashboard full of servers you don't care ? Use this
          tool to easily leave from them immediately
        </p>
      </div>
    </main>
  );
}
