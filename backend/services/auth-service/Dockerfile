
# Stage Build
FROM maven:3.9.6-eclipse-temurin-21-alpine AS builder

WORKDIR /app

COPY pom.xml .
COPY services ./services

RUN mvn -B -f pom.xml -pl services/auth-service -am dependency:go-offline
RUN mvn -B -f pom.xml -pl services/auth-service -am clean package -DskipTests

# Stage Run
FROM eclipse-temurin:21-jre-alpine

WORKDIR /app

COPY --from=builder /app/services/auth-service/target/*.jar app.jar

EXPOSE 8081

ENTRYPOINT ["java", "-jar", "app.jar"]