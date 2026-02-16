import express, { Router } from "express";
import { enforceAuth } from "../api.js";
import { router as usersRouter } from "./users.js";
import { permissions } from "../../permissions/permissions.js";
const router: Router = express.Router();
router.get("/permissions", (req, res) => { res.json(permissions); });
router.use(enforceAuth());
router.use("/users", usersRouter);
export { router };