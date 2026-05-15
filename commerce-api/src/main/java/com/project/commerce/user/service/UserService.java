package com.project.commerce.user.service;

//import com.project.commerce.global.exception.CustomException;

import com.project.commerce.global.exception.CustomException;
import com.project.commerce.global.jwt.JwtUtil;
import com.project.commerce.user.dto.LoginRequestDTO;
import com.project.commerce.user.dto.UserRequestDTO;
import com.project.commerce.user.dto.UserResponseDTO;
import com.project.commerce.user.entity.User;
import com.project.commerce.user.mapper.UserMapper;
import lombok.RequiredArgsConstructor;

import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;


import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class UserService {

    private final UserMapper userMapper;
    private final PasswordEncoder passwordEncoder;

    // CREATE
    @Transactional
    public void createUser(UserRequestDTO dto) {
        User user = new User();
        user.setEmail(dto.getEmail());
        user.setPassword(passwordEncoder.encode(dto.getPassword()));
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

    // login
    public String login(LoginRequestDTO dto) {

        System.out.println("로그인 시도: " + dto.getEmail());
        User user = userMapper.findByEmail(dto.getEmail())
                .orElseThrow(() -> new CustomException(404, "USER NOT FOUND"));

        // 비밀번호 검증
        if (!passwordEncoder.matches(dto.getPassword(), user.getPassword())) {
            throw new CustomException(401, "INVALID PASSWORD");
        }


        System.out.println("유저 Id: " + user.getId());
        System.out.println("유저 Email: " + user.getEmail());
        System.out.println("유저 Role: " + user.getRole());

        String token = JwtUtil.createToken(user.getId(),user.getEmail(), user.getRole());
        System.out.println("토큰 생성 완료");

        return token;

    }

}