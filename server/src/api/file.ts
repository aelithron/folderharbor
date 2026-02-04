import express, { Router } from "express";
import { enforceAuth } from "./api.js";
const router: Router = express.Router();
router.use(enforceAuth());

export { router };