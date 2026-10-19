# TravelGo - Hệ thống quản lý và đặt tour du lịch

Đồ án Java Spring Boot + Oracle. REST API đầy đủ cho khách hàng và admin.

## Công nghệ

- Java 17
- Spring Boot 3.3
- Spring Security + JWT
- Spring Data JPA / Hibernate
- Oracle Database
- MapStruct, Lombok, Validation
- Swagger (springdoc)

## Chuẩn bị Oracle

1. Cài Oracle XE (hoặc local SID/service tương đương).
2. Tạo user:

```sql
ALTER SESSION SET CONTAINER = XEPDB1;
CREATE USER travelgo IDENTIFIED BY travelgo;
GRANT CONNECT, RESOURCE, UNLIMITED TABLESPACE TO travelgo;
```

3. Đăng nhập user `travelgo` và chạy:

```text
src/main/resources/db/schema.sql
```

4. Sửa `src/main/resources/application.yml` nếu host/port/service name khác:

```yaml
spring.datasource.url: jdbc:oracle:thin:@localhost:1521/XEPDB1
spring.datasource.username: travelgo
spring.datasource.password: travelgo
```

Hibernate `ddl-auto: none`. Schema do SQL quản lý (Sequence, PK, FK, Unique, Check, Index).

## Chạy ứng dụng

```bash
mvn spring-boot:run
```

Lần đầu start, `DataSeeder` tự tạo:

| Tài khoản | Email | Mật khẩu |
|-----------|--------|----------|
| Admin | admin@travelgo.com | Admin@123 |
| Customer | customer@travelgo.com | Customer@123 |

Kèm 5 danh mục, 10 điểm đến, 20 tour, ~30 lịch, coupon `SUMMER10`, booking và review mẫu.

## Swagger

- UI: http://localhost:8080/swagger-ui.html
- Authorize bằng `Bearer <token>` sau khi gọi `/api/v1/auth/login`

## API chính

```text
POST /api/v1/auth/register
POST /api/v1/auth/login
GET  /api/v1/home
GET  /api/v1/tours?page=0&size=10&sort=adultPrice,asc&keyword=Đà Nẵng
GET  /api/v1/tours/{id}
POST /api/v1/bookings
GET  /api/v1/bookings/my
POST /api/v1/bookings/{id}/cancel
POST /api/v1/payments/{bookingId}/simulate?success=true
POST /api/v1/reviews
GET  /api/v1/favorites
GET  /api/v1/admin/dashboard
```

Tổng tiền booking **luôn tính trên backend** (`BigDecimal`). Số chỗ được trừ trong `@Transactional` và khóa lịch (`PESSIMISTIC_WRITE`) để không đặt vượt chỗ.

## Test

```bash
mvn test
```

## Ghi chú đồ án

- Quên mật khẩu: trả `resetToken` trong response (không gửi email thật).
- Thanh toán: mô phỏng CASH / BANK_TRANSFER / ONLINE.

