package com.project.commerce.repository;

import com.project.commerce.product.entity.Product;
import com.project.commerce.user.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.Optional;

public interface ProductRepository extends JpaRepository<Product, Long> {


}