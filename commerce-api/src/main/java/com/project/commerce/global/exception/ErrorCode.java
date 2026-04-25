package com.project.commerce.global.exception;

import lombok.Getter;
import lombok.RequiredArgsConstructor;

@Getter
@RequiredArgsConstructor
public enum ErrorCode {

    USER_NOT_FOUND(404, "User not found"),
    INVALID_INPUT(400, "Invalid input");

    private final int status;
    private final String message;
}