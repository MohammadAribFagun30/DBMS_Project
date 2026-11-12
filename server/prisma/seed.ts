// Seeds an admin account and some basic master data.  Run: npm run seed
import bcrypt from "bcryptjs";
import { prisma } from "../src/app/lib/prisma";

const main = async () => {
  const passwordHash = await bcrypt.hash("admin123", 10);

  await prisma.user.upsert({
    where: { email: "admin@club.edu" },
    update: {},
    create: { studentId: "ADMIN-001", fullName: "System Admin", email: "admin@club.edu", passwordHash, role: "ADMIN" },
  });

  const cse = await prisma.department.upsert({
    where: { departmentName: "Computer Science & Engineering" },
    update: {},
    create: { departmentName: "Computer Science & Engineering" },
  });
  await prisma.department.upsert({
    where: { departmentName: "Electrical & Electronic Engineering" },
    update: {},
    create: { departmentName: "Electrical & Electronic Engineering" },
  });

  for (const v of [
    { venueName: "Main Auditorium", location: "Academic Building A, Ground Floor" },
    { venueName: "CSE Lab 3", location: "Academic Building B, 4th Floor" },
  ]) {
    await prisma.venue.upsert({ where: { venueName: v.venueName }, update: {}, create: v });
  }

  for (const c of [
    { clubName: "CSE Programming Club", description: "Competitive programming and coding workshops", establishedYear: 2015 },
    { clubName: "Robotics Club", description: "Hardware, IoT and robotics projects", establishedYear: 2018 },
  ]) {
    await prisma.club.upsert({ where: { clubName: c.clubName }, update: {}, create: { ...c, departmentId: cse.id } });
  }

  for (const s of [
    { companyName: "TechCorp Ltd.", contactEmail: "sponsor@techcorp.example" },
    { companyName: "CloudNine Solutions", contactEmail: "partners@cloudnine.example" },
  ]) {
    await prisma.sponsor.upsert({ where: { companyName: s.companyName }, update: {}, create: s });
  }

  console.log("Seed complete. Admin login -> admin@club.edu / admin123");
};

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
