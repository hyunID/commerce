package com.project.commerce.user.mapper;

import com.project.commerce.user.entity.User;
import org.apache.ibatis.annotations.Mapper;

import java.util.List;
import java.util.Optional;

@Mapper
public interface UserMapper {

    void insertUser(User user);

    List<User> findAll();

    //Optional<User> findById(Long id);

    //MyBatis  Optional 지원 안함.
    User findById(Long id);

    Optional<User> findByEmail(String email);

    void updateUser(User user);

    void deleteUser(Long id);
}