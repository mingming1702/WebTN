# Web Trắc Nghiệm Tiếng Việt

Ứng dụng web trắc nghiệm môn Tiếng Việt với giao diện màu sáng, đơn giản, dễ thao tác cho học sinh và khu vực quản lý riêng cho giáo viên. Sẵn sàng triển khai trực tiếp lên **Vercel**.

## Cấu trúc đề thi chuẩn
- **Tổng số câu:** 30 câu hỏi trắc nghiệm 4 phương án `A`, `B`, `C`, `D`.
  - **Phần I (Câu 1 – 20):** 20 câu hỏi đơn độc lập.
  - **Phần II (Câu 21 – 25):** Nhóm đọc hiểu 1 (1 ngữ liệu + 5 câu hỏi).
  - **Phần III (Câu 26 – 30):** Nhóm đọc hiểu 2 (1 ngữ liệu + 5 câu hỏi).
- **Thời gian làm bài:** 40 phút / đề (đếm ngược và tự động nộp khi hết giờ).

## Tính năng chính
- **Học sinh (`/` và `/exam`):**
  - Chọn đề, nhập họ tên và lớp rồi làm bài ngay.
  - Bảng điều hướng 30 câu theo từng phần, tự lưu nháp khi đang làm.
  - Xem điểm hệ 10 và số câu đúng ngay sau khi nộp bài.
  - Xem lại toàn bộ bài làm, đáp án đã chọn, đáp án đúng và giải thích (lọc được câu đúng / câu sai).
- **Giáo viên (`/teacher` — mã PIN mặc định: `1234`):**
  - Nhập/chỉnh sửa đề thi chuẩn 30 câu trực tiếp trên web, hỗ trợ nhập nhanh từ văn bản hoặc file JSON.
  - Tự động ghi nhận điểm số và chi tiết bài làm của học sinh.
  - Xem bảng điểm theo đề, tìm theo tên/lớp học sinh, xem lại bài làm từng em và xuất file CSV (mở chuẩn tiếng Việt trong Excel).

## Cấu trúc thư mục tối ưu cho Vercel
```text
├── api/
│   ├── config.js         # Trả về cấu hình môi trường Supabase (nếu có)
│   └── health.js         # Kiểm tra trạng thái API trên Vercel
├── public/
│   ├── index.html        # Trang chủ dành cho học sinh
│   ├── exam.html         # Trang làm bài 40 phút & xem lại đáp án
│   ├── teacher.html      # Trang giáo viên nhập đề & xem bảng điểm
│   ├── css/styles.css    # Giao diện màu sáng, dễ thao tác
│   └── js/               # Logic frontend (ES Modules, không cần bước build phức tạp)
├── supabase/
│   └── schema.sql        # Script tạo bảng nếu bật đồng bộ đa thiết bị
├── vercel.json           # Cấu hình outputDirectory = public, cleanUrls, rewrites /api
├── package.json
└── .env.example
```

## Chạy thử tại máy (Local)
```bash
python -m http.server 3000 --directory public
```
Sau đó mở trình duyệt tại `http://localhost:3000`.

## Triển khai lên Vercel & Đồng bộ nhiều thiết bị
1. **Triển khai tự động:** Kết nối repository GitHub với Vercel. Mỗi lần push code lên Git, Vercel sẽ tự động deploy (không cần cấu hình Build Command vì `vercel.json` đã khai báo `"outputDirectory": "public"` và `/api`).
2. **Đồng bộ nhiều thiết bị (tùy chọn):**
   - Mặc định web chạy ngay ở chế độ **LocalStorage** (phù hợp dùng thử hoặc kiểm tra trên một máy).
   - Để giáo viên nhập đề trên máy tính, học sinh làm trên điện thoại và điểm gửi về máy giáo viên:
     1. Tạo project miễn phí trên [Supabase](https://supabase.com), chạy file [`supabase/schema.sql`](./supabase/schema.sql) trong SQL Editor.
     2. Khai báo `SUPABASE_URL` và `SUPABASE_ANON_KEY` trong **Vercel → Project Settings → Environment Variables** (hoặc nhập trực tiếp ở tab *Cài đặt & Đồng bộ* trong trang Giáo viên).
