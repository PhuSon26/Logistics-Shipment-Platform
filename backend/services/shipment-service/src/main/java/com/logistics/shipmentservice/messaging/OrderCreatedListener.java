package com.logistics.shipmentservice.messaging;
import com.logistics.shipmentservice.event.OrderCreatedEvent; import com.logistics.shipmentservice.event.ShipmentCreatedEvent; import com.logistics.shipmentservice.model.Shipment; import com.logistics.shipmentservice.repository.ShipmentRepository;
import org.springframework.amqp.rabbit.core.RabbitTemplate; import org.springframework.amqp.rabbit.annotation.RabbitListener; import org.springframework.stereotype.Component; import java.time.Instant; import java.util.UUID;
@Component public class OrderCreatedListener {
 private final ShipmentRepository repository; private final RabbitTemplate rabbitTemplate;
 public OrderCreatedListener(ShipmentRepository repository,RabbitTemplate rabbitTemplate){this.repository=repository;this.rabbitTemplate=rabbitTemplate;}
 @RabbitListener(queues="orders.created.shipment") public void handle(OrderCreatedEvent event){
  Shipment shipment=repository.findByOrderId(event.orderId()).orElseGet(()->{Shipment s=new Shipment();s.setOrderId(event.orderId());s.setTrackingCode("FF-"+event.orderId()+"-"+UUID.randomUUID().toString().substring(0,8).toUpperCase());s.setCarrier("UNASSIGNED");s.setStatus("CREATED");return repository.save(s);});
  rabbitTemplate.convertAndSend("logistics.events","shipment.created",new ShipmentCreatedEvent(shipment.getOrderId(),shipment.getTrackingCode(),shipment.getCarrier(),shipment.getStatus(),Instant.now()));
 }
}
