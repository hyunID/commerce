package com.project.commerce.user.controller;

import com.project.commerce.global.response.ApiResponse;
import com.project.commerce.user.dto.LoginRequestDTO;
import com.project.commerce.user.dto.LoginResponseDTO;
import com.project.commerce.user.dto.UserRequestDTO;
import com.project.commerce.user.dto.UserResponseDTO;
import com.project.commerce.user.service.UserService;
import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/users")
@RequiredArgsConstructor
public class UserController {

    private final UserService userService;

    @PostMapping
    public ApiResponse<?> create(@RequestBody UserRequestDTO dto) {
        userService.createUser(dto);
        return ApiResponse.success(null);
    }

    @GetMapping
    public ApiResponse<List<UserResponseDTO>> getAll() {
        return ApiResponse.success(userService.getUsers());
    }

    @GetMapping("/{id}")
    public ApiResponse<UserResponseDTO> getUser(@PathVariable Long id) {
        return ApiResponse.success(userService.getUser(id));
    }

    @PutMapping("/{id}")
    public ApiResponse<?> update(@PathVariable Long id, @RequestBody UserRequestDTO dto) {
        userService.updateUser(id, dto);
        return ApiResponse.success(null);
    }

    @DeleteMapping("/{id}")
    public ApiResponse<?> delete(@PathVariable Long id) {
        userService.deleteUser(id);
        return ApiResponse.success(null);
    }

    @PostMapping("/login")
    public ApiResponse<LoginResponseDTO> login(@RequestBody LoginRequestDTO dto) {
        System.out.println("로그인 시도 컨트롤러: " );
        String token = userService.login(dto.getEmail());
        return ApiResponse.success(new LoginResponseDTO(token));
    }

    @GetMapping("/me")
    public ApiResponse<String> me(HttpServletRequest request) {
        String email = (String) request.getAttribute("userEmail");
        return ApiResponse.success(email);
    }

}