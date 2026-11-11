package com.logistics.trackingservice.controller;

import com.logistics.trackingservice.model.TrackingEvent;
import com.logistics.trackingservice.repository.TrackingEventRepository;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;
import java.util.List;

@RestController
@RequestMapping("/api/tracking")
@CrossOrigin(origins = "http://localhost:5173")
public class TrackingEventController {
    private final TrackingEventRepository repository;

    public TrackingEventController(TrackingEventRepository repository) {
        this.repository = repository;
    }

    @GetMapping
    public List<TrackingEvent> findAll() {
        return repository.findAll();
    }

    @GetMapping("/{id}")
    public TrackingEvent findById(@PathVariable Long id) {
        return repository.findById(id)
            .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "TrackingEvent not found"));
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public TrackingEvent create(@RequestBody TrackingEvent request) {
        request.setId(null);
        return repository.save(request);
    }

    @PutMapping("/{id}")
    public TrackingEvent update(@PathVariable Long id, @RequestBody TrackingEvent request) {
        if (!repository.existsById(id)) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "TrackingEvent not found");
        }
        request.setId(id);
        return repository.save(request);
    }

    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void delete(@PathVariable Long id) {
        if (!repository.existsById(id)) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "TrackingEvent not found");
        }
        repository.deleteById(id);
    }
}
