package com.logistics.orderservice.repository;

import com.logistics.orderservice.model.ShipmentOrder;
import org.springframework.data.jpa.repository.JpaRepository;

public interface ShipmentOrderRepository extends JpaRepository<ShipmentOrder, Long> {
}
