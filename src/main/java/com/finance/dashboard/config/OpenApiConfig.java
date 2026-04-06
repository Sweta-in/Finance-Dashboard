package com.finance.dashboard.config;

import io.swagger.v3.oas.models.Components;
import io.swagger.v3.oas.models.OpenAPI;
import io.swagger.v3.oas.models.info.Contact;
import io.swagger.v3.oas.models.info.Info;
import io.swagger.v3.oas.models.info.License;
import io.swagger.v3.oas.models.security.SecurityRequirement;
import io.swagger.v3.oas.models.security.SecurityScheme;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class OpenApiConfig {

    @Bean
    public OpenAPI openAPI() {
        return new OpenAPI()
                .info(new Info()
                        .title("Finance Dashboard API")
                        .version("1.0.0")
                        .description("""
                                ## Authentication Flow

                                1. Call `POST /api/v1/auth/login` with your credentials
                                2. Copy the `token` value from the response `data` object
                                3. Click the **Authorize 🔓** button at the top of this page
                                4. In the **BearerAuth** field, enter: `Bearer <your-token>`
                                   Example: `Bearer eyJhbGciOiJIUzI1NiJ9...`
                                5. Click **Authorize** then **Close**
                                6. All protected endpoints (🔒) will now work

                                ## Demo Credentials

                                | Role | Email | Password |
                                |------|-------|----------|
                                | ADMIN | admin@finance.dev | Admin@123 |
                                | ANALYST | analyst@finance.dev | Analyst@123 |
                                | VIEWER | viewer@finance.dev | Viewer@123 |

                                ## Role Permissions

                                | Endpoint Group | VIEWER | ANALYST | ADMIN |
                                |----------------|--------|---------|-------|
                                | GET /records | ✅ | ✅ | ✅ |
                                | POST/PUT/DELETE /records | ❌ | ❌ | ✅ |
                                | GET /dashboard/* | ❌ | ✅ | ✅ |
                                | GET/PATCH /users | ❌ | ❌ | ✅ |

                                ## Token Details
                                - Algorithm: HS256
                                - Expiry: 24 hours
                                - Format: Bearer token in Authorization header
                                """)
                        .contact(new Contact()
                                .name("Finance Dashboard Team")
                                .email("admin@finance.dev"))
                        .license(new License()
                                .name("MIT License")
                                .url("https://opensource.org/licenses/MIT")))
                .addSecurityItem(
                        new SecurityRequirement().addList("BearerAuth"))
                .components(new Components()
                        .addSecuritySchemes("BearerAuth",
                                new SecurityScheme()
                                        .name("BearerAuth")
                                        .type(SecurityScheme.Type.HTTP)
                                        .scheme("bearer")
                                        .bearerFormat("JWT")
                                        .description("""
                                                Enter your JWT token.
                                                Get it from POST /api/v1/auth/login
                                                Format: Bearer eyJhbGc...
                                                """)));
    }
}
