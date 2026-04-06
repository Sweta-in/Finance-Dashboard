package com.finance.dashboard.config;

import jakarta.servlet.*;
import jakarta.servlet.http.*;
import org.slf4j.*;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;
import java.io.IOException;

@Component
public class AuditLogFilter extends OncePerRequestFilter {

    private static final Logger auditLog =
        LoggerFactory.getLogger("AUDIT");

    @Override
    protected void doFilterInternal(
            HttpServletRequest request,
            HttpServletResponse response,
            FilterChain filterChain) throws ServletException, IOException {

        long startTime = System.currentTimeMillis();

        String principal = request.getUserPrincipal() != null
            ? request.getUserPrincipal().getName()
            : "anonymous";

        try {
            filterChain.doFilter(request, response);
        } finally {
            long duration = System.currentTimeMillis() - startTime;

            auditLog.info(
                "method={} uri={} status={} user={} ip={} duration={}ms",
                request.getMethod(),
                request.getRequestURI(),
                response.getStatus(),
                principal,
                request.getRemoteAddr(),
                duration
            );
        }
    }

    @Override
    protected boolean shouldNotFilter(HttpServletRequest request) {
        String path = request.getRequestURI();
        // Skip logging for swagger and actuator
        return path.startsWith("/swagger-ui") ||
               path.startsWith("/v3/api-docs") ||
               path.startsWith("/actuator");
    }
}
