
package com.doctorappointment.auth_service.controller;

import com.doctorappointment.auth_service.dto.AdminUserResponse;
import com.doctorappointment.auth_service.service.AuthService;

import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/admin/users")
public class AdminController {

    private final AuthService authService;

    public AdminController(AuthService authService) {
        this.authService = authService;
    }

    // Get all users
    @GetMapping
    public List<AdminUserResponse> getAllUsers() {

        return authService.getAllUsers();
    }

    // Block a patient or doctor
    @PatchMapping("/{id}/block")
    public String blockUser(@PathVariable int id) {

        return authService.blockUser(id);
    }

    // Unblock a patient or doctor
    @PatchMapping("/{id}/unblock")
    public String unblockUser(@PathVariable int id) {

        return authService.unblockUser(id);
    }
}
