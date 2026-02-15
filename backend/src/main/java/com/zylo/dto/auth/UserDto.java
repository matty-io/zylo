package com.zylo.dto.auth;

import com.zylo.domain.User;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;
import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class UserDto {

    private UUID id;
    private String phone;
    private String name;
    private String city;
    private List<String> preferredSports;
    private String role;

    public static UserDto fromEntity(User user) {
        return UserDto.builder()
            .id(user.getId())
            .phone(user.getPhone())
            .name(user.getName())
            .city(user.getCity())
            .preferredSports(user.getPreferredSports())
            .role(user.getRole().name())
            .build();
    }
}
