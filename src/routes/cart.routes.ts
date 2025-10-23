import { Request, Response, Router } from "express";
import { getDB } from "../db";

const cartRoutes = Router();

cartRoutes.post("/", async (req: Request, res: Response): Promise<void> => {
  try {
    const { uuid, flightData } = req.body;
    if (!uuid || !flightData) {
      res.status(400).json({ success: false, message: "Thiếu uuid hoặc flightData" });
      return;
    }

    const db = getDB();
    const cartCollection = db.collection("cart");

    // 🔍 Check trùng vé cho cùng user
    const existing = await cartCollection.findOne({
      uuid,
      "flightData.data.flightOffers.0.itineraries.0.segments.0.departure.at":
        flightData.data.flightOffers[0].itineraries[0].segments[0].departure.at,
      "flightData.data.flightOffers.0.itineraries.0.segments.0.arrival.at":
        flightData.data.flightOffers[0].itineraries[0].segments[0].arrival.at,
      "flightData.data.flightOffers.0.itineraries.0.segments.0.carrierCode":
        flightData.data.flightOffers[0].itineraries[0].segments[0].carrierCode,
      "flightData.data.flightOffers.0.travelerPricings.0.price.total":
        flightData.data.flightOffers[0].travelerPricings[0].price.total,
    });

    if (existing) {
      res.status(409).json({ success: false, message: "Chuyến bay đã có trong giỏ hàng" });
      return;
    }

    await cartCollection.insertOne({ uuid, flightData, createdAt: new Date() });
    res.json({ success: true, message: "Thêm vào giỏ hàng thành công" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: "Lỗi khi thêm vào giỏ hàng" });
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

cartRoutes.delete("/", async (req: Request, res: Response): Promise<void> => {
  try {
    const { uuid, uuid_ticket } = req.body;

    if (!uuid || !uuid_ticket) {
      res.status(400).json({
        success: false,
        message: "Thiếu uuid hoặc uuid_ticket",
      });
      return;
    }

    const db = getDB();
    const cartCollection = db.collection("cart");

    // Xóa theo người dùng + mã vé
    const result = await cartCollection.deleteOne({
      uuid,
      "flightData.uuid_ticket": uuid_ticket,
    });

    if (result.deletedCount === 0) {
      res.status(404).json({
        success: false,
        message: "Không tìm thấy vé để xóa",
      });
      return;
    }

    res.json({
      success: true,
      message: "Đã xóa vé khỏi giỏ hàng",
    });
  } catch (error) {
    console.error("❌ Lỗi khi xóa vé:", error);
    res.status(500).json({
      success: false,
      message: "Lỗi khi xóa vé khỏi giỏ hàng",
    });
  }
});

export default cartRoutes;
