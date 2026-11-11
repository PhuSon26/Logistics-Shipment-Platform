package com.logistics.notificationservice.controller;

import com.logistics.notificationservice.model.NotificationRecord;
import com.logistics.notificationservice.repository.NotificationRecordRepository;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;
import java.util.List;

@RestController
@RequestMapping("/api/notifications")
@CrossOrigin(origins = "http://localhost:5173")
public class NotificationRecordController {
    private final NotificationRecordRepository repository;

    public NotificationRecordController(NotificationRecordRepository repository) {
        this.repository = repository;
    }

    @GetMapping
    public List<NotificationRecord> findAll() {
        return repository.findAll();
    }

    @GetMapping("/{id}")
    public NotificationRecord findById(@PathVariable Long id) {
        return repository.findById(id)
            .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "NotificationRecord not found"));
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public NotificationRecord create(@RequestBody NotificationRecord request) {
        request.setId(null);
        return repository.save(request);
    }

    @PutMapping("/{id}")
    public NotificationRecord update(@PathVariable Long id, @RequestBody NotificationRecord request) {
        if (!repository.existsById(id)) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "NotificationRecord not found");
        }
        request.setId(id);
        return repository.save(request);
    }

    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void delete(@PathVariable Long id) {
        if (!repository.existsById(id)) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "NotificationRecord not found");
        }
        repository.deleteById(id);
    }
}
