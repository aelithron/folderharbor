import express, { type Router } from "express";
const router: Router = express.Router();
router.get("/", (req, res) => {
  res.send(`

  `);
});
export { router };