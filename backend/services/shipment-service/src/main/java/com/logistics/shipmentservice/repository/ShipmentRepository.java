package com.logistics.shipmentservice.repository;

import com.logistics.shipmentservice.model.Shipment;
import org.springframework.data.jpa.repository.JpaRepository;

public interface ShipmentRepository extends JpaRepository<Shipment, Long> {
}
