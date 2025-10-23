import { Router, Request, Response } from "express";
import { getDB } from "../db";

const cancelRoutes = Router();

cancelRoutes.post("/", async (req: Request, res: Response): Promise<void> => {
  try {
    const { uuid, data } = req.body;

    if (!uuid || !data) {
      res.status(400).json({ success: false, message: "Thiếu uuid hoặc dữ liệu vé" });
      return;
    }

    const db = getDB();
    const cancelCollection = db.collection("purchase_cancel");
    const purchaseCollection = db.collection("purchase");

    // Kiểm tra vé này đã hủy trước đó chưa
    const existing = await cancelCollection.findOne({
      uuid,
      "data.uuid_ticket": data.uuid_ticket,
    });

    const existingPurchase = await purchaseCollection.findOne({
      uuid,
      "data.uuid_ticket": data.uuid_ticket,
    });

    if (existing) {
      res.status(409).json({
        success: false,
        message: "Vé này đã tồn tại trong danh sách hủy",
      });
      return;
    }

    if (!existingPurchase) {
      res.status(404).json({
        success: false,
        message: "Không tìm thấy vé để hủy trong danh sách mua",
      });
      return;
    }

    const newCancel = {
      uuid,
      data,
      canceledAt: new Date(),
    };
    const result = await cancelCollection.insertOne(newCancel);

    await purchaseCollection.deleteOne({
      uuid,
      "data.uuid_ticket": data.uuid_ticket,
    });

    res.json({
      success: true,
      message: "Thêm vé hủy thành công",
      id: result.insertedId,
    });
  } catch (error) {
    console.error("❌ Lỗi khi thêm vé hủy:", error);
    res.status(500).json({
      success: false,
      message: "Lỗi server khi thêm vé hủy",
    });
  }
});

cancelRoutes.get("/:uuid", async (req: Request, res: Response): Promise<void> => {
  try {
    const { uuid } = req.params;

    const db = getDB();
    const cancelCollection = db.collection("purchase_cancel");

    const canceledTickets = await cancelCollection.find({ uuid }).toArray();

    res.json({
      success: true,
      data: canceledTickets,
    });
  } catch (error) {
    console.error("❌ Lỗi khi lấy danh sách vé hủy:", error);
    res.status(500).json({
      success: false,
      message: "Lỗi server khi lấy danh sách vé hủy",
    });
  }
});

export default cancelRoutes;
