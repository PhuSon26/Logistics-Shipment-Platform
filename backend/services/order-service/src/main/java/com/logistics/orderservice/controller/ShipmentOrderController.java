package com.logistics.orderservice.controller;

import com.logistics.orderservice.model.ShipmentOrder;
import com.logistics.orderservice.repository.ShipmentOrderRepository;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;
import java.util.List;

@RestController
@RequestMapping("/api/orders")
@CrossOrigin(origins = "http://localhost:5173")
public class ShipmentOrderController {
    private final ShipmentOrderRepository repository;

    public ShipmentOrderController(ShipmentOrderRepository repository) {
        this.repository = repository;
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
    public ShipmentOrder create(@RequestBody ShipmentOrder request) {
        request.setId(null);
        return repository.save(request);
    }

    @PutMapping("/{id}")
    public ShipmentOrder update(@PathVariable Long id, @RequestBody ShipmentOrder request) {
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
