
package com.logistics.customerservice.security;

import com.logistics.customerservice.service.JwtService;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.JwtException;
import io.jsonwebtoken.Jws;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;

import org.springframework.http.HttpHeaders;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.util.List;

@Component
public class JwtAuthenticationFilter extends OncePerRequestFilter {

    private final JwtService jwtService;

    public JwtAuthenticationFilter(JwtService jwtService) {
        this.jwtService = jwtService;
    }

    @Override
    protected void doFilterInternal(
        HttpServletRequest request,
        HttpServletResponse response,
        FilterChain filterChain
    ) throws ServletException, IOException {

        String authorization = request.getHeader(
            HttpHeaders.AUTHORIZATION
        );

        if (authorization == null ||
            !authorization.startsWith("Bearer ")) {

            filterChain.doFilter(request, response);
            return;
        }

        String token = authorization.substring(7);

        try {
            Jws<Claims> parsed = jwtService.parseToken(token);

            Claims claims = parsed.getPayload();

            String email = claims.getSubject();
            String role = claims.get("role", String.class);

            if (email == null || email.isBlank() ||
                !("USER".equals(role) || "ADMIN".equals(role))) {

                response.sendError(
                    HttpServletResponse.SC_UNAUTHORIZED,
                    "Invalid token claims"
                );
                return;
            }

            var authentication =
                new UsernamePasswordAuthenticationToken(
                    email,
                    null,
                    List.of(
                        new SimpleGrantedAuthority("ROLE_" + role)
                    )
                );

            SecurityContextHolder.getContext()
                .setAuthentication(authentication);

        } catch (JwtException | IllegalArgumentException exception) {

            SecurityContextHolder.clearContext();

            response.sendError(
                HttpServletResponse.SC_UNAUTHORIZED,
                "Invalid or expired JWT token"
            );
            return;
        }

        filterChain.doFilter(request, response);
    }
}
