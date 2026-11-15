package com.logistics.notificationservice.messaging;
import com.logistics.notificationservice.event.OrderCreatedEvent; import com.logistics.notificationservice.model.NotificationRecord; import com.logistics.notificationservice.repository.NotificationRecordRepository;
import org.springframework.amqp.rabbit.annotation.RabbitListener; import org.springframework.stereotype.Component;
@Component public class OrderCreatedListener {
 private final NotificationRecordRepository repository; public OrderCreatedListener(NotificationRecordRepository repository){this.repository=repository;}
 @RabbitListener(queues="orders.created.notification") public void handle(OrderCreatedEvent event){
  String message="Your shipment order #"+event.orderId()+" has been received.";
  String recipient="customer:"+event.customerId();
  if(repository.existsByRecipientAndMessage(recipient,message)) return;
  NotificationRecord record=new NotificationRecord(); record.setRecipient(recipient); record.setChannel("IN_APP"); record.setMessage(message); record.setStatus("QUEUED"); repository.save(record);
 }
}
