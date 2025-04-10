import express from 'express';
import path from 'path';
import { existsSync, mkdirSync } from 'fs';
import eformidable from 'express-formidable';
import * as db from '../db/connection.js';
import * as vd from '../middleware/validation.js';
import { checkAdmin, checkJWT } from '../middleware/auth.js';

const router = express.Router();

const uploadDir = path.join(process.cwd(), 'uploadDir');

if (!existsSync(uploadDir)) {
  mkdirSync(uploadDir);
}

router.get(['/', '/index'], async (req, res) => {
  try {
    if (res.locals.payload && res.locals.payload.userType === 1) {
      const courses = await db.getUserCourses(res.locals.payload.userNumID);
      res.render('index', {
        courses,
        error: '',
        success: '',
      });
    } else {
      const courses = await db.getCourses();
      res.render('index', {
        courses,
        error: '',
        success: '',
      });
    }
  } catch (err) {
    res.status(500).render('error', { message: `Selection unsuccessful: ${err.message}` });
  }
});

router.get('/new_course', [checkJWT, checkAdmin], async (req, res) => {
  try {
    res.render('new_course', { message: '' });
  } catch (err) {
    res.status(500).render('error', { message: `Selection unsuccessful: ${err.message}` });
  }
});

router.get('/teachers', [checkJWT, checkAdmin], async (req, res) => {
  try {
    const [courses, users, members, suggestions] = await Promise.all(
      [db.getCourses(), db.getUsers(), db.getUserMembers(), db.getSuggestions()],
    );
    res.render('teachers', {
      error: '',
      courses,
      users,
      members,
      suggestions,
      success: '',
    });
  } catch (err) {
    res.status(500).render('error', { message: `Selection unsuccessful: ${err.message}` });
  }
});

router.get('/course_details/:courseNumID', checkJWT, async (req, res) => {
  try {
    const [course, materials] = await Promise.all([db.getCourseByNumID(req.params.courseNumID),
      db.getMaterials(req.params.courseNumID)]);
    res.render('course_details', {
      course,
      materials,
      error: '',
      success: '',
    });
  } catch (err) {
    res.status(500).render('error', { message: `Selection unsuccessful: ${err.message}` });
  }
});

router.get('/course_details/download/:materialId', checkJWT, async (req, res) => {
  try {
    const material = await db.getMaterial(req.params.materialId);
    const filePath = `./uploadDir/${material.pathName}`;
    res.download(filePath, material.name);
  } catch (err) {
    res.status(500).render('error', { message: `Unsuccessful download:  ${err.message}` });
  }
});

router.get('/maintain_courses', [checkJWT, checkAdmin], async (req, res) => {
  try {
    const [courses, hours, days] = await Promise.all(
      [db.getCourses(), db.getHours(), db.getDays()],
    );
    res.render('maintain_courses', {
      courses,
      days,
      hours,
      error: '',
      success: '',
    });
  } catch (err) {
    res.status(500).render('error', { message: `Unsuccessful download:  ${err.message}` });
  }
});

router.get('/calendar', checkJWT, async (req, res) => {
  try {
    let calendarElements = [];
    let calendarElementsAll = [];
    let hours = [];
    let days = [];

    [calendarElementsAll, calendarElements, hours, days] = await Promise.all(
      [db.getCalendar(), db.getUserCalendar(res.locals.payload.userNumID),
        db.getHours(), db.getDays()],
    );

    const calendar = [];

    for (let i = 0; i < hours.length; i += 1) {
      calendar.push([]);
      for (let j = 0; j < days.length; j += 1) {
        calendar[i].push(undefined);
      }
    }

    if (res.locals.payload.userType === 0) {
      calendarElementsAll.forEach((element) => {
        calendar[element.timeID - 1][element.dayID - 1] = {
          name: element.name,
          color: element.color,
        };
      });
    } else if (res.locals.payload.userType === 1) {
      calendarElements.forEach((element) => {
        calendar[element.timeID - 1][element.dayID - 1] = {
          name: element.name,
          color: element.color,
        };
      });

      calendarElementsAll.forEach((element) => {
        if (!calendar[element.timeID - 1][element.dayID - 1]) {
          calendar[element.timeID - 1][element.dayID - 1] = {
            name: undefined,
            color: undefined,
          };
        }
      });
    }

    res.render('calendar', {
      calendar,
      days,
      hours,
    });
  } catch (err) {
    res.status(500).render('error', { message: `Unsuccessful download:  ${err.message}` });
  }
});

router.get('/delete_course/:courseNumID',  [checkJWT, checkAdmin], async (req, res) => {
  try {
    await db.deleteCourseMaterialByCourse(req.params.courseNumID);
    await db.deleteCourseMember(req.params.courseNumID);
    await db.deleteCourseCalendar(req.params.courseNumID);
    const checkDeleteCourse = await db.deleteCourse(req.params.courseNumID);

    if (checkDeleteCourse.affectedRows !== 0) {
      res.redirect('/');
    } else {
      const [course, materials] = await Promise.all([db.getCourseByNumID(req.params.courseNumID),
        db.getMaterials(req.params.courseNumID)]);
      res.render('course_details', {
        course,
        materials,
        error: 'Couldn\'t delete the course!',
        success: '',
      });
    }
  } catch (err) {
    res.status(500).render('error', { message: `Unsuccessful deletion:  ${err.message}` });
  }
});

router.get('/suggest', checkJWT, async (req, res) => {
  try {
    const [courses, days, hours, suggestions] = await Promise.all(
      [db.getUserCourses(res.locals.payload.userNumID), db.getDays(),
        db.getHours(), db.getUserSuggestions(res.locals.payload.userNumID)],
    );
    res.render('suggestion', {
      courses,
      days,
      hours,
      suggestions,
      error: '',
      success: '',
    });
  } catch (err) {
    res.status(500).render('error', { message: `Unsuccessful deletion:  ${err.message}` });
  }
});

const newCoursePost = async (req, res) => {
  try {
    await db.insertCourse({
      req,
      res,
    });
    if (res.locals.payload && res.locals.payload.userType === 1) {
      const courses = await db.getUserCourses(res.locals.payload.userNumID);
      res.render('index', {
        courses,
        error: '',
        success: '',
      });
    } else {
      const courses = await db.getCourses();
      res.render('index', {
        courses,
        error: '',
        success: '',
      });
    }
  } catch (err) {
    res.status(500).render('error', { message: 'Couldnt add the course!' });
  }
};

router.post('/newCourse', [vd.newCourseIDClassValidation, checkJWT, checkAdmin,
  vd.newCourseHoursValidation], newCoursePost);

router.post('/course_details/:courseNumId', [eformidable({ uploadDir }), vd.uploadValidation, checkJWT], async (req, res) => {
  try {
    const fileHandler = req.files.courseFile;
    const pathName = fileHandler.path.substring(fileHandler.path.lastIndexOf('\\') + 1);
    const inserted = await db.insertMaterial({
      name: fileHandler.name,
      path: fileHandler.path,
      pathName,
    });

    const materialId = inserted.insertId;

    await db.insertCourseMaterial({
      courseNumID: req.params.courseNumId,
      materialID: materialId,
    });
    const [course, materials] = await Promise.all([db.getCourseByNumID(req.params.courseNumId),
      db.getMaterials(req.params.courseNumId)]);
    res.render('course_details', {
      course,
      materials,
      error: '',
      success: 'Upload successful',
    });
  } catch (err) {
    res.status(500).render('error', { message: err });
  }
});

const joinCoursePost = async (req, res) => {
  try {
    const joincourse = req.body.joinCourse;
    let success = '';
    const cid = req.body.courseselect;
    const uid = req.body.userselect;

    if (joincourse === 'join') {
      await db.insertUserMember({
        course: cid,
        user: uid,
      });
      success = 'The user joined successfully';
    } else if (joincourse === 'leave') {
      await db.deleteUserMember({
        course: cid,
        user: uid,
      });
      success = 'The user left successfully';
    }

    const [courses, users, members, suggestions] = await Promise.all(
      [db.getCourses(), db.getUsers(), db.getUserMembers(), db.getSuggestions()],
    );
    res.render('teachers', {
      error: '',
      courses,
      users,
      members,
      suggestions,
      success,
    });
  } catch (err) {
    res.status(500).render('error', { message: 'Couldnt add the user to the course!' });
  }
};

router.post('/teachers', [vd.joinCourseMissingValidation,
  vd.joinCourseBadRequestValidation, checkJWT, checkAdmin], joinCoursePost);

router.post('/maintain_courses', vd.maintainCoursesOccupied, async (req, res) => {
  try {
    let error = '';
    let success = '';
    const [courses, hours, days] = await Promise.all(
      [db.getCourses(), db.getHours(), db.getDays()],
    );

    if (req.body.insertCourse === 'insert') {
      await db.insertCalendar({
        courseNumID: req.body.courseselect,
        dayID: req.body.dayselect,
        timeID: req.body.hourselect,
      });
      success = 'Schedule set successfully';
    } else if (req.body.insertCourse === 'remove') {
      const calendar = await db.findCalendarElement({
        dayID: req.body.dayselect,
        timeID: req.body.hourselect,
      });

      const deleteCal = await db.deleteCalendarElement(calendar.calendarID);
      if (deleteCal.affectedRows === 0) {
        error = 'Couldn\'t remove the given course';
      } else {
        success = 'Schedule set successfully';
      }
    }

    res.render('maintain_courses', {
      courses,
      days,
      hours,
      error,
      success,
    });
  } catch (err) {
    res.status(500).render('error', { message: `Unsuccessful download:  ${err.message}` });
  }
});

router.post('/suggest', [vd.badSuggestion, vd.noPremissionSuggestion, checkJWT], async (req, res) => {
  try {
    let isInsert = 0;

    if (req.body.insertCourse === 'insert') {
      isInsert = 1;
    } else {
      isInsert = 0;
    }

    await db.insertSuggestion({
      courseNumID: req.body.courseselect,
      dayID: req.body.dayselect,
      timeID: req.body.hourselect,
      isInsert,
      userNumID: res.locals.payload.userNumID,
    });

    const [courses, days, hours, suggestions] = await Promise.all(
      [db.getUserCourses(res.locals.payload.userNumID), db.getDays(),
        db.getHours(), db.getUserSuggestions(res.locals.payload.userNumID)],
    );

    res.render('suggestion', {
      courses,
      days,
      hours,
      suggestions,
      error: '',
      success: 'The suggestion has been made!',
    });
  } catch (err) {
    res.status(500).render('error', { message: `Unsuccessful deletion:  ${err.message}` });
  }
});

export default router;
