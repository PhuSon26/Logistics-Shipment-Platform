
package com.logistics.customerservice;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.cache.annotation.EnableCaching;
import org.springframework.boot.autoconfigure.security.servlet.UserDetailsServiceAutoConfiguration;

@EnableCaching
@SpringBootApplication(
    exclude = UserDetailsServiceAutoConfiguration.class
)
public class CustomerServiceApplication {

    public static void main(String[] args) {
        SpringApplication.run(
            CustomerServiceApplication.class,
            args
        );
    }
}
