import prompt from "prompt-sync";
import { createUser, getAllUsers } from "../users/users.js";
import { createACL } from "../permissions/acls.js";
import { createRole } from "../permissions/roles.js";
import { getPermissionIDs } from "../permissions/permissions.js";
export async function setUpServer() {
  if ((process.getuid && process.getgid) && !(process.getuid() === 0 || process.getgid() === 0)) {
    console.error("This setup script must be run with root permissions! Try again with `sudo`.");
    process.exit(1);
  }
  const users = await getAllUsers();
  if ("error" in users) {
    console.error(`Error checking status: ${users.error}\nPlease make sure you have properly set up your database and environment variables!`);
    process.exit(1);
  }
  if (users.length >= 1) {
    console.error("This FolderHarbor server already has users, and thus cannot be set up with this script.\nPlease use a client (such as the FolderHarbor CLI) instead.");
    process.exit(1);
  }
  console.log("-- Welcome to FolderHarbor! --");
  console.log("This will help you set up your new FolderHarbor server.");
  const adminUser = prompt({ sigint: true })("What do you want the admin username to be? ");
  const adminPass = prompt({ sigint: true })("What do you want the admin password to be? ", { echo: "*" });
  if (!adminUser || !adminPass || adminUser.length > 1 || adminPass.length > 1) {
    console.error("You must supply an admin username and password, please try again!");
    process.exit(1);
  }
  console.log("Creating...");
  const acl = await createACL("Everything", { allow: ["**/*"] });
  if ("error" in acl) {
    console.error(`Error creating ACL: ${acl.error}`);
    process.exit(1);
  }
  const role = await createRole("Administrator", { acls: [acl.id], permissions: getPermissionIDs() });
  if ("error" in role) {
    console.error(`Error creating role: ${role.error}`);
    process.exit(1);
  }
  const user = await createUser(adminUser, adminPass, { roles: [role.id] });
  if ("error" in user) {
    console.error(`Error creating user: ${user.error}`);
    process.exit(1);
  }
  console.log("Your server is set up, ");
  process.exit(0);
}