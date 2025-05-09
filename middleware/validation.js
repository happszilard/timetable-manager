import path from 'path';
import * as db from '../db/connection.js';

// Course validation - unique ID, valid class
export const newCourseIDClassValidation = async (req, res, next) => {
  const id = await db.findCourseById(req.body.courseID);
  if (id.length !== 0) {
    return res.status(400).json({
      success: false,
      message: 'Course ID already exists',
    });
  }

  if (req.body.year < 1 || req.body.year > 6 || !Number.isInteger(parseInt(req.body.year, 10))) {
    return res.status(400).json({
      success: false,
      message: 'The year must be a number between 1 and 6',
    });
  }

  return next();
};

// Course validation - valid lecture, seminar and lab hours
export const newCourseHoursValidation = (req, res, next) => {
  if (req.body.lecture < 0 || !Number.isInteger(parseInt(req.body.lecture, 10))) {
    return res.status(400).json({
      success: false,
      message: 'The hours of lectures must be a pozitive number',
    });
  }

  if (req.body.seminar < 0 || !Number.isInteger(parseInt(req.body.seminar, 10))) {
    return res.status(400).json({
      success: false,
      message: 'The hours of seminars must be a pozitive number',
    });
  }

  if (req.body.lab < 0 || !Number.isInteger(parseInt(req.body.lab, 10))) {
    return res.status(400).json({
      success: false,
      message: 'The hours of labs must be a pozitive number',
    });
  }

  return next();
};

// User validation
export const newUsernameValidation = (req, res, next) => {
  const username = db.findUserByUsername(req.body.username);
  if (username.length !== 0) {
    return res.status(409).json({
      success: false,
      message: 'username already exists',
    });
  }

  return next();
};

// file upload validation
export const uploadValidation = async (req, res, next) => {
  const file = req.files ? req.files.material : undefined;

  if (!file) {
    return res.status(400).json({ success: false, message: 'No file uploaded.' });
  }

  const maxSize = 5 * 1024 * 1024; // 5MB
  if (file.size > maxSize) {
    return res.status(400).json({ success: false, message: 'File is too large (max 5MB).' });
  }

  const allowedExtensions = ['.pdf', '.docx', '.pptx', '.txt'];
  const fileExt = path.extname(file.name).toLowerCase();

  if (!allowedExtensions.includes(fileExt)) {
    return res.status(400).json({
      success: false,
      message: `Invalid file type. Allowed types: ${allowedExtensions.join(', ')}.`,
    });
  }

  return next();
};

// append users to courses validation - course/user not found
export const joinCourseMissingValidation = async (req, res, next) => {
  let error = '';
  const cid = await db.findCourseByNumId(req.body.courseselect);
  if (cid.length === 0) {
    error = 'Couldn\'t find the course!';
  }

  const uid = await db.findUserByNumID(req.body.userselect);
  if (uid.length === 0 && error === '') {
    error = 'Couldn\'t find the user!';
  }

  if (error !== '') {
    const [courses, users, members] = await Promise.all(
      [db.getCourses(), db.getUsers(), db.getUserMembers()],
    );
    return res.render('teachers', {
      error,
      courses,
      users,
      members,
      success: '',
    });
  }

  return next();
};

// append users to courses validation - bad request
export const joinCourseBadRequestValidation = async (req, res, next) => {
  let error = '';
  const joincourse = req.body.joinCourse;
  const umember = await db.findUserMember({
    course: req.body.courseselect,
    user: req.body.userselect,
  });

  if (umember.length === 0 && joincourse === 'leave') {
    error = 'The given user is not part of the course';
  }

  if (umember.length !== 0 && joincourse === 'join' && error === '') {
    error = 'The given user is already part of the course';
  }

  if (error !== '') {
    const [courses, users, members, suggestions] = await Promise.all(
      [db.getCourses(), db.getUsers(), db.getUserMembers(), db.getSuggestions()],
    );
    return res.render('teachers', {
      error,
      courses,
      users,
      members,
      suggestions,
      success: '',
    });
  }

  return next();
};

// schedule validation - bad request
export const maintainCoursesOccupied = async (req, res, next) => {
  let error = '';
  const insrtCourse = req.body.insertCourse;

  const checkOccupied = await db.findCalendarElement({
    dayID: req.body.dayselect,
    timeID: req.body.hourselect,
  });

  const checkCourseNumID = await db.getCalendarCourseNumID({
    dayID: req.body.dayselect,
    timeID: req.body.hourselect,
  });
  if (checkCourseNumID
    && checkCourseNumID.courseNumID !== parseInt(req.body.courseselect, 10)) {
    error = 'Bad course selection!';
  } else if (checkOccupied && insrtCourse === 'insert') {
    error = 'The selected time is occupied';
  } else if (!checkOccupied && insrtCourse === 'remove') {
    error = 'Nothing to be removed';
  }

  if (error !== '') {
    const [courses, hours, days] = await Promise.all(
      [db.getCourses(), db.getHours(), db.getDays()],
    );

    return res.render('maintain_courses', {
      courses,
      days,
      hours,
      error,
      success: '',
    });
  }
  return next();
};

// suggestion validation - bad request
export const badSuggestion = async (req, res, next) => {
  let error = '';
  const { insertCourse } = req.body;
  const checkCourseNumID = await db.getCalendarCourseNumID({
    dayID: req.body.dayselect,
    timeID: req.body.hourselect,
  });

  const checkOccupied = await db.findCalendarElement({
    dayID: req.body.dayselect,
    timeID: req.body.hourselect,
  });

  if (checkOccupied && insertCourse === 'insert') {
    error = 'The selected time is occupied';
  } else if (!checkOccupied && insertCourse === 'remove') {
    error = 'Nothing to be removed';
  } else if (checkCourseNumID
    && checkCourseNumID.courseNumID !== parseInt(req.body.courseselect, 10)) {
    error = 'Bad course selection!';
  }

  if (error !== '') {
    return res.status(400).json({
      success: false,
      message: error,
    });
  }

  return next();
};

// suggestion validation - no permission
export const noPremissionSuggestion = async (req, res, next) => {
  const checkMembership = await db.findUserMember({
    course: req.body.courseNumID,
    user: req.user.userNumID,
  });

  if (checkMembership.length === 0) {
    return res.status(400).json({
      success: false,
      message: 'You do not have permission',
    });
  }

  return next();
};
