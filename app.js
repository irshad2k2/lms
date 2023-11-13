const express = require("express");
const {
  user,
  course,
  chapter,
  page,
  enrollment,
  page_progress,
} = require("./models");
const app = express();
const bodyParser = require("body-parser");
const cookieParser = require("cookie-parser");
const path = require("path");
const flash = require("connect-flash");
const bcrypt = require("bcrypt");
const saltRounds = 10;
const passport = require("passport");
const LocalStrategy = require("passport-local").Strategy;
const session = require("express-session");
const { request } = require("http");
const { Op } = require("sequelize");

app.use(express.static("public"));

app.set("views", path.join(__dirname, "views"));
app.set("view engine", "ejs");
app.use(
  session({
    secret: "secret string123456",
    resave: false,
    saveUninitialized: false,
  })
);

app.use(flash());

app.use(bodyParser.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser("secret string"));

app.use(passport.initialize());
app.use(passport.session());

passport.use(
  new LocalStrategy(
    {
      usernameField: "email",
      passwordField: "password",
    },
    async function (email, password, done) {
      try {
        const User = await user.findOne({ where: { email: email } });

        console.log(User);

        if (!User || !(await bcrypt.compare(password, User.password))) {
          return done(null, false, { message: "Incorrect email or password." });
        }

        return done(null, User);
      } catch (error) {
        return done(error);
      }
    }
  )
);

function requireEducator(req, res, next) {
  if (req.user && req.user.role === "educator") {
    return next();
  } else {
    res.status(401).json({ message: "Unauthorized user." });
  }
}

async function checkEnrollment(req, res, next) {
  const courseID = req.params.courseID;
  const userID = req.user.id;

  const enrollmentRecord = await enrollment.findOne({
    where: {
      user_id: userID,
      course_id: courseID,
      status: true,
    },
  });

  const courseOwner = await course.findOne({
    where: {
      instructor_id: userID,
    },
  });

  if (enrollmentRecord || courseOwner) {
    return next();
  } else {
    res.status(403).send("You are not enrolled in this course.");
  }
}

passport.serializeUser(function (user, done) {
  done(null, user.id);
});

passport.deserializeUser(async function (id, done) {
  try {
    const User = await user.findOne({ where: { id: id } });
    done(null, User);
  } catch (error) {
    done(error);
  }
});

/////////////////////////////////////// creating user /////////////////////////////////////////////

app.get("/signup", async function (request, response) {
  response.render("signup");
});

app.post("/user", async function (request, response) {
  const hashedPwd = await bcrypt.hash(request.body.password, saltRounds);
  try {
    const user_post = await user.create({
      firstName: request.body.firstName,
      lastName: request.body.lastName,
      email: request.body.email,
      role: request.body.role,
      password: hashedPwd,
    });
    request.logIn(user_post, (err) => {
      if (err) {
        console.log(err);
      }
      return response.redirect("/");
    });
  } catch (error) {
    console.log(error);
  }
});

app.get("/login", async function (request, response) {
  response.render("login");
});

//////////////////////////////////////// login mechanism /////////////////////////////////

app.post(
  "/login",
  passport.authenticate("local", {
    successRedirect: "/",
    failureRedirect: "/login",
    failureFlash: true,
  })
);

app.get("/logout", function (req, res) {
  req.logout(function (err) {
    if (err) {
      console.error(err);
    }
    res.redirect("/");
  });
});

app.get("/", async function (request, response) {
  if (request.user) {
    if (request.user.role == "educator") {
      return response.redirect(`/homeEducator`);
    }
    return response.redirect(`/home/${request.user.id}`);
  } else {
    response.render("index");
  }
});

app.get("/home/:userID", async function (request, response) {
  const coursesData = await course.findAll();
  const fName = await user.findOne({
    where: {
      id: request.user.id,
    },
  });
  const enrolledCoursesArray = await enrollment.findAll({
    where: {
      user_id: request.user.id,
      status: true,
    },
    include: [
      {
        model: course,
        attributes: ["id", "course_name", "description"],
      },
    ],
  });

  // course progress

  const courseProgressArray = await Promise.all(
    enrolledCoursesArray.map(async (enrollment) => {
      const chapterIds = (
        await chapter.findAll({
          where: { course_id: enrollment.course.id },
        })
      ).map((chapter) => chapter.id);

      const totalPages = await page.count({
        where: {
          chapter_id: {
            [Op.in]: chapterIds,
          },
        },
      });

      const completedPages = await page_progress.count({
        where: {
          user_id: request.user.id,
          page_id: {
            [Op.in]: (
              await page.findAll({
                where: {
                  chapter_id: {
                    [Op.in]: chapterIds,
                  },
                },
              })
            ).map((page) => page.id),
          },
          status: true,
        },
      });
      const progressPercentage = (completedPages / totalPages) * 100;
      return {
        courseId: enrollment.course.id,
        progress: progressPercentage.toFixed(2),
      };
    })
  );

  response.render("home", {
    courses: coursesData,
    enrolledCourses: enrolledCoursesArray,
    firstName: fName.firstName,
    courseProgress: courseProgressArray,
  });
});

app.get("/homeEducator", async function (request, response) {
  const coursesData = await course.findAll();
  const fName = await user.findOne({
    where: {
      id: request.user.id,
    },
  });
  const enrolledCoursesArray = await enrollment.findAll({
    where: {
      user_id: request.user.id,
      status: true,
    },
    include: [
      {
        model: course,
        attributes: ["id", "course_name", "description"],
      },
    ],
  });

  // course progress

  const courseProgressArray = await Promise.all(
    enrolledCoursesArray.map(async (enrollment) => {
      const chapterIds = (
        await chapter.findAll({
          where: { course_id: enrollment.course.id },
        })
      ).map((chapter) => chapter.id);

      const totalPages = await page.count({
        where: {
          chapter_id: {
            [Op.in]: chapterIds,
          },
        },
      });

      const completedPages = await page_progress.count({
        where: {
          user_id: request.user.id,
          page_id: {
            [Op.in]: (
              await page.findAll({
                where: {
                  chapter_id: {
                    [Op.in]: chapterIds,
                  },
                },
              })
            ).map((page) => page.id),
          },
          status: true,
        },
      });

      const progressPercentage = (completedPages / totalPages) * 100;
      return {
        courseId: enrollment.course.id,
        progress: progressPercentage.toFixed(2),
      };
    })
  );

  response.render("homeEducator", {
    courses: coursesData,
    enrolledCourses: enrolledCoursesArray,
    firstName: fName.firstName,
    reportLink: "/reports",
    courseProgress: courseProgressArray,
  });
});

///////////////////////////////////////// course //////////////////////////////////////////

app.post("/course", async function (request, response) {
  try {
    const course_post = await course.create({
      course_name: request.body.name,
      description: request.body.description,
      instructor_id: request.user.id,
    });
    const courseID = await course_post.id;
    response.redirect(`/course/${courseID}/chapter`);
  } catch (error) {
    console.log(error);
    return response.status(422).json(error);
  }
});

app.get("/course/create", requireEducator, async function (request, response) {
  response.render("courseCreation");
});

//my courses

app.get("/courses", async function (request, response) {
  try {
    const coursesData = await course.findAll({
      where: {
        instructor_id: request.user.id,
      },
    });
    response.render("courses", { courses: coursesData });
  } catch (error) {
    console.log(error);
    response.status(500).send("Internal Server Error");
  }
});

////////////////////////////////////////// chapter//////////////////////////////////////////////////

app.post("/course/:courseID/chapter", async function (request, response) {
  const courseID = request.params.courseID;
  const { name, description } = request.body;
  try {
    const chapter_post = await chapter.create({
      chapter_name: request.body.name,
      description: request.body.description,
      course_id: request.params.courseID,
    });
    const chapterID = await chapter_post.id;
    if (request.accepts("html")) {
      return response.redirect(`/course/${courseID}/chapter`);
    } else {
      return response.json(chapter_post);
    }
  } catch (error) {
    console.log(error);
    return response.status(422).json(error);
  }
});

app.get("/course/:courseID/chapter", async function (request, response) {
  const courseID = request.params.courseID;
  const chaptersData = await chapter.findAll({
    where: {
      course_id: courseID,
    },
  });
  const courseData = await course.findOne({
    where: {
      id: courseID,
    },
  });

  response.render("chapterCreation", {
    courseID,
    chapters: chaptersData,
    course_name: courseData.course_name,
  });
});

//my chapters

app.get("/courses/:courseID/chapters", async function (request, response) {
  try {
    const courseID = request.params.courseID;
    const chaptersData = await chapter.findAll({
      where: {
        course_id: courseID,
      },
    });
    const courseData = await course.findOne({
      where: {
        id: courseID,
      },
    });
    response.render("chapters", {
      chapters: chaptersData,
      course_name: courseData.course_name,
    });
  } catch (error) {
    console.log(error);
    response.status(500).send("Internal Server Error");
  }
});

app.get("/:courseID/addChapter", async function (request, response) {
  const courseID = request.params.courseID;
  const chaptersData = await chapter.findAll({
    where: {
      course_id: courseID,
    },
  });
  response.render("addChapter", { courseID, chapters: chaptersData });
});

//////////////////////////////////////////// page ////////////////////////////////////////////
app.post("/chapter/:chapterID/page", async function (request, response) {
  const chapterID = request.params.chapterID;
  const page_post = await page.create({
    page_name: request.body.name,
    content: request.body.content,
    chapter_id: request.params.chapterID,
  });
  response.redirect(`/chapter/${chapterID}/page`);
});

app.get("/chapter/:chapterID/page", async function (request, response) {
  const chapterID = request.params.chapterID;

  const pagesData = await page.findAll({
    where: {
      chapter_id: chapterID,
    },
  });

  const chaptersData = await chapter.findOne({
    where: {
      id: chapterID,
    },
  });

  response.render("pageCreation", {
    chapterID,
    pages: pagesData,
    page_name: chaptersData.chapter_name,
    chapter_name: chaptersData.chapter_name,
  });
});

//my pages

//student
app.get(
  "/course/:courseID/chapter/:chapterID/pages",
  checkEnrollment,
  async function (request, response) {
    try {
      const chapterID = request.params.chapterID;
      const pageData = await page.findAll({
        where: {
          chapter_id: chapterID,
        },
      });
      response.render("pages", { pages: pageData });
    } catch (error) {
      console.log(error);
      response.status(500).send("Internal Server Error");
    }
  }
);

app.get("/chapter/:pageID", async function (request, response) {
  try {
    const pageData = await page.findOne({
      where: {
        id: request.params.pageID,
      },
    });

    const completionStatus = await page_progress.findOne({
      where: {
        user_id: request.user.id,
        page_id: request.params.pageID,
        status: true,
      },
    });

    let status = false;
    if (completionStatus) {
      status = true;
    } else {
      status = false;
    }

    response.render("page", { page: pageData, status });
  } catch (error) {
    console.log(error);
    response.status(500).send("Internal Server Error");
  }
});

// page navigation

app.get("/chapter/:pageID/prev", async function (request, response) {
  try {
    const pageID = request.params.pageID;

    const pageData = await page.findOne({
      where: {
        id: pageID,
      },
    });

    const chapterID = pageData.chapter_id;

    const prevPage = await page.findOne({
      where: {
        chapter_id: chapterID,
        id: { [Op.lt]: pageID },
      },
      order: [["id", "DESC"]],
    });

    if (prevPage) {
      response.redirect(`/chapter/${prevPage.id}`);
    } else {
      response.redirect(`/chapter/${pageID}`);
    }
  } catch (error) {
    console.log(error);
    response.status(500).send("Internal Server Error");
  }
});

app.get("/chapter/:pageID/next", async function (request, response) {
  try {
    const pageID = request.params.pageID;

    const pageData = await page.findOne({
      where: {
        id: pageID,
      },
    });

    const chapterID = pageData.chapter_id;

    const nextPage = await page.findOne({
      where: {
        chapter_id: chapterID,
        id: { [Op.gt]: pageID },
      },
      order: [["id", "ASC"]],
    });

    if (nextPage) {
      response.redirect(`/chapter/${nextPage.id}`);
    } else {
      response.redirect(`/chapter/${pageID}`);
    }
  } catch (error) {
    console.log(error);
    response.status(500).send("Internal Server Error");
  }
});

//////////////////////////////////////// enrollment //////////////////////////////////////

app.post("/:courseID/enrollment", async function (request, response) {
  const courseID = request.params.courseID;
  const Enrollment = await enrollment.create({
    status: true,
    progress: 0,
    user_id: request.user.id,
    course_id: courseID,
  });

  response.redirect("/");
});

////////////////////////////// mark page as complete //////////////////////////////////////

app.post("/pages/:pageID/markAsComplete", async function (request, response) {
  try {
    const pageID = request.params.pageID;
    const markAsComplete = await page_progress.create({
      page_id: request.params.pageID,
      user_id: request.user.id,
      status: true,
    });
    if (markAsComplete) {
      response.redirect(`/chapter/${pageID}`);
      // response.status(200).send("Page marked as complete.");
    } else {
      response.status(500).send("Failed to mark page as complete.");
    }
  } catch (error) {
    console.error(error);
    response.status(500).send("Internal Server Error");
  }
});

//////////////////////////////////////// change password //////////////////////////////////////

app.get("/change-password", function (req, res) {
  res.render("changePassword");
});

app.post("/change-password", async function (req, res) {
  const { currentPassword, newPassword, confirmNewPassword } = req.body;

  const isValidPassword = await bcrypt.compare(
    currentPassword,
    req.user.password
  );

  if (!isValidPassword) {
    req.flash("error", "Incorrect current password.");
    return res.redirect("/change-password");
  }

  if (newPassword !== confirmNewPassword) {
    req.flash("error", "New password and confirm password do not match.");
    return res.redirect("/change-password");
  }

  const hashedNewPassword = await bcrypt.hash(newPassword, saltRounds);
  req.user.password = hashedNewPassword;
  await req.user.save();

  req.flash("success", "Password changed successfully.");
  res.redirect("/");
});

////////////////////////////////// reports page ///////////////////////////////////////

app.get("/report", requireEducator, async function (request, response) {
  try {
    const educatorCourses = await course.findAll({
      where: {
        instructor_id: request.user.id,
      },
    });

    const enrollmentData = await Promise.all(
      educatorCourses.map(async (course) => {
        const enrollmentCount = await enrollment.count({
          where: {
            course_id: course.id,
            status: true,
          },
        });
        return {
          courseId: course.id,
          courseName: course.course_name,
          enrollmentCount,
        };
      })
    );

    response.render("report", { enrollmentData });
  } catch (error) {
    console.log(error);
    response.status(500).send("Internal Server Error");
  }
});

module.exports = app;
