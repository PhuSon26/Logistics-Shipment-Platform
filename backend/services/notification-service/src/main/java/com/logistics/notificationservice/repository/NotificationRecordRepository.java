package com.logistics.notificationservice.repository;

import com.logistics.notificationservice.model.NotificationRecord;
import org.springframework.data.jpa.repository.JpaRepository;

public interface NotificationRecordRepository extends JpaRepository<NotificationRecord, Long> {
}
