package com.logistics.trackingservice.messaging;
import com.logistics.trackingservice.event.ShipmentCreatedEvent; import com.logistics.trackingservice.model.TrackingEvent; import com.logistics.trackingservice.repository.TrackingEventRepository;
import org.springframework.amqp.rabbit.annotation.RabbitListener; import org.springframework.stereotype.Component;
@Component public class ShipmentCreatedListener {
 private final TrackingEventRepository repository; public ShipmentCreatedListener(TrackingEventRepository repository){this.repository=repository;}
 @RabbitListener(queues="shipments.created.tracking") public void handle(ShipmentCreatedEvent event){
  if(repository.existsByTrackingCodeAndStatus(event.trackingCode(),"ORDER_CREATED")) return;
  TrackingEvent tracking=new TrackingEvent(); tracking.setTrackingCode(event.trackingCode()); tracking.setLocation("Order processing center"); tracking.setStatus("ORDER_CREATED"); tracking.setDetails("Shipment created for order #"+event.orderId()); repository.save(tracking);
 }
}
