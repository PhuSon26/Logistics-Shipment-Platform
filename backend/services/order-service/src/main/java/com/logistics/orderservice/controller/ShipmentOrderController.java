package com.logistics.orderservice.controller;

import com.logistics.orderservice.model.ShipmentOrder;
import com.logistics.orderservice.repository.ShipmentOrderRepository;
import com.logistics.orderservice.event.OrderCreatedEvent;
import org.springframework.amqp.rabbit.core.RabbitTemplate;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;
import jakarta.validation.Valid;
import org.springframework.web.server.ResponseStatusException;
import java.util.List;

@RestController
@RequestMapping("/api/orders")
@CrossOrigin(origins = {"http://localhost:3000", "http://localhost:5173"})
public class ShipmentOrderController {
    private final ShipmentOrderRepository repository;
    private final RabbitTemplate rabbitTemplate;

    public ShipmentOrderController(ShipmentOrderRepository repository, RabbitTemplate rabbitTemplate) {
        this.repository = repository;
        this.rabbitTemplate = rabbitTemplate;
    }

    @GetMapping
    public List<ShipmentOrder> findAll() {
        return repository.findAll();
    }

    @GetMapping("/{id}")
    public ShipmentOrder findById(@PathVariable Long id) {
        return repository.findById(id)
            .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "ShipmentOrder not found"));
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public ShipmentOrder create(@Valid @RequestBody ShipmentOrder request) {
        request.setId(null);
        if (request.getStatus() == null || request.getStatus().isBlank()) request.setStatus("PENDING");
        ShipmentOrder saved = repository.save(request);
        rabbitTemplate.convertAndSend("logistics.events", "order.created",
            new OrderCreatedEvent(saved.getId(), saved.getCustomerId(), saved.getOriginAddress(),
                saved.getDestinationAddress(), saved.getPackageDescription(), saved.getCreatedAt()));
        return saved;
    }

    @PutMapping("/{id}")
    public ShipmentOrder update(@PathVariable Long id, @Valid @RequestBody ShipmentOrder request) {
        if (!repository.existsById(id)) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "ShipmentOrder not found");
        }
        request.setId(id);
        return repository.save(request);
    }

    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void delete(@PathVariable Long id) {
        if (!repository.existsById(id)) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "ShipmentOrder not found");
        }
        repository.deleteById(id);
    }
}
