import * as db from '../db/connection.js';

// Course validation - unique ID, valid class
export const newCourseIDClassValidation = async (req, res, next) => {
  const id = await db.findCourseById(req.body.courseID);
  if (id.length !== 0) {
    return res.render('new_course', { message: 'The course with the given ID already exists' });
  }

  if (req.body.class < 1 || req.body.class > 6 || !Number.isInteger(parseInt(req.body.class, 10))) {
    return res.render('new_course', { message: 'Invalid class. The class must be a number between 1 and 6.' });
  }

  return next();
};

// Course validation - valid lecture, seminar and lab hours
export const newCourseHoursValidation = (req, res, next) => {
  if (req.body.lecture < 0 || !Number.isInteger(parseInt(req.body.lecture, 10))) {
    return res.render('new_course', { message: 'Invalid lecture. The hours of lectures must be a pozitive number.' });
  }

  if (req.body.seminar < 0 || !Number.isInteger(parseInt(req.body.seminar, 10))) {
    return res.render('new_course', { message: 'Invalid seminar. The hours of seminars must be a pozitive number.' });
  }

  if (req.body.lab < 0 || !Number.isInteger(parseInt(req.body.lab, 10))) {
    return res.render('new_course', { message: 'Invalid lab. The hours of laboratory must be a pozitive number.' });
  }

  return next();
};

// file upload validation - empty upload
export const uploadValidation = async (req, res, next) => {
  if (!req.files.courseFile.name) {
    const [course, materials] = await Promise.all([db.getCourseByNumID(req.params.courseNumId),
      db.getMaterials(req.params.courseNumId)]);
    return res.render('course_details', {
      course,
      materials,
      error: 'Please select a file',
      success: '',
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
  const insrtCourse = req.body.insertCourse;
  const checkCourseNumID = await db.getCalendarCourseNumID({
    dayID: req.body.dayselect,
    timeID: req.body.hourselect,
  });

  const checkOccupied = await db.findCalendarElement({
    dayID: req.body.dayselect,
    timeID: req.body.hourselect,
  });

  if (checkOccupied && insrtCourse === 'insert') {
    error = 'The selected time is occupied';
  } else if (!checkOccupied && insrtCourse === 'remove') {
    error = 'Nothing to be removed';
  } else if (checkCourseNumID
    && checkCourseNumID.courseNumID !== parseInt(req.body.courseselect, 10)) {
    error = 'Bad course selection!';
  }

  if (error !== '') {
    const [courses, days, hours, suggestions] = await Promise.all(
      [db.getUserCourses(res.locals.payload.userNumID), db.getDays(),
        db.getHours(), db.getUserSuggestions(res.locals.payload.userNumID)],
    );

    return res.render('suggestion', {
      courses,
      days,
      hours,
      suggestions,
      error,
      success: '',
    });
  }

  return next();
};

// suggestion validation - bad request - no permission
export const noPremissionSuggestion = async (req, res, next) => {
  let error = '';

  const checkOccupied = await db.getCalendarCourseNumID({
    dayID: req.body.dayselect,
    timeID: req.body.hourselect,
  });

  if (checkOccupied) {
    const checkMembership = await db.findUserMember({
      course: checkOccupied.courseNumID,
      user: res.locals.payload.userNumID,
    });
    if (checkMembership.length === 0) {
      error = 'You don\'t have permission!';
    }
  }

  if (error !== '') {
    const [courses, days, hours, suggestions] = await Promise.all(
      [db.getUserCourses(res.locals.payload.userNumID), db.getDays(),
        db.getHours(), db.getUserSuggestions(res.locals.payload.userNumID)],
    );

    return res.render('suggestion', {
      courses,
      days,
      hours,
      suggestions,
      error,
      success: '',
    });
  }

  return next();
};
