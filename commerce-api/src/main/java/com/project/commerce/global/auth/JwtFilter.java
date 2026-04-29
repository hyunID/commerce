package com.project.commerce.global.auth;

import com.project.commerce.global.jwt.JwtUtil;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.util.StringUtils;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;

public class JwtFilter extends OncePerRequestFilter {

    @Override
    protected void doFilterInternal(HttpServletRequest request,
                                    HttpServletResponse response,
                                    FilterChain filterChain)
            throws ServletException, IOException {

        String path = request.getRequestURI();
        String method = request.getMethod();

        //  preflight 통과
        if ("OPTIONS".equalsIgnoreCase(method)) {
            filterChain.doFilter(request, response);
            return;
        }

        // 공개 API (토큰 없이 허용)
        if (isPublicPath(path)) {
            filterChain.doFilter(request, response);
            return;
        }

        //  토큰 검사
        String header = request.getHeader("Authorization");

        if (!StringUtils.hasText(header) || !header.startsWith("Bearer ")) {
            response.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
            response.getWriter().write("TOKEN MISSING");
            return;
        }

        String token = header.substring(7);

        if (!JwtUtil.validateToken(token)) {
            response.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
            response.getWriter().write("INVALID TOKEN");
            return;
        }

        //  사용자 정보 세팅
        String email = JwtUtil.getEmail(token);
        String role = JwtUtil.getRole(token);

        request.setAttribute("userEmail", email);
        request.setAttribute("userRole", role);

        // 통과
        filterChain.doFilter(request, response);
    }

    //  공개 경로만 따로 관리
    private boolean isPublicPath(String path) {
        return path.startsWith("/users/login")
                || path.equals("/users")
                || path.startsWith("/images/")
                || path.startsWith("/h2-console");
    }
}