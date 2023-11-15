const request = require("supertest");
const db = require("../models/index");
const app = require("../app");
let server, agent;

const login = async (agent, email, password) => {
  let response = await agent.get("/login");
  response = await agent.post("/login").send({
    email: email,
    password: password,
  });
};

describe("Learning Management System test suite", () => {
  beforeAll(async () => {
    await db.sequelize.sync({ force: true });
    server = app.listen(3000, () => {});
    agent = request.agent(server);
  });

  afterAll(async () => {
    await db.sequelize.close();
    server.close();
  });

  test("should signup a user", async () => {
    let res = await agent.get("/signup");
    res = await agent.post("/user").send({
      firstName: "Irshad",
      lastName: "M",
      email: "irshad@example.com",
      password: "12345678",
    });
    expect(res.statusCode).toBe(302);
  });

  test("should login a user", async () => {
    await login(agent, "irshad@example.com", "12345678");
    const res = await agent.get("/");
    expect(res.statusCode).toBe(302);
  });

  test("should create a course", async () => {
    await login(agent, "irshad@example.com", "12345678");
    let res = await agent.get("/course/create");
    res = await agent.post("/course").send({
      name: "sample course",
      description: "sample description",
    });

    expect(res.statusCode).toBe(302);
  });

  test("should enroll a user in a course", async () => {
    await login(agent, "irshad@example.com", "12345678");

    const course = await db.course.create({
      course_name: "sample",
      description: "sample description",
      instructor_id: 1,
    });
    const enrollmentResponse = await agent.post(`/${course.id}/enrollment`);

    expect(enrollmentResponse.statusCode).toBe(302);

    const enrollmentRecord = await db.enrollment.findOne({
      where: {
        course_id: course.id,
      },
    });

    expect(enrollmentRecord.status).toBe(true);
  });

  test("should mark a page as complete", async () => {
    await login(agent, "irshad@example.com", "12345678");

    const chapter = await db.chapter.create({
      chapter_name: "sample",
      description: "sample chapter",
      course_id: 1,
    });

    const page = await db.page.create({
      page_name: "sample",
      content: "sample page",
      chapter_id: 1,
    });

    const markAsCompleteResponse = await agent.post(
      `/pages/${page.id}/markAsComplete`
    );

    expect(markAsCompleteResponse.statusCode).toBe(302);

    const completionStatus = await db.page_progress.findOne({
      where: {
        page_id: page.id,
        status: true,
      },
    });

    expect(completionStatus.status).toBe(true);
  });
});
