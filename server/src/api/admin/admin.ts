import express, { Router } from "express";
import { enforceAuth } from "../api.js";
import { router as usersRouter } from "./users.js";
const router: Router = express.Router();
router.use(enforceAuth());
router.use("/users", usersRouter);
export { router };