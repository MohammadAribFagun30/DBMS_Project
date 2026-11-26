import dotenv from "dotenv";
import path from "path";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../../generated/prisma/client";

dotenv.config({ path: path.join(__dirname, "../../../.env") });
dotenv.config({ path: path.join(process.cwd(), ".env") });
dotenv.config({ path: path.join(process.cwd(), "server/.env") });

const connectionString =
  process.env.DATABASE_URL || "postgresql://postgres@127.0.0.1:5433/club_event_db?schema=public";

const adapter = new PrismaPg({ connectionString });
const prisma = new PrismaClient({ adapter });

export { prisma };
