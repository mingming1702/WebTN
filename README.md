# Web Trắc Nghiệm Tiếng Việt – VACT 2026

Ứng dụng web giao bài tập online và ôn thi môn Tiếng Việt (chuẩn cấu trúc 30 câu ĐGNL / VACT), tổ chức theo kiến trúc **MVVM** với Vanilla JavaScript ES Modules (không cần bước build), sẵn sàng triển khai lên **Vercel**.

## Cấu trúc bài tập & đề luyện chuẩn
- **Tổng số câu:** 30 câu hỏi trắc nghiệm 4 phương án `A`, `B`, `C`, `D`.
  - **Phần I (Câu 1 – 20):** 20 câu hỏi đơn độc lập.
  - **Phần II (Câu 21 – 25):** Ngữ liệu đọc hiểu 1 + 5 câu hỏi.
  - **Phần III (Câu 26 – 30):** Ngữ liệu đọc hiểu 2 + 5 câu hỏi.
- **Thang điểm:** Hệ 30 điểm (1 câu đúng = 1 điểm; đề 30 câu tối đa 30/30).

## Tính năng chính
- **Học sinh (`/` và `/exam`):**
  - Giao diện học tập sáng, dịu mắt, lọc bài chưa làm / đã làm và xem tiến độ cá nhân.
  - Hai hình thức làm bài:
    - **Ôn luyện / Bài tập:** Đếm thời gian làm bài mà không ép tự nộp, hỗ trợ **kiểm tra đáp án & giải thích ngay từng câu**.
    - **Thi thử bấm giờ:** Đếm ngược theo thời gian thực (`Date.now()`), tự nộp khi hết giờ.
  - Split-view đọc hiểu giữ ngữ liệu cố định bên trái kèm nút tăng/giảm cỡ chữ (`A- / A+`), tự lưu nháp bài làm, đánh dấu câu xem lại, lọc câu đúng/sai khi xem lại kết quả.
- **Giáo viên (`/teacher` — mã PIN mặc định: `1234`):**
  - **Soạn bài tập từng câu hỏi & đáp án:** Giao diện 2 cột cho phép thêm lần lượt từng câu một (hoặc chèn vào từng phần), sắp xếp thứ tự lên/xuống, lưu nháp giữa chừng (khi chưa đủ 30 câu) và chỉ kiểm tra đủ 30 câu khi mở giao bài.
  - Vẫn hỗ trợ **Nhập nhanh từ văn bản** (Copy/Paste kèm `Giải thích:`) và nhập/xuất file JSON, nhân bản đề.
  - **Theo dõi kết quả:** Thống kê điểm, Top câu hỏi học sinh hay sai nhất, xem chi tiết bài làm và xuất file CSV (UTF-8 BOM cho Excel).

## Kiến trúc MVVM & Cấu trúc thư mục
```text
├── api/
│   ├── config.js                   # Trả về cấu hình Supabase từ biến môi trường Vercel
│   └── health.js                   # Kiểm tra trạng thái API
├── public/
│   ├── index.html                  # Trang chủ học sinh
│   ├── exam.html                   # Không gian làm bài tập / ôn luyện & xem lại
│   ├── teacher.html                # Khu vực giáo viên
│   ├── css/
│   │   ├── tokens.css              # Design tokens (màu sắc, chữ, bo góc, đổ bóng)
│   │   ├── base.css                # Thành phần UI dùng chung
│   │   ├── home.css                # Giao diện trang chủ & thẻ bài tập
│   │   ├── workspace.css           # Giao diện làm bài tập & split-view đọc hiểu
│   │   └── teacher.css             # Giao diện soạn từng câu & thống kê giáo viên
│   └── js/
│       ├── core/                   # ObservableStore / BaseViewModel, formatters, id
│       ├── models/                 # Exam model, grading, quick-parser, storage repository
│       ├── viewmodels/             # Home, Workspace, Teacher Auth/Exams/Editor/Scores/Settings
│       ├── views/                  # Render DOM & gắn event từ ViewModel
│       ├── pages/                  # Entrypoints nối ViewModel <-> View
│       └── sample-data.js          # 5 bộ đề mẫu Đề 11 – Đề 15
├── supabase/
│   └── schema.sql                  # Script tạo bảng Supabase (exams, submissions)
├── scripts/
│   └── dev-server.mjs              # Local dev server hỗ trợ cleanUrls và /api/*
├── tests/                          # Unit tests chạy bằng Node built-in test runner
├── vercel.json
└── package.json
```

## Chạy thử & Kiểm thử tại máy (Local)
```bash
# Chạy unit tests (Node >= 22)
npm test

# Chạy static server local
npm run dev
```
Sau đó mở trình duyệt tại `http://localhost:3000`.

## Triển khai lên Vercel & Đồng bộ nhiều thiết bị
1. **Triển khai tự động:** Kết nối repository GitHub với Vercel (`vercel.json` đã khai báo `"outputDirectory": "public"` và `/api`).
2. **Đồng bộ nhiều thiết bị (Supabase — tùy chọn):**
   - Tạo project trên [Supabase](https://supabase.com) và chạy toàn bộ [`supabase/schema.sql`](./supabase/schema.sql) trong SQL Editor.
   - Khai báo `SUPABASE_URL` và `SUPABASE_ANON_KEY` trong **Vercel → Project Settings → Environment Variables** (hoặc cấu hình trực tiếp ở tab *Cài đặt & Đồng bộ* trong `/teacher`).
