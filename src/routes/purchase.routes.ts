import { Router, Request, Response } from "express";
import { getDB } from "../db";

const purchaseRoutes = Router();

purchaseRoutes.post("/", async (req: Request, res: Response): Promise<void> => {
  try {
    const { uuid, data } = req.body;

    if (!uuid || !data) {
      res.status(400).json({ success: false, message: "Thiếu uuid hoặc data vé" });
      return;
    }

    const db = getDB();
    const purchaseCollection = db.collection("purchase");

    // kiểm tra xem vé này đã tồn tại chưa (dựa theo uuid_ticket)
    const existing = await purchaseCollection.findOne({
      uuid,
      "data.uuid_ticket": data.uuid_ticket,
    });

    if (existing) {
      res.status(409).json({
        success: false,
        message: "Vé này đã tồn tại trong danh sách mua",
      });
      return;
    }

    const newPurchase = {
      uuid,
      data,
      createdAt: new Date(),
    };

    const result = await purchaseCollection.insertOne(newPurchase);

    res.json({
      success: true,
      message: "Thêm vé đã mua thành công",
      id: result.insertedId,
    });
  } catch (error) {
    console.error("❌ Lỗi khi thêm vé:", error);
    res.status(500).json({
      success: false,
      message: "Lỗi server khi thêm vé đã mua",
    });
  }
});

purchaseRoutes.get("/:uuid", async (req: Request, res: Response): Promise<void> => {
  try {
    const { uuid } = req.params;
    const db = getDB();
    const purchaseCollection = db.collection("purchase");

    const purchases = await purchaseCollection.find({ uuid }).toArray();

    res.json({
      success: true,
      data: purchases,
    });
  } catch (error) {
    console.error("❌ Lỗi khi lấy danh sách vé:", error);
    res.status(500).json({
      success: false,
      message: "Lỗi khi lấy danh sách vé đã mua",
    });
  }
});

export default purchaseRoutes;
