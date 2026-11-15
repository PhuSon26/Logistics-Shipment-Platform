
package com.logistics.customerservice.repository;

import com.logistics.customerservice.model.Customer;

import org.springframework.data.jpa.repository.JpaRepository;

public interface CustomerRepository
        extends JpaRepository<Customer, Long> {

    boolean existsByEmailIgnoreCase(String email);

    boolean existsByEmailIgnoreCaseAndIdNot(
        String email,
        Long id
    );
}
