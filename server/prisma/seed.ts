import bcrypt from "bcryptjs";
import { prisma } from "../src/app/lib/prisma";
import { EventStatus, RegistrationStatus, Role } from "../src/generated/prisma/enums";

const main = async () => {
  console.log("Starting IIUC ClubVerse database seed...");

  // 1. Password Hashes
  const adminPasswordHash = await bcrypt.hash("admin123", 10);
  const studentPasswordHash = await bcrypt.hash("student123", 10);

  // 2. Departments
  const deptCse = await prisma.department.upsert({
    where: { departmentName: "Computer Science & Engineering" },
    update: {},
    create: { departmentName: "Computer Science & Engineering" },
  });

  const deptEee = await prisma.department.upsert({
    where: { departmentName: "Electrical & Electronic Engineering" },
    update: {},
    create: { departmentName: "Electrical & Electronic Engineering" },
  });

  const deptBba = await prisma.department.upsert({
    where: { departmentName: "Business Administration" },
    update: {},
    create: { departmentName: "Business Administration" },
  });

  const deptMe = await prisma.department.upsert({
    where: { departmentName: "Mechanical Engineering" },
    update: {},
    create: { departmentName: "Mechanical Engineering" },
  });

  // 3. Users (Admin + Students)
  const adminUser = await prisma.user.upsert({
    where: { email: "admin@club.edu" },
    update: {},
    create: {
      studentId: "ADMIN-001",
      fullName: "System Administrator",
      email: "admin@club.edu",
      passwordHash: adminPasswordHash,
      role: Role.ADMIN,
      departmentId: deptCse.id,
    },
  });

  const studentUser = await prisma.user.upsert({
    where: { email: "student@iiuc.ac.bd" },
    update: {},
    create: {
      studentId: "C221001",
      fullName: "Alice Rahman",
      email: "student@iiuc.ac.bd",
      passwordHash: studentPasswordHash,
      role: Role.STUDENT,
      departmentId: deptCse.id,
    },
  });

  const studentUser2 = await prisma.user.upsert({
    where: { email: "fahim@iiuc.ac.bd" },
    update: {},
    create: {
      studentId: "C221045",
      fullName: "Fahim Shahriar",
      email: "fahim@iiuc.ac.bd",
      passwordHash: studentPasswordHash,
      role: Role.STUDENT,
      departmentId: deptCse.id,
    },
  });

  const studentUser3 = await prisma.user.upsert({
    where: { email: "nusrat@iiuc.ac.bd" },
    update: {},
    create: {
      studentId: "E213012",
      fullName: "Nusrat Jahan",
      email: "nusrat@iiuc.ac.bd",
      passwordHash: studentPasswordHash,
      role: Role.STUDENT,
      departmentId: deptEee.id,
    },
  });

  // 4. Venues (IIUC Kumira Campus)
  const venueAuditorium = await prisma.venue.upsert({
    where: { venueName: "IIUC Central Auditorium" },
    update: { location: "Auditorium Complex, Kumira Campus" },
    create: { venueName: "IIUC Central Auditorium", location: "Auditorium Complex, Kumira Campus" },
  });

  const venueLab3 = await prisma.venue.upsert({
    where: { venueName: "CSE Software Lab 3" },
    update: { location: "Academic Building 4, 3rd Floor, Kumira" },
    create: { venueName: "CSE Software Lab 3", location: "Academic Building 4, 3rd Floor, Kumira" },
  });

  const venueLibraryHall = await prisma.venue.upsert({
    where: { venueName: "Central Library Seminar Hall" },
    update: { location: "Central Library Complex, 2nd Floor, Kumira" },
    create: { venueName: "Central Library Seminar Hall", location: "Central Library Complex, 2nd Floor, Kumira" },
  });

  const venueAmphitheatre = await prisma.venue.upsert({
    where: { venueName: "IIUC Amphitheatre" },
    update: { location: "Campus Green Ground, Kumira Campus" },
    create: { venueName: "IIUC Amphitheatre", location: "Campus Green Ground, Kumira Campus" },
  });

  // 5. Clubs
  const clubIiuccc = await prisma.club.upsert({
    where: { clubName: "IIUC Computer Club (IIUCCC)" },
    update: {},
    create: {
      clubName: "IIUC Computer Club (IIUCCC)",
      description: "Hub for competitive programming, algorithm workshops, national hackathons, and software engineering talks at IIUC.",
      establishedYear: 2012,
      departmentId: deptCse.id,
    },
  });

  const clubRobotics = await prisma.club.upsert({
    where: { clubName: "IIUC Robotics & Automation Club" },
    update: {},
    create: {
      clubName: "IIUC Robotics & Automation Club",
      description: "Designing autonomous rovers, IoT hardware, drone prototyping, and national robotics competitions.",
      establishedYear: 2018,
      departmentId: deptEee.id,
    },
  });

  const clubAi = await prisma.club.upsert({
    where: { clubName: "IIUC AI & Data Science Society" },
    update: {},
    create: {
      clubName: "IIUC AI & Data Science Society",
      description: "Deep learning masterclasses, generative AI hackathons, research reading groups, and computer vision projects.",
      establishedYear: 2021,
      departmentId: deptCse.id,
    },
  });

  const clubBusiness = await prisma.club.upsert({
    where: { clubName: "IIUC Business & Leadership Forum" },
    update: {},
    create: {
      clubName: "IIUC Business & Leadership Forum",
      description: "Fostering startup founders, angel pitch nights, leadership symposiums, and venture building workshops.",
      establishedYear: 2016,
      departmentId: deptBba.id,
    },
  });

  const clubTelecom = await prisma.club.upsert({
    where: { clubName: "IIUC Telecommunication & Networking Club" },
    update: {},
    create: {
      clubName: "IIUC Telecommunication & Networking Club",
      description: "Network architecture, Cisco routing, cybersecurity red teaming, and telecommunication systems.",
      establishedYear: 2019,
      departmentId: deptEee.id,
    },
  });

  // 6. Sponsors
  const sponsorTechCorp = await prisma.sponsor.upsert({
    where: { companyName: "TechCorp Ltd." },
    update: {},
    create: { companyName: "TechCorp Ltd.", contactEmail: "partners@techcorp.example" },
  });

  const sponsorCloudNine = await prisma.sponsor.upsert({
    where: { companyName: "CloudNine Solutions" },
    update: {},
    create: { companyName: "CloudNine Solutions", contactEmail: "partners@cloudnine.example" },
  });

  const sponsorVertex = await prisma.sponsor.upsert({
    where: { companyName: "Vertex Global Ventures" },
    update: {},
    create: { companyName: "Vertex Global Ventures", contactEmail: "contact@vertex.example" },
  });

  // 7. Events & Workshops
  // Clean existing events to guarantee fresh test data
  console.log("Refreshing club events...");
  await prisma.event.deleteMany({});

  // Event 1: Flagship Hackathon (APPROVED, Upcoming)
  const ev1 = await prisma.event.create({
    data: {
      clubId: clubIiuccc.id,
      venueId: venueAuditorium.id,
      title: "National Collegiate Hackathon 2026 (CodeStorm IIUC)",
      description: "36-hour flagship hackathon organized by IIUCCC focusing on AI, Cloud Infrastructure, and Smart Campus solutions. $10,000 prize pool with national university participants.",
      eventType: "HACKATHON",
      startTime: new Date("2026-11-25T09:00:00Z"),
      endTime: new Date("2026-11-26T21:00:00Z"),
      status: EventStatus.APPROVED,
      createdById: adminUser.id,
      sponsors: {
        create: [
          { sponsorId: sponsorTechCorp.id, amountFunded: 60000, sponsorshipTier: "TITLE" },
          { sponsorId: sponsorCloudNine.id, amountFunded: 25000, sponsorshipTier: "PLATINUM" },
        ],
      },
    },
  });

  // Event 2: Distributed Systems Workshop (APPROVED, Upcoming)
  const ev2 = await prisma.event.create({
    data: {
      clubId: clubIiuccc.id,
      venueId: venueLab3.id,
      title: "Mastering Distributed Systems & Microservices",
      description: "Deep dive into gRPC, event sourcing, Kafka streams, and high-throughput backend architecture with industry veterans.",
      eventType: "WORKSHOP",
      startTime: new Date("2026-11-28T14:00:00Z"),
      endTime: new Date("2026-11-28T18:00:00Z"),
      status: EventStatus.APPROVED,
      createdById: adminUser.id,
      workshop: {
        create: {
          speakerName: "Dr. Tariqul Islam",
          speakerBio: "Principal Architect at ScaledCloud, ex-Google SRE with 15+ years of distributed backend systems experience.",
          prerequisites: "Familiarity with Docker, basic REST APIs, and an active GitHub account.",
        },
      },
    },
  });

  // Event 3: CP Bootcamp (PENDING - for testing Admin Approval/Rejection workflow)
  const ev3 = await prisma.event.create({
    data: {
      clubId: clubIiuccc.id,
      venueId: venueLab3.id,
      title: "Competitive Programming Bootcamp: Dynamic Programming Masterclass",
      description: "Intensive 4-hour CP bootcamp focusing on advanced DP on trees, bitmasking, and digit DP for ICPC aspirants.",
      eventType: "WORKSHOP",
      startTime: new Date("2026-12-02T15:00:00Z"),
      endTime: new Date("2026-12-02T19:00:00Z"),
      status: EventStatus.PENDING,
      createdById: adminUser.id,
      workshop: {
        create: {
          speakerName: "Tanvir Hasan",
          speakerBio: "ICPC World Finalist 2024, Candidate Master on Codeforces.",
          prerequisites: "Proficiency in C++ STL and basic recursion.",
        },
      },
    },
  });

  // Event 4: Robotics ROS2 Lab (APPROVED, Upcoming)
  const ev4 = await prisma.event.create({
    data: {
      clubId: clubRobotics.id,
      venueId: venueLibraryHall.id,
      title: "Autonomous Robotics & ROS2 Hands-on Lab",
      description: "Hands-on robotics workshop covering Robot Operating System 2 (ROS2), LiDAR-based SLAM mapping, and sensor fusion on differential-drive ground rovers.",
      eventType: "WORKSHOP",
      startTime: new Date("2026-11-30T10:00:00Z"),
      endTime: new Date("2026-11-30T16:00:00Z"),
      status: EventStatus.APPROVED,
      createdById: adminUser.id,
      workshop: {
        create: {
          speakerName: "Engr. Samira Khan",
          speakerBio: "Lead Roboticist at RoboSense Innovations, published IEEE robotics researcher.",
          prerequisites: "Bring your laptop with Ubuntu 22.04 LTS or WSL2 and Python 3.10+ installed.",
        },
      },
      sponsors: {
        create: [{ sponsorId: sponsorVertex.id, amountFunded: 20000, sponsorshipTier: "GOLD" }],
      },
    },
  });

  // Event 5: RoboWars Championship (PENDING - for testing Admin Approval)
  const ev5 = await prisma.event.create({
    data: {
      clubId: clubRobotics.id,
      venueId: venueAmphitheatre.id,
      title: "IIUC RoboWars & Drone Racing Championship 2026",
      description: "Inter-university combat robotics (15kg & 30kg category) and high-speed FPV drone obstacle racing competition across Kumira campus green.",
      eventType: "COMPETITION",
      startTime: new Date("2026-12-15T09:00:00Z"),
      endTime: new Date("2026-12-15T18:00:00Z"),
      status: EventStatus.PENDING,
      createdById: adminUser.id,
    },
  });

  // Event 6: AI Agents Symposium (APPROVED, Upcoming)
  const ev6 = await prisma.event.create({
    data: {
      clubId: clubAi.id,
      venueId: venueAuditorium.id,
      title: "AI Agents & Multimodal LLMs Symposium 2026",
      description: "Keynotes and live coding on autonomous agent architectures, multi-agent swarms, function calling, tool use, and multimodal RAG in production.",
      eventType: "SEMINAR",
      startTime: new Date("2026-12-05T13:00:00Z"),
      endTime: new Date("2026-12-05T18:00:00Z"),
      status: EventStatus.APPROVED,
      createdById: adminUser.id,
      workshop: {
        create: {
          speakerName: "Dr. Farhan Ahmed",
          speakerBio: "Principal AI Research Scientist and author in multimodal foundation models.",
          prerequisites: "General understanding of Python and neural network concepts.",
        },
      },
      sponsors: {
        create: [{ sponsorId: sponsorTechCorp.id, amountFunded: 40000, sponsorshipTier: "PLATINUM" }],
      },
    },
  });

  // Event 7: PyTorch Deep Learning Workshop (APPROVED, Upcoming)
  const ev7 = await prisma.event.create({
    data: {
      clubId: clubAi.id,
      venueId: venueLab3.id,
      title: "Deep Learning with PyTorch: From Tensors to Transformers",
      description: "Build Transformer models from scratch in PyTorch, implement self-attention mechanisms, and fine-tune models on custom domain datasets.",
      eventType: "WORKSHOP",
      startTime: new Date("2026-12-12T14:00:00Z"),
      endTime: new Date("2026-12-12T18:30:00Z"),
      status: EventStatus.APPROVED,
      createdById: adminUser.id,
      workshop: {
        create: {
          speakerName: "Mahir Faisal",
          speakerBio: "Senior Machine Learning Engineer at DataVibe AI.",
          prerequisites: "Python programming and linear algebra basics.",
        },
      },
    },
  });

  // Event 8: Venture Pitch Day (APPROVED, Upcoming)
  const ev8 = await prisma.event.create({
    data: {
      clubId: clubBusiness.id,
      venueId: venueLibraryHall.id,
      title: "Campus Venture Pitch & Angel Match Day",
      description: "Student-led tech startups pitch live to venture capitalists, angel investors, and seasoned entrepreneurs for seed grants up to $15,000.",
      eventType: "COMPETITION",
      startTime: new Date("2026-12-18T15:00:00Z"),
      endTime: new Date("2026-12-18T20:00:00Z"),
      status: EventStatus.APPROVED,
      createdById: adminUser.id,
      sponsors: {
        create: [{ sponsorId: sponsorVertex.id, amountFunded: 35000, sponsorshipTier: "PLATINUM" }],
      },
    },
  });

  // Event 9: Cybersecurity Workshop (APPROVED, Upcoming)
  const ev9 = await prisma.event.create({
    data: {
      clubId: clubTelecom.id,
      venueId: venueLab3.id,
      title: "Cybersecurity Red Teaming & Cloud Infrastructure Defense",
      description: "Defensive and offensive security principles: practical penetration testing, network packet analysis with Wireshark, and AWS security group hardening.",
      eventType: "WORKSHOP",
      startTime: new Date("2026-12-08T14:00:00Z"),
      endTime: new Date("2026-12-08T18:00:00Z"),
      status: EventStatus.APPROVED,
      createdById: adminUser.id,
      workshop: {
        create: {
          speakerName: "Ahsan Habib, CEH",
          speakerBio: "Lead Security Architect at CloudShield Technologies.",
          prerequisites: "Basic understanding of Linux commands and TCP/IP networking.",
        },
      },
    },
  });

  // Event 10: Modern Web & Cloud Deployment (COMPLETED - for testing attendance, feedback, certificates)
  const ev10 = await prisma.event.create({
    data: {
      clubId: clubIiuccc.id,
      venueId: venueAuditorium.id,
      title: "Modern Web & Cloud Deployment Essentials",
      description: "Comprehensive hands-on workshop covering React, TypeScript, Tailwind CSS, Docker containerization, and modern cloud deployment pipelines.",
      eventType: "WORKSHOP",
      startTime: new Date("2026-11-05T10:00:00Z"),
      endTime: new Date("2026-11-05T15:00:00Z"),
      status: EventStatus.COMPLETED,
      createdById: adminUser.id,
      workshop: {
        create: {
          speakerName: "Alex Vance",
          speakerBio: "Senior Frontend Engineer and open-source educator.",
          prerequisites: "Laptop with node.js and VS Code.",
        },
      },
      sponsors: {
        create: [{ sponsorId: sponsorTechCorp.id, amountFunded: 30000, sponsorshipTier: "GOLD" }],
      },
    },
  });

  // Event 11: Annual Tech Gala (COMPLETED - for testing social events & feedback)
  const ev11 = await prisma.event.create({
    data: {
      clubId: clubIiuccc.id,
      venueId: venueAuditorium.id,
      title: "Annual IIUC Tech Gala & Inter-Club Networking Night",
      description: "Annual celebration recognizing outstanding student leaders, hackathon champions, and research innovators across all IIUC clubs.",
      eventType: "SOCIAL",
      startTime: new Date("2026-10-20T17:00:00Z"),
      endTime: new Date("2026-10-20T21:00:00Z"),
      status: EventStatus.COMPLETED,
      createdById: adminUser.id,
    },
  });

  // 8. Registrations, Passes, & Certificates
  console.log("Seeding student registrations & certificates...");

  // Registration for Event 1 (CodeStorm Hackathon) - CONFIRMED
  await prisma.registration.create({
    data: {
      eventId: ev1.id,
      userId: studentUser.id,
      status: RegistrationStatus.CONFIRMED,
    },
  });
  await prisma.registration.create({
    data: {
      eventId: ev1.id,
      userId: studentUser2.id,
      status: RegistrationStatus.CONFIRMED,
    },
  });

  // Registration for Event 2 (Distributed Systems) - CONFIRMED
  await prisma.registration.create({
    data: {
      eventId: ev2.id,
      userId: studentUser.id,
      status: RegistrationStatus.CONFIRMED,
    },
  });

  // Registration for Event 4 (Robotics ROS2) - CONFIRMED
  await prisma.registration.create({
    data: {
      eventId: ev4.id,
      userId: studentUser3.id,
      status: RegistrationStatus.CONFIRMED,
    },
  });

  // Registration for Event 10 (Modern Web) - ATTENDED with issued Certificate!
  const regAliceCompleted = await prisma.registration.create({
    data: {
      eventId: ev10.id,
      userId: studentUser.id,
      status: RegistrationStatus.ATTENDED,
    },
  });

  const regFahimCompleted = await prisma.registration.create({
    data: {
      eventId: ev10.id,
      userId: studentUser2.id,
      status: RegistrationStatus.ATTENDED,
    },
  });

  // Issue Certificate for Alice's attended workshop
  await prisma.certificate.create({
    data: {
      registrationId: regAliceCompleted.id,
      certificateUrl: `http://localhost:5050/certificates/CERT-${regAliceCompleted.id}.pdf`,
    },
  });

  // Feedbacks for completed events
  await prisma.feedback.createMany({
    data: [
      { eventId: ev10.id, rating: 5, comments: "Outstanding workshop! The hands-on deployment section was incredibly useful." },
      { eventId: ev10.id, rating: 5, comments: "Speaker explained complex Docker and cloud workflows with great clarity." },
      { eventId: ev11.id, rating: 4, comments: "Great networking atmosphere and well-organized awards ceremony." },
    ],
  });

  // 9. Club Rankings (2026)
  console.log("Seeding 2026 Club Rankings...");
  await prisma.clubRanking.deleteMany({});
  await prisma.clubRanking.createMany({
    data: [
      {
        clubId: clubIiuccc.id,
        year: 2026,
        totalEventsScore: 98.50,
        sponsorshipScore: 95.00,
        feedbackScore: 97.20,
        finalScore: 96.90,
        rankPosition: 1,
      },
      {
        clubId: clubRobotics.id,
        year: 2026,
        totalEventsScore: 89.00,
        sponsorshipScore: 88.50,
        feedbackScore: 91.00,
        finalScore: 89.50,
        rankPosition: 2,
      },
      {
        clubId: clubAi.id,
        year: 2026,
        totalEventsScore: 87.50,
        sponsorshipScore: 85.00,
        feedbackScore: 90.50,
        finalScore: 87.67,
        rankPosition: 3,
      },
      {
        clubId: clubBusiness.id,
        year: 2026,
        totalEventsScore: 82.00,
        sponsorshipScore: 89.00,
        feedbackScore: 84.00,
        finalScore: 85.00,
        rankPosition: 4,
      },
      {
        clubId: clubTelecom.id,
        year: 2026,
        totalEventsScore: 78.00,
        sponsorshipScore: 75.00,
        feedbackScore: 83.00,
        finalScore: 78.67,
        rankPosition: 5,
      },
    ],
  });

  console.log("IIUC ClubVerse database seeded successfully!");
  console.log("- 11 Events across 5 IIUC clubs created (Approved, Pending, and Completed).");
  console.log("- Student registrations and verified credentials created.");
  console.log("- Club rankings and sponsorship records initialized.");
};

main()
  .catch((e) => {
    console.error("Seed error:", e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
