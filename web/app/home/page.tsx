import Header from "../header.module";
import Home from "./home.module";

export default function Page() {
  return (
    <main>
      <Header />
      <div className="flex flex-col p-8 md:p-20 min-h-screen">
        <Home />
      </div>
    </main>
  );
}