
package com.logistics.customerservice.service;

import com.logistics.customerservice.dto.CustomerRequest;
import com.logistics.customerservice.dto.CustomerResponse;
import com.logistics.customerservice.model.Customer;
import com.logistics.customerservice.repository.CustomerRepository;

import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;

import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import org.springframework.http.HttpStatus;
import org.springframework.web.server.ResponseStatusException;

import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class CustomerServiceTest {

    @Mock
    private CustomerRepository repository;

    @InjectMocks
    private CustomerService customerService;

    @Test
    void createCustomerSuccessfully() {

        CustomerRequest request = new CustomerRequest(
            "Nguyen Van A",
            "A@Example.com",
            "0901234567",
            "Ho Chi Minh City"
        );

        when(repository.existsByEmailIgnoreCase("a@example.com"))
            .thenReturn(false);

        when(repository.save(any(Customer.class)))
            .thenAnswer(invocation -> {
                Customer customer = invocation.getArgument(0);
                customer.setId(1L);
                return customer;
            });

        CustomerResponse response =
            customerService.create(request);

        assertEquals(1L, response.id());
        assertEquals("Nguyen Van A", response.fullName());
        assertEquals("a@example.com", response.email());
        assertEquals("0901234567", response.phone());

        verify(repository).save(any(Customer.class));
    }

    @Test
    void createCustomerWithExistingEmailThrowsConflict() {

        CustomerRequest request = new CustomerRequest(
            "Nguyen Van B",
            "existing@example.com",
            "0901234567",
            "Hanoi"
        );

        when(repository.existsByEmailIgnoreCase(
            "existing@example.com"
        )).thenReturn(true);

        ResponseStatusException exception = assertThrows(
            ResponseStatusException.class,
            () -> customerService.create(request)
        );

        assertEquals(
            HttpStatus.CONFLICT,
            exception.getStatusCode()
        );

        verify(repository, never()).save(any());
    }

    @Test
    void findCustomerByIdSuccessfully() {

        Customer customer = new Customer();
        customer.setId(1L);
        customer.setFullName("Nguyen Van A");
        customer.setEmail("a@example.com");

        when(repository.findById(1L))
            .thenReturn(Optional.of(customer));

        CustomerResponse response =
            customerService.findById(1L);

        assertEquals(1L, response.id());
        assertEquals("Nguyen Van A", response.fullName());
        assertEquals("a@example.com", response.email());
    }

    @Test
    void findCustomerWithUnknownIdThrowsNotFound() {

        when(repository.findById(999L))
            .thenReturn(Optional.empty());

        ResponseStatusException exception = assertThrows(
            ResponseStatusException.class,
            () -> customerService.findById(999L)
        );

        assertEquals(
            HttpStatus.NOT_FOUND,
            exception.getStatusCode()
        );
    }

    @Test
    void updateCustomerSuccessfully() {

        Customer customer = new Customer();
        customer.setId(1L);
        customer.setFullName("Old Name");
        customer.setEmail("old@example.com");

        CustomerRequest request = new CustomerRequest(
            "New Name",
            "new@example.com",
            "0912345678",
            "Da Nang"
        );

        when(repository.findById(1L))
            .thenReturn(Optional.of(customer));

        when(repository.existsByEmailIgnoreCaseAndIdNot(
            "new@example.com",
            1L
        )).thenReturn(false);

        when(repository.save(any(Customer.class)))
            .thenAnswer(invocation -> invocation.getArgument(0));

        CustomerResponse response =
            customerService.update(1L, request);

        assertEquals("New Name", response.fullName());
        assertEquals("new@example.com", response.email());
        assertEquals("Da Nang", response.address());
    }

    @Test
    void deleteCustomerSuccessfully() {

        Customer customer = new Customer();
        customer.setId(1L);

        when(repository.findById(1L))
            .thenReturn(Optional.of(customer));

        customerService.delete(1L);

        verify(repository).delete(customer);
    }
}
