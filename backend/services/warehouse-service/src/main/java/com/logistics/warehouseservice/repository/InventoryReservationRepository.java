package com.logistics.warehouseservice.repository;
import com.logistics.warehouseservice.model.InventoryReservation; import org.springframework.data.jpa.repository.JpaRepository; import java.util.Optional;
public interface InventoryReservationRepository extends JpaRepository<InventoryReservation,Long> { Optional<InventoryReservation> findByOrderId(Long orderId); }
