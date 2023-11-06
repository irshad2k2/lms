const express = require("express");
const { user, course, chapter, page, enrollment, page_progress } = require('./models')
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

app.use(session({
    secret: "secret string123456",
    resave: false,
    saveUninitialized: false
  }));
  
  
  app.use(flash());
  app.set("views", path.join(__dirname, "views"));
  app.set("view engine", "ejs");
  app.use(express.static(path.join(__dirname, "public")));
  
  app.use(bodyParser.json());
  app.use(express.urlencoded({ extended: false }));
  app.use(cookieParser("secret string"));
  
  app.use(passport.initialize());
  app.use(passport.session());
  
  passport.use(new LocalStrategy(
    {
      usernameField: 'email',
      passwordField: 'password'
    },
    async function(email, password, done) {
      try {
        const User = await user.findOne({ where: { email: email } });
  
        console.log(User);
  
        if (!User || !(await bcrypt.compare(password, User.password))) {
          return done(null, false, { message: 'Incorrect email or password.' });
        }
  
        return done(null, User);
      } catch (error) {
        return done(error);
      }
    }
  ));
  
  function requireEducator(req, res, next) {
    if (req.user && req.user.role === 'educator') {
      return next();
    } else {
      res.status(401).json({ message: 'Unauthorized user.' });
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
        instructor_id: userID
      }
    });
  
    if (enrollmentRecord || courseOwner) {
      return next();
    } else {
      res.status(403).send("You are not enrolled in this course.");
    }
  }
  
  
  passport.serializeUser(function(user, done) {
    done(null, user.id);
  });
  
  passport.deserializeUser(async function(id, done) {
    try {
      const User = await user.findOne({ where: { id: id } });
      done(null, User);
    } catch (error) {
      done(error);
    }
  });

  
/////////////////////////////////////// creating user /////////////////////////////////////////////

app.get(
    "/signup",
    async function (request, response) {
        response.render("signup")
    }
);
  

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

app.get(
"/login",
async function (request, response) {
    response.render("login")
}
);

//////////////////////////////////////// login mechaism /////////////////////////////////

app.post(
    "/login",
    passport.authenticate("local", {
      successRedirect: "/",
      failureRedirect: "/login", 
      failureFlash: true,
    })
  );
  
  app.get("/logout", function(req, res) {
    req.logout(function(err) {
      if (err) {
        console.error(err);
      }
      res.redirect("/"); 
    });
  });
  
  
  
  app.get('/', async function (request, response) {
    if (request.user) {
      if (request.user.role == "educator") {
        return response.redirect(`/homeEducator`);
      }
      return response.redirect(`/home/${request.user.id}`);
    } else {
      response.render("index")
    }
  });
  
  
  app.get(
    "/home/:userID",
    async function (request, response) {
      const coursesData = await course.findAll();
      const enrolledCoursesArray = await enrollment.findAll({
        where: {
          user_id: request.user.id,
          status: true, 
        },
        include: [{
          model: course,
          attributes: ['id', 'course_name', 'description'],
        }],
      });
      response.render("home", {courses: coursesData , enrolledCourses: enrolledCoursesArray})
    }
  );
  
  app.get(
    "/homeEducator",
    async function (request, response) {
      const coursesData = await course.findAll();
      const enrolledCoursesArray = await enrollment.findAll({
        where: {
          user_id: request.user.id,
          status: true, 
        },
        include: [{
          model: course,
          attributes: ['id', 'course_name', 'description'],
        }],
      });
      response.render("homeEducator", {courses: coursesData , enrolledCourses: enrolledCoursesArray})
    }
  );