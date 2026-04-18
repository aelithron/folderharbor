import prompt from "prompt-sync";
import { createUser, editUser, getAllUsers } from "../users/users.js";
import { createACL } from "../permissions/acls.js";
import { createRole } from "../permissions/roles.js";
import { getPermissionIDs } from "../permissions/permissions.js";
import { writeLog } from "./auditlog.js";
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
  if (!adminUser || !adminPass || adminUser.length < 1 || adminPass.length < 1) {
    console.error("You must supply an admin username and password, please try again!");
    process.exit(1);
  }
  console.log("Creating resources...");
  const acl = await createACL("Everything", { allow: ["**/*"] });
  if ("error" in acl) {
    console.error(`Error creating ACL: ${acl.error}`);
    process.exit(1);
  }
  await writeLog(0, "System", "acls-create", { id: acl.id, newContents: { name: "Everything", allow: ["**/*"] }, protocol: "internal" }, "created an ACL (with setup script)");
  const role = await createRole("Administrator", { acls: [acl.id], permissions: getPermissionIDs() });
  if ("error" in role) {
    console.error(`Error creating role: ${role.error}`);
    process.exit(1);
  }
  await writeLog(0, "System", "roles-create", { id: role.id, newContents: { name: "Administrator", acls: [acl.id], permissions: getPermissionIDs() }, protocol: "internal" }, "created a role (with setup script)");
  const user = await createUser(adminUser, adminPass, { roles: [role.id] });
  if ("error" in user) {
    console.error(`Error creating user: ${user.error}`);
    process.exit(1);
  }
  await writeLog(0, "System", "users-create", { id: user.id, newContents: { username: adminUser, password: "[redacted]", roles: [role.id] }, protocol: "internal" }, "created a user (with setup script)");
  console.log("Your server is now set up! Thank you for using FolderHarbor <3");
  process.exit(0);
}
export async function recoverServer() {
  if ((process.getuid && process.getgid) && !(process.getuid() === 0 || process.getgid() === 0)) {
    console.error("This recovery script must be run with root permissions! Try again with `sudo`.");
    process.exit(1);
  }
  console.log("-- FolderHarbor Recovery --");
  console.log("This will help you recover access to your FolderHarbor server.");
  console.warn("It does that by locking all existing users and creating a new administrator account.\nAre you 100% sure you want to do this?");
  const check = prompt({ sigint: true })('Please type "I want to lock all users and recover this server." to confirm: ');
  if (!check || check.length < 1 || check !== "I want to lock all users and recover this server.") {
    console.error("The phrase wasn't correctly entered, aborting...");
    process.exit(1);
  }
  const adminUser = prompt({ sigint: true })("What do you want the new admin username to be? ");
  const adminPass = prompt({ sigint: true })("What do you want the new admin password to be? ", { echo: "*" });
  if (!adminUser || !adminPass || adminUser.length < 1 || adminPass.length < 1) {
    console.error("You must supply an admin username and password, please try again!");
    process.exit(1);
  }
  console.log("Creating resources...");
  const acl = await createACL("Everything", { allow: ["**/*"] });
  if ("error" in acl) {
    console.error(`Error creating ACL: ${acl.error}`);
    process.exit(1);
  }
  await writeLog(0, "System", "acls-create", { id: acl.id, newContents: { name: "Everything", allow: ["**/*"] }, protocol: "internal" }, "created an ACL (with recovery script)");
  const role = await createRole("Administrator", { acls: [acl.id], permissions: getPermissionIDs() });
  if ("error" in role) {
    console.error(`Error creating role: ${role.error}`);
    process.exit(1);
  }
  await writeLog(0, "System", "roles-create", { id: role.id, newContents: { name: "Administrator", acls: [acl.id], permissions: getPermissionIDs() }, protocol: "internal" }, "created a role (with recovery script)");
  const user = await createUser(adminUser, adminPass, { roles: [role.id] });
  if ("error" in user) {
    console.error(`Error creating user: ${user.error}`);
    process.exit(1);
  }
  await writeLog(0, "System", "users-create", { id: user.id, newContents: { username: adminUser, password: "[redacted]", roles: [role.id] }, protocol: "internal" }, "created a user (with recovery script)");
  console.log("Locking users...");
  const users = await getAllUsers();
  if ("error" in users) {
    console.error(`Error getting a list of users: ${users.error}`);
    process.exit(1);
  }
  for (const oldUser of users) {
    if (oldUser.id === user.id) continue;
    await editUser(oldUser.id, { locked: true });
    await writeLog(user.id, adminUser, "users-edit", { id: oldUser.id, newContents: { locked: true }, protocol: "internal" }, "edited a user (with recovery script)");
  }
  console.log("Your server has been recovered, and you can now log in with your new credentials. Thank you for using FolderHarbor <3");
  process.exit(0);
}