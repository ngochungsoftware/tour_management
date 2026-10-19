-- ============================================================
-- Migration: Đổi tên cột COMMENT → REVIEW_COMMENT trong REVIEWS
-- Chạy file này 1 lần nếu DB đã có bảng REVIEWS từ schema cũ.
-- ============================================================

-- Kiểm tra cột COMMENT có tồn tại không
DECLARE
    v_count NUMBER;
BEGIN
    SELECT COUNT(*) INTO v_count
    FROM USER_TAB_COLUMNS
    WHERE TABLE_NAME = 'REVIEWS'
      AND COLUMN_NAME = 'COMMENT';

    IF v_count > 0 THEN
        EXECUTE IMMEDIATE 'ALTER TABLE REVIEWS RENAME COLUMN COMMENT TO REVIEW_COMMENT';
        DBMS_OUTPUT.PUT_LINE('OK: đã đổi tên cột COMMENT -> REVIEW_COMMENT');
    ELSE
        DBMS_OUTPUT.PUT_LINE('SKIP: cột COMMENT không tồn tại, không cần đổi');
    END IF;
END;
/

COMMIT;
