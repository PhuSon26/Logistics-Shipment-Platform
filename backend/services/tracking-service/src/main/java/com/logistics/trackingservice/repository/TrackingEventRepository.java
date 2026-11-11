package com.logistics.trackingservice.repository;

import com.logistics.trackingservice.model.TrackingEvent;
import org.springframework.data.jpa.repository.JpaRepository;

public interface TrackingEventRepository extends JpaRepository<TrackingEvent, Long> {
}
