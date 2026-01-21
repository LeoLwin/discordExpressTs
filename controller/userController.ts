// const router = require("express").Router();
import express from "express";
import ServiceBroker from "../broker/broker"
import ResponseStatus from "../helper/responseStatus";
import type { Request, Response, NextFunction } from "express";

const router = express.Router();

const handleError = (res: Response, err: Error) => {
  console.error("Endpoint error:", err);
  res.json(ResponseStatus.UNKNOWN(err.message));
};


router.get("/list", async (req: Request, res: Response) => {
  try {
    const { current, limit, role } = req.body;
    console.log("req.body :", req.body);
    if (!current || !limit) {
      return res.json({ message: "Invalid parameters" })
    }
    const result: any = await ServiceBroker.call("blog.list", { current, limit });
    console.log("Result : ", result);
    res.json({ result });
  } catch (err) {
    handleError(res, err as Error);
  }
});

router.get("/get/:id", async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    if (!id) return res.json({ message: "Blog ID is required" });

    const result = await ServiceBroker.call("blog.get", { id });

    res.json({ result });
  } catch (err: any) {
    handleError(res, err);
  }
});

router.post("/create", async (req: Request, res: Response) => {
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
    const result = await ServiceBroker.call("blog.create", { title, content });
    console.log("Result:", result);

    res.json({ result });
  } catch (err: any) {
    handleError(res, err);
  }
});

router.put("/update/:id", async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { title, content } = req.body;

    if (!id) return res.json({ message: "Blog ID is required" });

    const result = await ServiceBroker.call("blog.update", {
      id,
      title,
      content,
    });

    res.json({ result });
  } catch (err: any) {
    handleError(res, err);
  }
});

router.delete("/delete/:id", async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    if (!id) return res.json({ message: "Blog ID is required" });

    const result = await ServiceBroker.call("blog.delete", { id });

    res.json({ result });
  } catch (err: any) {
    handleError(res, err);
  }
});

export default router;

