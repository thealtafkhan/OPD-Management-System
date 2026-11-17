package com.amu.opd.config;

import com.zaxxer.hikari.HikariConfig;
import com.zaxxer.hikari.HikariDataSource;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Primary;

import javax.sql.DataSource;
import java.net.URI;

@Configuration
public class DatabaseConfig {

    private static final Logger log = LoggerFactory.getLogger(DatabaseConfig.class);

    @Value("${spring.datasource.url:}")
    private String configuredUrl;

    @Value("${spring.datasource.username:postgres}")
    private String defaultUsername;

    @Value("${spring.datasource.password:Altaf@64420}")
    private String defaultPassword;

    @Bean
    @Primary
    public DataSource dataSource() {
        String rawUrl = System.getenv("DATABASE_URL");
        if (rawUrl == null || rawUrl.isBlank()) {
            rawUrl = System.getenv("SPRING_DATASOURCE_URL");
        }
        if (rawUrl == null || rawUrl.isBlank()) {
            rawUrl = configuredUrl;
        }

        HikariConfig config = new HikariConfig();
        config.setDriverClassName("org.postgresql.Driver");

        if (rawUrl != null && (rawUrl.startsWith("postgres://") || rawUrl.startsWith("postgresql://"))) {
            try {
                // Replace protocol temporarily to allow standard Java URI parsing
                String uriStr = rawUrl;
                if (uriStr.startsWith("postgresql://")) {
                    uriStr = "http://" + uriStr.substring("postgresql://".length());
                } else if (uriStr.startsWith("postgres://")) {
                    uriStr = "http://" + uriStr.substring("postgres://".length());
                }

                URI uri = URI.create(uriStr);
                String host = uri.getHost();
                int port = uri.getPort() == -1 ? 5432 : uri.getPort();
                String path = uri.getPath();
                String dbName = (path != null && path.length() > 1) ? path.substring(1) : "opd_db";

                String jdbcUrl = "jdbc:postgresql://" + host + ":" + port + "/" + dbName;
                config.setJdbcUrl(jdbcUrl);

                if (uri.getUserInfo() != null) {
                    String[] parts = uri.getUserInfo().split(":", 2);
                    config.setUsername(parts[0]);
                    if (parts.length > 1) {
                        config.setPassword(parts[1]);
                    }
                }
                log.info("Converted cloud PostgreSQL URL to JDBC URL: jdbc:postgresql://{}:{}/{}", host, port, dbName);
            } catch (Exception e) {
                log.warn("Could not parse cloud PostgreSQL URI, falling back to direct prefixing: {}", e.getMessage());
                config.setJdbcUrl("jdbc:" + rawUrl);
                config.setUsername(defaultUsername);
                config.setPassword(defaultPassword);
            }
        } else {
            String jdbcUrl = (rawUrl != null && !rawUrl.isBlank()) ? rawUrl : "jdbc:postgresql://localhost:5432/opd_db";
            config.setJdbcUrl(jdbcUrl);
            config.setUsername(defaultUsername);
            config.setPassword(defaultPassword);
        }

        return new HikariDataSource(config);
    }
}
