package com.amu.opd.dto;

import com.fasterxml.jackson.annotation.JsonAlias;

public class AuthRequest {
    @JsonAlias({"email", "username"})
    private String username;
    private String password;

    public AuthRequest() {}
    public AuthRequest(String username, String password) {
        this.username = username;
        this.password = password;
    }
    public String getUsername() { return username; }
    public void setUsername(String username) { this.username = username; }
    public String getEmail() { return username; }
    public void setEmail(String email) { this.username = email; }
    public String getPassword() { return password; }
    public void setPassword(String password) { this.password = password; }
}
