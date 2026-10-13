package com.geoexplore.config;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.time.Clock;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.atomic.AtomicBoolean;
import java.util.concurrent.atomic.AtomicLong;

public class RequestRateLimitFilter extends OncePerRequestFilter {

    private final long windowMillis;
    private final int authAttempts;
    private final int communityWrites;
    private final Clock clock;
    private final ConcurrentHashMap<String, Bucket> buckets = new ConcurrentHashMap<>();
    private final AtomicLong requestSequence = new AtomicLong();

    public RequestRateLimitFilter(long windowSeconds, int authAttempts, int communityWrites) {
        this(windowSeconds, authAttempts, communityWrites, Clock.systemUTC());
    }

    RequestRateLimitFilter(long windowSeconds, int authAttempts, int communityWrites, Clock clock) {
        this.windowMillis = Math.max(1, windowSeconds) * 1000;
        this.authAttempts = Math.max(1, authAttempts);
        this.communityWrites = Math.max(1, communityWrites);
        this.clock = clock;
    }

    @Override
    protected void doFilterInternal(
            HttpServletRequest request,
            HttpServletResponse response,
            FilterChain filterChain
    ) throws ServletException, IOException {
        Limit limit = classify(request);
        if (limit == null) {
            filterChain.doFilter(request, response);
            return;
        }

        long now = clock.millis();
        long currentWindow = now / windowMillis;
        if ((requestSequence.incrementAndGet() & 255) == 0) {
            buckets.entrySet().removeIf(entry -> entry.getValue().window() < currentWindow - 1);
        }
        String key = limit.group() + ':' + request.getRemoteAddr();
        AtomicBoolean allowed = new AtomicBoolean(true);
        AtomicLong retryAfter = new AtomicLong(1);

        buckets.compute(key, (ignored, bucket) -> {
            if (bucket == null || bucket.window() != currentWindow) {
                return new Bucket(currentWindow, 1);
            }
            if (bucket.count() >= limit.maximum()) {
                allowed.set(false);
                retryAfter.set(Math.max(1, ((currentWindow + 1) * windowMillis - now + 999) / 1000));
                return bucket;
            }
            return new Bucket(currentWindow, bucket.count() + 1);
        });

        if (!allowed.get()) {
            response.setHeader("Retry-After", String.valueOf(retryAfter.get()));
            SecurityConfig.writeProblem(
                    response,
                    429,
                    "Too many requests",
                    "Please wait a moment before trying again."
            );
            return;
        }

        filterChain.doFilter(request, response);
    }

    private Limit classify(HttpServletRequest request) {
        String method = request.getMethod();
        String path = request.getRequestURI();

        if ("POST".equals(method) && (path.endsWith("/auth/login") || path.endsWith("/auth/register"))) {
            return new Limit("auth", authAttempts);
        }

        boolean unsafe = "POST".equals(method) || "PATCH".equals(method) || "DELETE".equals(method);
        boolean communityPath = path.matches(".*/places/\\d+/(comments|tips)$")
                || path.matches(".*/(comments|tips)/\\d+$");
        return unsafe && communityPath ? new Limit("community", communityWrites) : null;
    }

    private record Bucket(long window, int count) {}

    private record Limit(String group, int maximum) {}
}
