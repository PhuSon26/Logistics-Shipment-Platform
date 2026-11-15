package com.logistics.warehouseservice.messaging;
import com.logistics.warehouseservice.event.OrderCreatedEvent; import com.logistics.warehouseservice.model.InventoryReservation; import com.logistics.warehouseservice.repository.InventoryReservationRepository;
import org.springframework.amqp.rabbit.annotation.RabbitListener; import org.springframework.stereotype.Component;
@Component public class OrderCreatedListener {
 private final InventoryReservationRepository repository; public OrderCreatedListener(InventoryReservationRepository repository){this.repository=repository;}
 @RabbitListener(queues="orders.created.warehouse") public void handle(OrderCreatedEvent event){
  if(repository.findByOrderId(event.orderId()).isPresent()) return;
  InventoryReservation reservation=new InventoryReservation(); reservation.setOrderId(event.orderId()); reservation.setCustomerId(event.customerId()); reservation.setPackageDescription(event.packageDescription()); reservation.setStatus("REQUESTED"); repository.save(reservation);
 }
}
