package com.logistics.shipmentservice.controller;

import com.logistics.shipmentservice.model.Shipment;
import com.logistics.shipmentservice.repository.ShipmentRepository;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;
import java.util.List;

@RestController
@RequestMapping("/api/shipments")
@CrossOrigin(origins = "http://localhost:5173")
public class ShipmentController {
    private final ShipmentRepository repository;

    public ShipmentController(ShipmentRepository repository) {
        this.repository = repository;
    }

    @GetMapping
    public List<Shipment> findAll() {
        return repository.findAll();
    }

    @GetMapping("/{id}")
    public Shipment findById(@PathVariable Long id) {
        return repository.findById(id)
            .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Shipment not found"));
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public Shipment create(@RequestBody Shipment request) {
        request.setId(null);
        return repository.save(request);
    }

    @PutMapping("/{id}")
    public Shipment update(@PathVariable Long id, @RequestBody Shipment request) {
        if (!repository.existsById(id)) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Shipment not found");
        }
        request.setId(id);
        return repository.save(request);
    }

    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void delete(@PathVariable Long id) {
        if (!repository.existsById(id)) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Shipment not found");
        }
        repository.deleteById(id);
    }
}
