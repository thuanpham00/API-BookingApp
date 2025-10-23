import { Request, Response, Router } from "express";
import { ObjectId } from "mongodb";
import { getDB } from "../db";

const cartRoutes = Router();

cartRoutes.post("/", async (req: Request, res: Response): Promise<void> => {
  try {
    const { uuid, flightData } = req.body;
    if (!uuid || !flightData) {
      res.status(400).json({ success: false });
      return;
    }

    const db = getDB();
    const result = await db.collection("cart").insertOne({ uuid, flightData });
    res.json({ success: true, id: result.insertedId });
  } catch (error) {
    res.status(500).json({ success: false });
  }
});

cartRoutes.get("/:uuid", async (req: Request, res: Response): Promise<void> => {
  try {
    const { uuid } = req.params;
    const db = getDB();
    const cartCollection = db.collection("cart");
    const items = await cartCollection.find({ uuid }).toArray();
    res.json({ success: true, data: items });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: "Lỗi khi lấy giỏ hàng" });
  }
});

cartRoutes.delete("/:id", async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const db = getDB();
    const cartCollection = db.collection("cart");

    const result = await cartCollection.deleteOne({ _id: new ObjectId(id) });

    if (result.deletedCount === 0) {
      res.status(404).json({
        success: false,
        message: "Không tìm thấy vé trong giỏ hàng",
      });
      return; // ✅ Kết thúc hàm để TypeScript hiểu không trả Response
    }

    res.json({
      success: true,
      message: "Đã xóa vé khỏi giỏ hàng",
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: "Lỗi khi xóa vé",
    });
  }
});

export default cartRoutes;
