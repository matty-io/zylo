FROM eclipse-temurin:21-jdk-alpine AS builder

WORKDIR /app

COPY pom.xml .
COPY .mvn .mvn
COPY mvnw .

RUN chmod +x mvnw && ./mvnw dependency:go-offline -B

COPY src src

RUN ./mvnw package -DskipTests -B

FROM eclipse-temurin:21-jre-alpine

WORKDIR /app

RUN addgroup -g 1001 -S zylo && \
    adduser -u 1001 -S zylo -G zylo

COPY --from=builder /app/target/*.jar app.jar

RUN chown -R zylo:zylo /app

USER zylo

EXPOSE 8080

ENTRYPOINT ["java", "-jar", "app.jar"]
