import express from "express"
import { generate, makeCall } from './../controllers/ai.controller.js';

const router = express.Router();

router.post("/chat", generate);
router.post("/call", makeCall);


export default router