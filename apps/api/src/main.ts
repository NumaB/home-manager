import "reflect-metadata";
import { NestFactory } from "@nestjs/core";
import { DocumentBuilder, SwaggerModule } from "@nestjs/swagger";
import { AppModule } from "./app.module";
import "./config/load-local-env";

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.setGlobalPrefix("api");

  const allowedOrigins = (process.env.WEB_ORIGINS ?? "http://localhost:3000")
    .split(",")
    .map((origin) => origin.trim())
    .filter(Boolean);
  app.enableCors({
    origin: allowedOrigins,
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  });

  const openApiConfig = new DocumentBuilder()
    .setTitle("Doz Manager API")
    .setDescription("API REST de Doz Manager")
    .setVersion("0.0.0")
    .addBearerAuth(
      { type: "http", scheme: "bearer", bearerFormat: "JWT" },
      "clerk-session",
    )
    .build();
  const openApiDocument = SwaggerModule.createDocument(app, openApiConfig);

  if (process.env.NODE_ENV !== "production") {
    SwaggerModule.setup("api/docs", app, openApiDocument);
  }

  const port = Number(process.env.API_PORT ?? 3001);
  await app.listen(port, "0.0.0.0");
  console.log(`API listening on http://localhost:${port}/api/health`);
  if (process.env.NODE_ENV !== "production") {
    console.log(`Swagger UI available at http://localhost:${port}/api/docs`);
  }
}

void bootstrap();
