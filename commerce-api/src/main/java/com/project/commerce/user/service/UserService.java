package com.project.commerce.user.service;

//import com.project.commerce.global.exception.CustomException;

import com.project.commerce.global.exception.CustomException;
import com.project.commerce.global.jwt.JwtUtil;
import com.project.commerce.user.dto.UserRequestDTO;
import com.project.commerce.user.dto.UserResponseDTO;
import com.project.commerce.user.entity.User;
import com.project.commerce.user.mapper.UserMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;


import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class UserService {

    private final UserMapper userMapper;

    // CREATE
    @Transactional
    public void createUser(UserRequestDTO dto) {
        User user = new User();
        user.setEmail(dto.getEmail());
        user.setPassword(dto.getPassword());
        user.setName(dto.getName());

        userMapper.insertUser(user);
    }

    // READ ALL
    public List<UserResponseDTO> getUsers() {
        return userMapper.findAll()
                .stream()
                .map(user -> UserResponseDTO.builder()
                        .id(user.getId())
                        .email(user.getEmail())
                        .name(user.getName())
                        .build())
                .collect(Collectors.toList());
    }

    // READ ONE
    public UserResponseDTO getUser(Long id) {
        User user = userMapper.findById(id);

        if (user == null) {
            throw new CustomException(404, "User not found");
        }

        return UserResponseDTO.builder()
                .id(user.getId())
                .email(user.getEmail())
                .name(user.getName())
                .build();
    }

    // UPDATE
    public void updateUser(Long id, UserRequestDTO dto) {
        User user = new User();
        user.setId(id);
        user.setEmail(dto.getEmail());
        user.setPassword(dto.getPassword());
        user.setName(dto.getName());

        userMapper.updateUser(user);
    }

    // DELETE
    @Transactional
    public void deleteUser(Long id) {
        userMapper.deleteUser(id);
    }

    public String login(String email) {
        System.out.println("로그인 시도: " + email);
        User user = userMapper.findByEmail(email)
                .orElseThrow(() -> new CustomException(404, "USER NOT FOUND"));

        System.out.println("유저 찾음: " + user.getEmail());

        String token = JwtUtil.createToken(user.getEmail());
        System.out.println("토큰 생성 완료");

        return token;

    }
}