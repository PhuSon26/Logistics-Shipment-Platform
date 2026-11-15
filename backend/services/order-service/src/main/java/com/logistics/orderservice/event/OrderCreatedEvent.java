package com.logistics.orderservice.event;
import java.time.Instant;
public record OrderCreatedEvent(Long orderId, Long customerId, String originAddress, String destinationAddress, String packageDescription, Instant createdAt) {}
