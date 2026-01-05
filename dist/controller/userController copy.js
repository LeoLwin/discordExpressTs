"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
// const router = require("express").Router();
const express_1 = __importDefault(require("express"));
const broker_1 = __importDefault(require("../broker/broker"));
const responseStatus_1 = __importDefault(require("../helper/responseStatus"));
const router = express_1.default.Router();
const handleError = (res, err) => {
    console.error("Endpoint error:", err);
    res.json(responseStatus_1.default.UNKNOWN(err.message));
};
router.get("/list", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { current, limit, role } = req.body;
        console.log("req.body :", req.body);
        if (!current || !limit) {
            return res.json({ message: "Invalid parameters" });
        }
        const result = yield broker_1.default.call("blog.list", { current, limit });
        console.log("Result : ", result);
        res.json({ result });
    }
    catch (err) {
        handleError(res, err);
    }
}));
router.get("/get/:id", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { id } = req.params;
        if (!id)
            return res.json({ message: "Blog ID is required" });
        const result = yield broker_1.default.call("blog.get", { id });
        res.json({ result });
    }
    catch (err) {
        handleError(res, err);
    }
}));
router.post("/create", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        if (!req.body) {
            return res.json({ message: "Not found req.body" });
        }
        console.log("req.body : ", req.body);
        const { title, content } = req.body;
        if (!title || !content) {
            return res.json({ message: "Invalid arguments" });
        }
        // Call Moleculer service
        const result = yield broker_1.default.call("blog.create", { title, content });
        console.log("Result:", result);
        res.json({ result });
    }
    catch (err) {
        handleError(res, err);
    }
}));
router.put("/update/:id", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { id } = req.params;
        const { title, content } = req.body;
        if (!id)
            return res.json({ message: "Blog ID is required" });
        const result = yield broker_1.default.call("blog.update", {
            id,
            title,
            content,
        });
        res.json({ result });
    }
    catch (err) {
        handleError(res, err);
    }
}));
router.delete("/delete/:id", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { id } = req.params;
        if (!id)
            return res.json({ message: "Blog ID is required" });
        const result = yield broker_1.default.call("blog.delete", { id });
        res.json({ result });
    }
    catch (err) {
        handleError(res, err);
    }
}));
exports.default = router;
