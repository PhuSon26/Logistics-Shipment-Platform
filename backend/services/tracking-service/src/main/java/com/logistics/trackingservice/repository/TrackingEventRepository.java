package com.logistics.trackingservice.repository;
import com.logistics.trackingservice.model.TrackingEvent; import org.springframework.data.jpa.repository.JpaRepository; import java.util.List;
public interface TrackingEventRepository extends JpaRepository<TrackingEvent, Long> { boolean existsByTrackingCodeAndStatus(String trackingCode,String status); List<TrackingEvent> findByTrackingCodeOrderByCreatedAtAsc(String trackingCode); }
