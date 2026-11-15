package com.logistics.orderservice.config;
import org.springframework.amqp.core.Binding; import org.springframework.amqp.core.BindingBuilder; import org.springframework.amqp.core.Queue; import org.springframework.amqp.core.TopicExchange;
import org.springframework.amqp.support.converter.Jackson2JsonMessageConverter; import org.springframework.context.annotation.Bean; import org.springframework.context.annotation.Configuration;
@Configuration public class MessagingConfig {
 @Bean public TopicExchange logisticsExchange() { return new TopicExchange("logistics.events", true, false); }
 @Bean public Jackson2JsonMessageConverter jacksonMessageConverter() { return new Jackson2JsonMessageConverter(); }
 
}
