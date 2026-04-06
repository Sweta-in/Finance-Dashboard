package com.finance.dashboard.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.finance.dashboard.domain.entity.User;
import com.finance.dashboard.domain.enums.Role;
import com.finance.dashboard.domain.enums.UserStatus;
import com.finance.dashboard.dto.request.LoginRequest;
import com.finance.dashboard.dto.request.RegisterRequest;
import com.finance.dashboard.repository.UserRepository;
import com.finance.dashboard.security.JwtTokenProvider;
import org.junit.jupiter.api.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
@TestMethodOrder(MethodOrderer.OrderAnnotation.class)
@DisplayName("AuthController Integration Tests")
class AuthControllerIntegrationTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Autowired
    private JwtTokenProvider jwtTokenProvider;

    @BeforeEach
    void setUp() {
        userRepository.deleteAll();
    }

    @Test
    @Order(1)
    @DisplayName("register — valid input returns 201 with token")
    void register_validInput_returns201WithToken() throws Exception {
        RegisterRequest request = RegisterRequest.builder()
                .name("John Doe")
                .email("john@finance.dev")
                .password("Password1")
                .role(Role.ADMIN)
                .build();

        mockMvc.perform(post("/api/v1/auth/register")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.token").isNotEmpty())
                .andExpect(jsonPath("$.data.user.email").value("john@finance.dev"))
                .andExpect(jsonPath("$.data.user.role").value("ADMIN"));
    }

    @Test
    @Order(2)
    @DisplayName("register — duplicate email returns 409")
    void register_duplicateEmail_returns409() throws Exception {
        // Pre-create user
        userRepository.save(User.builder()
                .name("Existing User")
                .email("existing@finance.dev")
                .passwordHash(passwordEncoder.encode("Password1"))
                .role(Role.VIEWER)
                .status(UserStatus.ACTIVE)
                .build());

        RegisterRequest request = RegisterRequest.builder()
                .name("Another User")
                .email("existing@finance.dev")
                .password("Password1")
                .role(Role.VIEWER)
                .build();

        mockMvc.perform(post("/api/v1/auth/register")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isConflict())
                .andExpect(jsonPath("$.success").value(false))
                .andExpect(jsonPath("$.error").value("DUPLICATE_RESOURCE"));
    }

    @Test
    @Order(3)
    @DisplayName("register — missing fields returns 400 with field details")
    void register_missingFields_returns400WithDetails() throws Exception {
        RegisterRequest request = RegisterRequest.builder()
                .name("")
                .email("invalid")
                .password("short")
                .build();

        mockMvc.perform(post("/api/v1/auth/register")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.success").value(false))
                .andExpect(jsonPath("$.error").value("VALIDATION_FAILED"))
                .andExpect(jsonPath("$.details").isMap());
    }

    @Test
    @Order(4)
    @DisplayName("login — valid credentials returns 200 with token")
    void login_validCredentials_returns200WithToken() throws Exception {
        userRepository.save(User.builder()
                .name("Login User")
                .email("login@finance.dev")
                .passwordHash(passwordEncoder.encode("Password1"))
                .role(Role.ANALYST)
                .status(UserStatus.ACTIVE)
                .build());

        LoginRequest request = LoginRequest.builder()
                .email("login@finance.dev")
                .password("Password1")
                .build();

        mockMvc.perform(post("/api/v1/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.token").isNotEmpty())
                .andExpect(jsonPath("$.data.user.role").value("ANALYST"));
    }

    @Test
    @Order(5)
    @DisplayName("login — wrong password returns 401")
    void login_wrongPassword_returns401() throws Exception {
        userRepository.save(User.builder()
                .name("Wrong Pass User")
                .email("wrongpass@finance.dev")
                .passwordHash(passwordEncoder.encode("Password1"))
                .role(Role.VIEWER)
                .status(UserStatus.ACTIVE)
                .build());

        LoginRequest request = LoginRequest.builder()
                .email("wrongpass@finance.dev")
                .password("WrongPassword1")
                .build();

        mockMvc.perform(post("/api/v1/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isUnauthorized())
                .andExpect(jsonPath("$.success").value(false))
                .andExpect(jsonPath("$.error").value("INVALID_CREDENTIALS"));
    }

    @Test
    @Order(6)
    @DisplayName("login — inactive user returns 403")
    void login_inactiveUser_returns403() throws Exception {
        userRepository.save(User.builder()
                .name("Inactive User")
                .email("inactive@finance.dev")
                .passwordHash(passwordEncoder.encode("Password1"))
                .role(Role.VIEWER)
                .status(UserStatus.INACTIVE)
                .build());

        LoginRequest request = LoginRequest.builder()
                .email("inactive@finance.dev")
                .password("Password1")
                .build();

        mockMvc.perform(post("/api/v1/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isForbidden())
                .andExpect(jsonPath("$.success").value(false))
                .andExpect(jsonPath("$.error").value("ACCOUNT_INACTIVE"));
    }

    @Test
    @Order(7)
    @DisplayName("protected endpoint — no token returns 401")
    void protectedEndpoint_noToken_returns401() throws Exception {
        mockMvc.perform(get("/api/v1/users")
                        .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isUnauthorized());
    }

    @Test
    @Order(8)
    @DisplayName("admin endpoint — analyst token returns 403")
    void adminEndpoint_analystToken_returns403() throws Exception {
        User analyst = userRepository.save(User.builder()
                .name("Analyst")
                .email("analyst@finance.dev")
                .passwordHash(passwordEncoder.encode("Analyst@123"))
                .role(Role.ANALYST)
                .status(UserStatus.ACTIVE)
                .build());

        String token = jwtTokenProvider.generateToken(analyst);

        mockMvc.perform(get("/api/v1/users")
                        .header("Authorization", "Bearer " + token)
                        .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isForbidden());
    }

    @Test
    @Order(9)
    @DisplayName("admin endpoint — admin token returns 200")
    void adminEndpoint_adminToken_returns200() throws Exception {
        User admin = userRepository.save(User.builder()
                .name("Admin")
                .email("admin@finance.dev")
                .passwordHash(passwordEncoder.encode("Admin@123"))
                .role(Role.ADMIN)
                .status(UserStatus.ACTIVE)
                .build());

        String token = jwtTokenProvider.generateToken(admin);

        mockMvc.perform(get("/api/v1/users")
                        .header("Authorization", "Bearer " + token)
                        .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk());
    }

    @Test
    @Order(10)
    @DisplayName("dashboard endpoint — viewer token returns 403")
    void dashboardEndpoint_viewerToken_returns403() throws Exception {
        User viewer = userRepository.save(User.builder()
                .name("Viewer")
                .email("viewer@finance.dev")
                .passwordHash(passwordEncoder.encode("Viewer@123"))
                .role(Role.VIEWER)
                .status(UserStatus.ACTIVE)
                .build());

        String token = jwtTokenProvider.generateToken(viewer);

        mockMvc.perform(get("/api/v1/dashboard/summary")
                        .header("Authorization", "Bearer " + token)
                        .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isForbidden());
    }

    @Test
    @Order(11)
    @DisplayName("getMe — with valid token returns current user")
    void getMe_withValidToken_returnsCurrentUser() throws Exception {
        User user = userRepository.save(User.builder()
                .name("Me User")
                .email("me@finance.dev")
                .passwordHash(passwordEncoder.encode("Password1"))
                .role(Role.ADMIN)
                .status(UserStatus.ACTIVE)
                .build());

        String token = jwtTokenProvider.generateToken(user);

        mockMvc.perform(get("/api/v1/auth/me")
                        .header("Authorization", "Bearer " + token)
                        .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.email").value("me@finance.dev"))
                .andExpect(jsonPath("$.data.name").value("Me User"))
                .andExpect(jsonPath("$.data.role").value("ADMIN"));
    }

    @Test
    @Order(12)
    @DisplayName("dashboard endpoint — analyst token returns 200")
    void dashboardEndpoint_analystToken_returns200() throws Exception {
        User analyst = userRepository.save(User.builder()
                .name("Analyst")
                .email("analyst2@finance.dev")
                .passwordHash(passwordEncoder.encode("Analyst@123"))
                .role(Role.ANALYST)
                .status(UserStatus.ACTIVE)
                .build());

        String token = jwtTokenProvider.generateToken(analyst);

        mockMvc.perform(get("/api/v1/dashboard/summary")
                        .header("Authorization", "Bearer " + token)
                        .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk());
    }
}
