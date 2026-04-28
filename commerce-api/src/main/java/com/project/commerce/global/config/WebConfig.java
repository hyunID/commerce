package com.project.commerce.global.config;

import com.project.commerce.global.auth.JwtFilter;
import jakarta.servlet.Filter;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import org.springframework.boot.web.servlet.FilterRegistrationBean;
import org.springframework.web.servlet.config.annotation.ResourceHandlerRegistry;

@Configuration
public class WebConfig {

    @Bean
    public FilterRegistrationBean<Filter> jwtFilter() {
        FilterRegistrationBean<Filter> bean = new FilterRegistrationBean<>();
        bean.setFilter(new JwtFilter());
        bean.addUrlPatterns("/*"); // 모든 요청 검사
        bean.setOrder(1);
        return bean;
    }


}