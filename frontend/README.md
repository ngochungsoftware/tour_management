# TravelGo Frontend

React + TypeScript + Vite + TailwindCSS frontend cho hệ thống TravelGo.

## Cấu trúc

```
src/
├── api/        # Axios client + 9 module API (auth, tour, booking, ...)
├── components/ # Shared UI: Header, Footer, Layout, TourCard, modals
├── context/    # AuthContext (JWT state)
├── hooks/      # useAsync helper
├── pages/      # Tất cả các page theo feature
│   ├── auth/   # LoginPage, RegisterPage, ForgotPasswordPage
│   ├── home/   # HomePage (hero + sections)
│   ├── tour/   # TourListPage, TourDetailPage
│   ├── booking/# BookingPage, MyBookingsPage, BookingDetailPage
│   ├── profile/ProfilePage
│   ├── favorite/FavoritesPage
│   ├── admin/  # Dashboard, Tour, Booking, User, Catalog, Coupon, Review
│   └── notFound/NotFoundPage
├── types/      # Toàn bộ interface TypeScript (mirror với DTO backend)
├── utils/      # format.ts (VND, date, badge)
└── main.tsx, App.tsx
```

## Cài đặt & chạy

```bash
cd frontend
npm install
npm run dev
```

App sẽ chạy ở `http://localhost:3000` (đã cấu hình proxy `/api` → `http://localhost:8080`).

## Kết nối với Backend

1. Đảm bảo backend Spring Boot đang chạy ở `http://localhost:8080`
2. Vite dev server sẽ tự động proxy các request `/api/*` và `/uploads/*` sang backend
3. Khi build production, cần cấu hình CORS hoặc reverse proxy (Nginx)

## Tài khoản demo

- **Admin**: `admin@travelgo.com` / `Admin@123`
- **Customer**: `customer@travelgo.com` / `Customer@123`

## Tính năng

### Customer
- Trang chủ với hero, tour nổi bật, danh mục, điểm đến
- Tìm kiếm & lọc tour (keyword, danh mục, điểm đến, giá, ngày)
- Chi tiết tour: gallery, lịch trình, đánh giá, đặt tour
- Đặt tour: chọn lịch, số khách, thông tin hành khách, mã giảm giá, thanh toán
- Đơn đặt của tôi + chi tiết + hủy + thanh toán + đánh giá
- Yêu thích (thêm/xóa/xem)
- Hồ sơ: cập nhật thông tin, đổi mật khẩu, upload avatar

### Admin
- Dashboard: tổng quan khách hàng, tour, doanh thu, trạng thái booking
- Quản lý tour: CRUD, đổi trạng thái
- Quản lý booking: xem, xác nhận, hoàn thành, hủy
- Quản lý khách hàng: xem, khóa/mở khóa
- Quản lý danh mục & điểm đến: CRUD
- Quản lý mã giảm giá: CRUD
- Quản lý đánh giá: ẩn/hiện/xóa

## Stack

- **React 18** + **TypeScript** + **Vite**
- **React Router v6** - routing
- **Axios** - HTTP client
- **TailwindCSS 3** - utility-first CSS
- **react-hot-toast** - notifications
- **lucide-react** - icons
