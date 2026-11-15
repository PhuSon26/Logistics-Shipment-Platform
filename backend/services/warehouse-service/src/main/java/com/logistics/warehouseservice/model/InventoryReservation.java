package com.logistics.warehouseservice.model;
import jakarta.persistence.*; import java.time.Instant;
@Entity @Table(name="inventory_reservations")
public class InventoryReservation {
 @Id @GeneratedValue(strategy=GenerationType.IDENTITY) private Long id;
 @Column(nullable=false, unique=true) private Long orderId;
 private Long customerId; @Column(length=1000) private String packageDescription;
 private String status="REQUESTED"; private Instant createdAt=Instant.now();
 public Long getId(){return id;} public Long getOrderId(){return orderId;} public void setOrderId(Long v){orderId=v;}
 public Long getCustomerId(){return customerId;} public void setCustomerId(Long v){customerId=v;}
 public String getPackageDescription(){return packageDescription;} public void setPackageDescription(String v){packageDescription=v;}
 public String getStatus(){return status;} public void setStatus(String v){status=v;} public Instant getCreatedAt(){return createdAt;}
}
