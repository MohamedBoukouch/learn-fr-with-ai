package com.eformation.api.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class DeleteAccountRequest {
    @NotBlank
    private String confirmation;
}
