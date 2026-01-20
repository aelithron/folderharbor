import express, { Router } from "express";
const route: Router = express.Router();
route.get("/", (req, res) => res.send("idk even anymore, tired :c"));
export default route;