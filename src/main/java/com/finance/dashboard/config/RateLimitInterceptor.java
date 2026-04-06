package com.finance.dashboard.config;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Component;
import org.springframework.web.servlet.HandlerInterceptor;

import java.time.Instant;
import java.util.Deque;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.ConcurrentLinkedDeque;

/**
 * In-memory rate limiter using a sliding window algorithm.
 * Limits each authenticated user to a configurable number of requests per minute.
 * Applied to the /api/v1/search endpoint to prevent abuse.
 */
@Slf4j
@Component
public class RateLimitInterceptor implements HandlerInterceptor {

    private static final int MAX_REQUESTS_PER_MINUTE = 30;
    private static final long WINDOW_MILLIS = 60_000L;

    private final ConcurrentHashMap<String, Deque<Instant>> requestCounts =
            new ConcurrentHashMap<>();

    @Override
    public boolean preHandle(HttpServletRequest request, HttpServletResponse response,
                             Object handler) throws Exception {

        String userKey = extractUserKey(request);
        Deque<Instant> timestamps = requestCounts.computeIfAbsent(userKey,
                k -> new ConcurrentLinkedDeque<>());

        Instant now = Instant.now();
        Instant windowStart = now.minusMillis(WINDOW_MILLIS);

        // Evict expired entries
        while (!timestamps.isEmpty() && timestamps.peekFirst().isBefore(windowStart)) {
            timestamps.pollFirst();
        }

        if (timestamps.size() >= MAX_REQUESTS_PER_MINUTE) {
            log.warn("Rate limit exceeded for user: {}", userKey);
            response.setStatus(HttpStatus.TOO_MANY_REQUESTS.value());
            response.setContentType(MediaType.APPLICATION_JSON_VALUE);
            response.getWriter().write(
                    "{\"success\":false,\"message\":\"Rate limit exceeded. Maximum "
                    + MAX_REQUESTS_PER_MINUTE
                    + " search requests per minute.\",\"error\":\"TOO_MANY_REQUESTS\"}"
            );
            return false;
        }

        timestamps.addLast(now);
        return true;
    }

    private String extractUserKey(HttpServletRequest request) {
        // Use the authenticated user principal if available, otherwise fall back to IP
        if (request.getUserPrincipal() != null) {
            return "user:" + request.getUserPrincipal().getName();
        }
        String forwarded = request.getHeader("X-Forwarded-For");
        if (forwarded != null && !forwarded.isBlank()) {
            return "ip:" + forwarded.split(",")[0].trim();
        }
        return "ip:" + request.getRemoteAddr();
    }
}
