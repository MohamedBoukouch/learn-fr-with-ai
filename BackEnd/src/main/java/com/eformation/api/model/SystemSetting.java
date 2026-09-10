package com.eformation.api.model;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "system_settings")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class SystemSetting {

   @Id
    @Column(name = "setting_key", length = 255)
    private String key;

    @Column(name = "setting_value", length = 1000, nullable = false)
    private String value;
}
