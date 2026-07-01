package com.eformation.api.service;

import com.eformation.api.model.Role;
import com.eformation.api.model.SystemSetting;
import com.eformation.api.model.User;
import com.eformation.api.repository.SystemSettingRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.util.Optional;

@Service
public class EmmaAccessService {

    @Autowired(required = false)
    private SystemSettingRepository systemSettingRepository;

    public boolean canAccessEmma(User user) {
        if (user == null) {
            return false;
        }

        if (user.getRole() == Role.ADMIN) {
            return true;
        }

        if (systemSettingRepository != null) {
            Optional<SystemSetting> globalAccess = systemSettingRepository.findById("emma_global_access");
            if (globalAccess.isPresent() && "false".equalsIgnoreCase(globalAccess.get().getValue())) {
                return false;
            }
        }

        if (!user.isEmmaAccess()) {
            return false;
        }

        if (user.isEmmaAccessRevoked()) {
            return false;
        }

        LocalDate today = LocalDate.now();
        if (user.getEmmaAccessStartDate() != null && today.isBefore(user.getEmmaAccessStartDate())) {
            return false;
        }

        if (user.getEmmaAccessEndDate() != null && today.isAfter(user.getEmmaAccessEndDate())) {
            return false;
        }

        if (systemSettingRepository != null && user.getGroupName() != null && !user.getGroupName().trim().isEmpty()) {
            Optional<SystemSetting> groupAccess = systemSettingRepository.findById("emma_group_disabled_" + user.getGroupName().trim());
            if (groupAccess.isPresent() && "true".equalsIgnoreCase(groupAccess.get().getValue())) {
                return false;
            }
        }

        return true;
    }
}
