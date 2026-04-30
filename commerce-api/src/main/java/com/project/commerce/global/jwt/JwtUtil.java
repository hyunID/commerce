package com.project.commerce.global.jwt;

import io.jsonwebtoken.*;
import io.jsonwebtoken.security.Keys;

import java.security.Key;
import java.util.Date;

public class JwtUtil {

    private static final String SECRET = "mysecretkeymysecretkeymysecretkey"; // 32자 이상
    private static final long EXP = 1000 * 60 * 60; // 1시간

    private static final Key key = Keys.hmacShaKeyFor(SECRET.getBytes());

    // 🔥 토큰 생성 (userId 포함)
    public static String createToken(Long userId, String email, String role) {

        return Jwts.builder()
                .setSubject(email)
                .claim("userId", userId)   // ✅ 핵심
                .claim("role", role)
                .setIssuedAt(new Date())
                .setExpiration(new Date(System.currentTimeMillis() + EXP))
                .signWith(key, SignatureAlgorithm.HS256)
                .compact();
    }

    // 이메일 추출
    public static String getEmail(String token) {
        return parse(token).getSubject();
    }

    // 권한 추출
    public static String getRole(String token) {
        return (String) parse(token).get("role");
    }

    // 🔥 userId 추출 (안전 처리)
    public static Long getUserId(String token) {

        Object userId = parse(token).get("userId");

        if (userId == null) {
            throw new RuntimeException("JWT에 userId 없음 (재로그인 필요)");
        }

        return Long.valueOf(userId.toString());
    }

    // 토큰 검증
    public static boolean validateToken(String token) {
        try {
            parse(token);
            return true;
        } catch (JwtException | IllegalArgumentException e) {
            return false;
        }
    }

    // 🔥 공통 파싱 메서드 (중복 제거)
    private static Claims parse(String token) {
        return Jwts.parserBuilder()
                .setSigningKey(key)
                .build()
                .parseClaimsJws(token)
                .getBody();
    }
}