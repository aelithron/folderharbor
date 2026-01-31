export const permissions: { id: `${"users" | "sessions" | "roles" | "acls" | "config"}:${string}`, description: string }[] = [
  { id: "users:create", description: "Create new users" },
  { id: "users:read", description: "Read users' full information" },
  { id: "users:edit", description: "Modify the information of other users" },
  { id: "users:delete", description: "Delete users" },
  { id: "users:list", description: "Get a list of all users, with limited information" },
  
  { id: "", description: "" },
];