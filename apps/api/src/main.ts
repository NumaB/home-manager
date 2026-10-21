import "reflect-metadata";
import dotenv from "dotenv";
import { NestFactory } from "@nestjs/core";
import { DocumentBuilder, SwaggerModule } from "@nestjs/swagger";
import { AppModule } from "./app.module";

dotenv.config({ path: "../../.env" });

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.setGlobalPrefix("api");

  const openApiConfig = new DocumentBuilder()
    .setTitle("Home Manager API")
    .setDescription("API REST de Home Manager")
    .setVersion("0.0.0")
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
