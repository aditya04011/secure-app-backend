import express from "express";
import noteTaskController from "../controllers/noteTask.controller.js";
import { authenticateToken } from "../../../core/security/utils/jwt.utils.js";

const router = express.Router();
router.use(authenticateToken);

router.get("/", noteTaskController.getAll);
router.get("/:id", noteTaskController.getById);
router.post("/", noteTaskController.create);
router.put("/:id", noteTaskController.update);
router.delete("/:id", noteTaskController.delete);

export default { path: "/api/modules/noteTasks", router };
