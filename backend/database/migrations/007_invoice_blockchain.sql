-- Bổ sung các cột phục vụ việc neo dữ liệu lên Blockchain cho bảng invoices
ALTER TABLE nf_core.invoices 
ADD COLUMN data_hash VARCHAR(255),
ADD COLUMN tx_hash VARCHAR(255);
