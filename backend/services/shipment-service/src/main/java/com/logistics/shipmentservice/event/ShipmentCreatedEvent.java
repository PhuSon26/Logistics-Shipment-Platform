package com.logistics.shipmentservice.event;

import java.time.Instant;

public record ShipmentCreatedEvent(
    Long orderId,
    String trackingCode,
    String carrier,
    String status,
    Instant createdAt
) {}