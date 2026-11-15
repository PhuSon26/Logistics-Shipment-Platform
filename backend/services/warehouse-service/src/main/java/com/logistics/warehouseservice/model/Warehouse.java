package com.logistics.warehouseservice.model;

import jakarta.persistence.*;
import jakarta.validation.constraints.*;
import java.time.Instant;

@Entity
@Table(name = "warehouses")
public class Warehouse {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @jakarta.validation.constraints.NotBlank(message = "Warehouse name is required")
    @jakarta.validation.constraints.Size(max = 150)
    private String name;
@jakarta.validation.constraints.NotBlank(message = "Warehouse address is required")
    @jakarta.validation.constraints.Size(max = 500)
    private String address;
@jakarta.validation.constraints.NotNull(message = "Capacity is required")
    @jakarta.validation.constraints.Positive(message = "Capacity must be positive")
    private Integer capacity;
    private Instant createdAt = Instant.now();

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public Instant getCreatedAt() { return createdAt; }

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }

    public String getAddress() { return address; }
    public void setAddress(String address) { this.address = address; }

    public Integer getCapacity() { return capacity; }
    public void setCapacity(Integer capacity) { this.capacity = capacity; }

}
