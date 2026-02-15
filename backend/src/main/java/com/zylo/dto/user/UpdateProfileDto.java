package com.zylo.dto.user;

import jakarta.validation.constraints.Size;
import lombok.Data;

import java.util.List;

@Data
public class UpdateProfileDto {

    @Size(max = 100, message = "Name must not exceed 100 characters")
    private String name;

    @Size(max = 100, message = "City must not exceed 100 characters")
    private String city;

    private List<String> preferredSports;
}
