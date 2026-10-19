-- ============================================================
-- Script RESET SCHEMA: Xóa sạch schema để Hibernate tạo lại từ đầu
-- Chạy file này TRƯỚC KHI start Spring Boot với ddl-auto: create
-- ============================================================

BEGIN
    FOR c IN (SELECT table_name FROM user_tables) LOOP
        EXECUTE IMMEDIATE 'DROP TABLE "' || c.table_name || '" CASCADE CONSTRAINTS';
        DBMS_OUTPUT.PUT_LINE('Dropped table: ' || c.table_name);
    END LOOP;
END;
/

BEGIN
    FOR s IN (SELECT sequence_name FROM user_sequences) LOOP
        EXECUTE IMMEDIATE 'DROP SEQUENCE "' || s.sequence_name || '"';
        DBMS_OUTPUT.PUT_LINE('Dropped sequence: ' || s.sequence_name);
    END LOOP;
END;
/

PURGE RECYCLEBIN;

COMMIT;

PROMPT Schema reset successfully!
