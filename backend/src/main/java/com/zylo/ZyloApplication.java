package com.zylo;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.scheduling.annotation.EnableScheduling;

@SpringBootApplication
@EnableScheduling
public class ZyloApplication {

    public static void main(String[] args) {
        SpringApplication.run(ZyloApplication.class, args);
    }
}
