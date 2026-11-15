package com.logistics.warehouseservice.repository;

import com.logistics.warehouseservice.model.Warehouse;
import org.springframework.data.jpa.repository.JpaRepository;

public interface WarehouseRepository extends JpaRepository<Warehouse, Long> {
}
