import { Metadata } from "next";
import Users from "./users.module";

export const metadata: Metadata = { title: "Users • Admin" }
export default function Page() {
  return (
    <main className="flex flex-col p-8 md:p-20 min-h-screen">
      <h1 className="text-2xl font-semibold text-center">Users</h1>
      <Users />
    </main>
  );
}