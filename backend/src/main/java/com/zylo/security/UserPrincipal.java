package com.zylo.security;

import com.zylo.domain.User;
import org.springframework.security.core.context.SecurityContextHolder;

import java.util.UUID;

public final class UserPrincipal {

    private UserPrincipal() {}

    public static User getCurrentUser() {
        var authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication != null && authentication.getPrincipal() instanceof User) {
            return (User) authentication.getPrincipal();
        }
        throw new IllegalStateException("No authenticated user found");
    }

    public static UUID getCurrentUserId() {
        return getCurrentUser().getId();
    }

    public static boolean isAuthenticated() {
        var authentication = SecurityContextHolder.getContext().getAuthentication();
        return authentication != null &&
               authentication.isAuthenticated() &&
               authentication.getPrincipal() instanceof User;
    }
}
