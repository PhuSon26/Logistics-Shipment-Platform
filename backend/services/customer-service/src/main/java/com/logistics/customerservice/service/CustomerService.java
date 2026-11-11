package com.logistics.customerservice.service;

import com.logistics.customerservice.dto.CustomerRequest;
import com.logistics.customerservice.dto.CustomerResponse;
import com.logistics.customerservice.model.Customer;
import com.logistics.customerservice.repository.CustomerRepository;

import org.springframework.data.domain.Sort;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;

@Service
@Transactional
public class CustomerService {

    private final CustomerRepository repository;

    public CustomerService(CustomerRepository repository) {
        this.repository = repository;
    }

    @Transactional(readOnly = true)
    public List<CustomerResponse> findAll() {
        return repository.findAll(
            Sort.by(Sort.Direction.DESC, "createdAt")
        )
        .stream()
        .map(this::toResponse)
        .toList();
    }

    @Transactional(readOnly = true)
    public CustomerResponse findById(Long id) {
        return toResponse(findCustomer(id));
    }

    public CustomerResponse create(CustomerRequest request) {

        String email = normalizeEmail(request.email());

        if (repository.existsByEmailIgnoreCase(email)) {
            throw new ResponseStatusException(
                HttpStatus.CONFLICT,
                "Email is already registered"
            );
        }

        Customer customer = new Customer();

        applyRequest(customer, request, email);

        return toResponse(repository.save(customer));
    }

    public CustomerResponse update(
        Long id,
        CustomerRequest request
    ) {

        Customer customer = findCustomer(id);

        String email = normalizeEmail(request.email());

        if (repository.existsByEmailIgnoreCaseAndIdNot(email, id)) {
            throw new ResponseStatusException(
                HttpStatus.CONFLICT,
                "Email is already used by another customer"
            );
        }

        applyRequest(customer, request, email);

        return toResponse(repository.save(customer));
    }

    public void delete(Long id) {
        Customer customer = findCustomer(id);
        repository.delete(customer);
    }

    private Customer findCustomer(Long id) {
        return repository.findById(id)
            .orElseThrow(() -> new ResponseStatusException(
                HttpStatus.NOT_FOUND,
                "Customer not found"
            ));
    }

    private void applyRequest(
        Customer customer,
        CustomerRequest request,
        String email
    ) {
        customer.setFullName(request.fullName().trim());
        customer.setEmail(email);
        customer.setPhone(normalizeOptional(request.phone()));
        customer.setAddress(normalizeOptional(request.address()));
    }

    private String normalizeEmail(String email) {
        return email.trim().toLowerCase();
    }

    private String normalizeOptional(String value) {
        if (value == null || value.isBlank()) {
            return null;
        }

        return value.trim();
    }

    private CustomerResponse toResponse(Customer customer) {
        return new CustomerResponse(
            customer.getId(),
            customer.getFullName(),
            customer.getEmail(),
            customer.getPhone(),
            customer.getAddress(),
            customer.getCreatedAt()
        );
    }
}
