import { Session } from "@/folderharborweb";
import Dexie, { type EntityTable } from "dexie";
const db = new Dexie("FolderHarborDB") as Dexie & { sessions: EntityTable<Session, "webID"> };
db.version(1).stores({ sessions: "++webID, server, token, username" });
export { db };