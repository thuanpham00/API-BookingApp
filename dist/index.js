"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
/* eslint-disable no-useless-escape */
/* eslint-disable @typescript-eslint/no-explicit-any */
const express_1 = __importDefault(require("express"));
const body_parser_1 = __importDefault(require("body-parser"));
const crypto_1 = __importDefault(require("crypto"));
const cors_1 = __importDefault(require("cors"));
/**
 * Ngân hàng	NCB
   Số thẻ	9704198526191432198
   Tên chủ thẻ	NGUYEN VAN A
   Ngày phát hành	07/15
   Mật khẩu OTP	123456
*/
const app = (0, express_1.default)();
//Cấu hình body-parser để phân tích cú pháp các yêu cầu HTTP.
app.use((0, cors_1.default)()); // Thêm middleware này để cho phép tất cả các nguồn gốc
app.use(body_parser_1.default.urlencoded({ extended: true }));
app.use(body_parser_1.default.json());
const vnp_TmnCode = 'PJZDWE58'; //  mã máy chủ VNPAY của bạn
const vnp_HashSecret = '5IGOKPDW2OXSGB2NQYXICQY23PBKJA9V'; // khóa bí mật dùng để tạo chữ ký HMAC
const vnp_Url = 'https://sandbox.vnpayment.vn/paymentv2/vpcpay.html';
// Url thanh toán môi trường TEST
const vnp_ReturnUrl = 'http://localhost:5400/bill'; // URL trả về sau khi thanh toán
app.post('/create_payment_url', (req, res) => {
    // Lấy địa chỉ IP của khách hàng từ yêu cầu.
    const ipAddr = req.headers['x-forwarded-for'] ||
        req.connection.remoteAddress ||
        req.socket.remoteAddress ||
        req.connection.socket.remoteAddress;
    const tmnCode = vnp_TmnCode;
    const secretKey = vnp_HashSecret;
    let vnpUrl = vnp_Url;
    const returnUrl = vnp_ReturnUrl;
    const date = new Date();
    const createDate = date
        .toISOString()
        .replace(/[-T:\.Z]/g, '')
        .slice(0, 14);
    const orderId = date.getTime().toString();
    // Lấy các tham số từ yêu cầu POST.
    const amount = req.body.amount;
    const orderInfo = req.body.orderDescription;
    const orderType = req.body.orderType;
    const locale = req.body.language || 'vn';
    const currCode = 'VND';
    let vnp_Params = {
        vnp_Version: '2.1.0', // phiên bản api mà kết nối
        vnp_Command: 'pay', // mã cho giao dịch thanh toán
        vnp_TmnCode: tmnCode, // mã website
        vnp_Locale: locale, // ngôn ngữ giao diện hiển thị
        vnp_CurrCode: currCode, // đơn vị sử dụng tiền tệ thanh toán
        vnp_TxnRef: orderId, // mã id phân biệt đơn hàng
        vnp_OrderInfo: orderInfo, // thông tin mô tả nội dung
        vnp_OrderType: orderType, // mã danh mục hàng hóa
        vnp_Amount: (amount * 100).toString(), // số tiền thanh toán
        vnp_ReturnUrl: returnUrl, // url thông báo ket quả giao dịch trả về
        vnp_IpAddr: ipAddr, // địa chỉ ip khách hàng
        vnp_CreateDate: createDate // thời gian tạo đơn hàng
    };
    vnp_Params = sortObject(vnp_Params);
    // Tạo chữ ký HMAC và thêm vào các tham số
    const signData = new URLSearchParams(vnp_Params).toString();
    const hmac = crypto_1.default.createHmac('sha512', secretKey);
    const signed = hmac.update(Buffer.from(signData, 'utf-8')).digest('hex');
    vnp_Params['vnp_SecureHash'] = signed;
    // Tạo URL thanh toán và chuyển hướng khách hàng
    vnpUrl += '?' + new URLSearchParams(vnp_Params).toString();
    res.json({ url: vnpUrl }); // Trả về URL thanh toán dưới dạng JSON
});
//Hàm sắp xếp các tham số
function sortObject(obj) {
    const sorted = {};
    const keys = Object.keys(obj).sort();
    keys.forEach((key) => {
        sorted[key] = obj[key];
    });
    return sorted;
}
const port = 3000;
app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});
