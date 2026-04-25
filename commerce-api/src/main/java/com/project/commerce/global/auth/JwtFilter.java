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

        System.out.println("필터 시작 " );
        // CORS preflight 먼저 통과
        System.out.println(request.getMethod() );
        if ("OPTIONS".equalsIgnoreCase(request.getMethod())) {
            filterChain.doFilter(request, response);
            return;
        }

        String header = request.getHeader("Authorization");
        String path = request.getRequestURI();
        System.out.println("필터 시작 헤더 " + header );
        System.out.println("필터 시작 패스 " + path );

        if (path.startsWith("/users/login")
                || path.equals("/login")
                || path.equals("/users")
                || path.startsWith("/h2-console")) {

            filterChain.doFilter(request, response);
            return;
        }

        System.out.println("TOKEN MISSING" );
        if (!StringUtils.hasText(header) || !header.startsWith("Bearer ")) {
            response.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
            response.getWriter().write("TOKEN MISSING");
            return;
        }

        String token = header.substring(7);
        System.out.println(token );
        if (!JwtUtil.validateToken(token)) {
            response.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
            response.getWriter().write("INVALID TOKEN");
            return;
        }

        String email = JwtUtil.getEmail(token);

        // request에 사용자 정보 저장
        request.setAttribute("userEmail", email);


        // 통과
        filterChain.doFilter(request, response);
    }
}