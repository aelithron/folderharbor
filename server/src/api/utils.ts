import express, { Router } from "express";
const router: Router = express.Router();
router.get("/", (req, res) => res.send("idk even anymore, tired :c"));
export { router };