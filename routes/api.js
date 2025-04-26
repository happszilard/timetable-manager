import express from 'express';
import { unlink, existsSync, mkdirSync } from 'fs';
import path from 'path';
import eformidable from 'express-formidable';
import * as db from '../db/connection.js';
import { onlyAdmins } from '../middleware/auth.js';
import * as vd from '../middleware/validation.js';

const router = express.Router();

const uploadDir = path.join(process.cwd(), 'uploadDir');

if (!existsSync(uploadDir)) {
  mkdirSync(uploadDir);
}

// get the materials attached to a specific course
router.get('/getMaterials/:courseNumID', async (req, res) => {
  try {
    const material = await db.getMaterials(req.params.courseNumID);
    res.send({ material });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// delete a material
router.delete('/deleteMaterial/:materialID', async (req, res) => {
  try {
    const material = await db.getMaterial(req.params.materialID);
    const filePath = `./uploadDir/${material.pathName}`;
    unlink(filePath, (err) => {
      if (err) {
        res.status(404).send(err);
      }
    });
    const deleteCourseMat = await db.deleteCourseMaterial(req.params.materialID);
    const deleteMat = await db.deleteMaterial(req.params.materialID);
    if (deleteCourseMat.affectedRows === 1 && deleteMat.affectedRows === 1) {
      return res.sendStatus(204);
    }
    return res.sendStatus(404);
  } catch (err) {
    return res.status(500).send({ message: err.message });
  }
});

// Check if a user is part of a course
router.get('/checkMember/:userNumID/:courseNumID', async (req, res) => {
  try {
    const check = await db.findUserMember({
      user: req.params.userNumID,
      course: req.params.courseNumID,
    });
    if (check.length === 0) {
      res.send({ joined: 0 });
    } else {
      res.send({ joined: 1 });
    }
  } catch (err) {
    res.status(500).send({ message: err.message });
  }
});

router.delete('/deleteUser/:userNumID', async (req, res) => {
  try {
    await db.deleteSuggestionByUser(req.params.userNumID);
    await db.deleteUserMemberAll(req.params.userNumID);
    const deleteUser = await db.deleteUser(req.params.userNumID);

    if (deleteUser.affectedRows === 1) {
      res.sendStatus(204);
    } else {
      res.sendStatus(404);
    }
  } catch (err) {
    res.status(500).send({ message: err.message });
  }
});

// --------------------- REST API ---------------------

router.get('/admin/courses', onlyAdmins, async (req, res) => {
  try {
    const allCourses = await db.getCourses();
    return res.status(200).json({ success: true, data: allCourses });
  } catch (err) {
    return res.status(500).json({ success: false, message: 'Error fetching courses' });
  }
});

router.get('/user/courses', async (req, res) => {
  try {
    const userCourses = await db.getUserCourses(req.user.userNumID);
    return res.status(200).json({ success: true, data: userCourses });
  } catch (err) {
    return res.status(500).json({ success: false, message: 'Error fetching courses' });
  }
});

router.post('/admin/courses', [vd.newCourseIDClassValidation, onlyAdmins,
  vd.newCourseHoursValidation], async (req, res) => {
  try {
    const {
      courseID, name, year, lecture, seminar, lab, color,
    } = req.body;
    console.log(req.body);
    const result = await db.insertCourse({
      courseID,
      name,
      year,
      lecture,
      seminar,
      lab,
      userNumID: req.user.userNumID,
      color,
    });
    console.log(result);

    if (!result || !result.insertId) {
      return res.status(400).json({ success: false, message: 'Error creating course' });
    }

    const newCourse = {
      courseNumID: result.insertId,
      courseID,
      name,
      year,
      lecture,
      seminar,
      lab,
      color,
      userNumID: req.user.userNumID,
    };

    return res.status(201).json({ success: true, data: newCourse });
  } catch (err) {
    return res.status(500).json({ success: false, message: 'Error creating course' });
  }
});

router.delete('/admin/courses/:courseNumID', onlyAdmins, async (req, res) => {
  const { courseNumID } = req.params;
  try {
    const deletedCourse = await db.deleteCourse(courseNumID);

    if (deletedCourse.affectedRows === 0) {
      return res.status(404).json({ success: false, message: 'Course not found' });
    }
    return res.status(200).json({ success: true, data: null });
  } catch (err) {
    return res.status(500).json({ success: false, message: 'Error deleting course' });
  }
});

router.get('/courses/:courseNumID', async (req, res) => {
  try {
    const userMember = await db.findUserMember({
      course: req.params.courseNumID,
      user: req.user.userNumID,
    });

    if (userMember.length === 0 && req.user.userType !== 0) {
      return res.status(401).json({ success: false, message: 'Access denied. You are not assigned to this course' });
    }
    const [course, materials] = await Promise.all([db.getCourseByNumID(req.params.courseNumID),
      db.getMaterials(req.params.courseNumID)]);
    if (!course) {
      return res.status(404).json({ success: false, message: 'Course not found' });
    }
    return res.status(200).json({ success: true, data: { course, materials } });
  } catch (err) {
    return res.status(500).json({ success: false, message: 'Error fetching course' });
  }
});

router.get('/calendar', async (req, res) => {
  try {
    const calendar = await db.getCalendar();
    return res.status(200).json({ success: true, data: calendar });
  } catch (err) {
    return res.status(500).json({ success: false, message: 'Error fetching courses' });
  }
});

router.get('/courses/:courseNumID/materials', async (req, res) => {
  try {
    const isAllowed = await db.findUserMember({
      user: req.user.userNumID,
      course: req.params.courseNumID,
    });
    if (isAllowed.length === 0 && req.user.userType !== 0) {
      return res.status(403).json({ success: false, message: 'Access denied' });
    }
    const materials = await db.getMaterialNames(req.params.courseNumID);
    return res.status(200).json({ success: true, data: materials });
  } catch (err) {
    return res.status(500).json({ success: false, message: 'Error fetching courses' });
  }
});

router.get('/courses/:courseNumID/materials/:materialID/download', async (req, res) => {
  try {
    const isAllowed = await db.findUserMember({
      user: req.user.userNumID,
      course: req.params.courseNumID,
    });
    if (isAllowed.length === 0 && req.user.userType !== 0) {
      return res.status(403).json({ success: false, message: 'You are not allowed to download this file.' });
    }

    const material = await db.getMaterial(req.params.materialID);
    if (material.courseNumID !== parseInt(req.params.courseNumID, 10)) {
      return res.status(403).json({ success: false, message: 'Access denied to this material.' });
    }

    const filePath = path.resolve(`./uploadDir/${material.pathName}`);
    return res.download(filePath, material.name);
  } catch (err) {
    return res.status(500).json({ success: false, message: `Unsuccessful download: ${err.message}` });
  }
});

// TODO: Check if material id and name are not needed in the resposne
router.post('/courses/:courseNumID/materials', [eformidable({ uploadDir }), vd.uploadValidation], async (req, res) => {
  try {
    const fileHandler = req.files.material;
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
    return res.status(200).json({ success: true, data: null });
  } catch (err) {
    return res.status(500).json({ success: false, message: 'File upload error' });
  }
});

router.get('/suggestions', onlyAdmins, async (req, res) => {
  try {
    const suggestions = await db.getSuggestions(req.user.userNumID);
    return res.status(200).json({ success: true, data: suggestions });
  } catch (err) {
    return res.status(500).json({ success: false, message: 'Error fetching suggestions' });
  }
});

router.get('/suggestions/me', async (req, res) => {
  try {
    const suggestions = await db.getUserSuggestions(req.user.userNumID);
    return res.status(200).json({ success: true, data: suggestions });
  } catch (err) {
    return res.status(500).json({ success: false, message: 'Error fetching suggestions' });
  }
});

router.post('/suggestions', [vd.badSuggestion, vd.noPremissionSuggestion], async (req, res) => {
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
      userNumID: req.user.userNumID,
    });
    return res.status(200).json({ success: true, data: null });
  } catch (err) {
    return res.status(500).json({ success: false, message: 'Error inserting the suggestion' });
  }
});

router.delete('/admin/suggestions/:suggestionID/accept', onlyAdmins, async (req, res) => {
  try {
    const { suggestionID } = req.params;
    const suggestion = await db.getSuggestionByID(suggestionID);

    if (!suggestion) {
      return res.status(404).json({ success: false, message: 'Suggestion not found' });
    }

    // suggesst to insert a course
    if (suggestion.isInsert === 1) {
      await db.insertCalendar({
        courseNumID: suggestion.courseNumID,
        dayID: suggestion.dayID,
        timeID: suggestion.timeID,
      });

      const deleteSugg = await db.deleteSuggestion(req.params.suggestionID);
      if (deleteSugg.affectedRows === 0) {
        return res.status(404).json({ success: false, message: 'Suggestion not found' });
      }

      // suggesst to remove a course
    } else if (suggestion.isInsert === 0) {
      const calendar = await db.findCalendarElement({
        dayID: suggestion.dayID,
        timeID: suggestion.timeID,
      });

      if (!calendar) {
        return res.status(404).json({ success: false, message: 'Calendar slot not found' });
      }

      await db.deleteSuggestion(req.params.suggestionID);
      const deleteCal = await db.deleteCalendarElement(calendar.calendarID);

      if (deleteCal.affectedRows === 0) {
        return res.status(404).json({ success: false, message: 'Calendar slot not found' });
      }
    } else {
      res.status(409).json({ success: false, data: 'Invalid suggestion format. Could not apply suggestion.' });
    }

    return res.status(200).json({ success: true, data: null });
  } catch (err) {
    return res.status(500).json({ success: false, message: 'Unexpected error while applying the suggestion' });
  }
});

router.delete('/admin/suggestions/:suggestionID/reject', onlyAdmins, async (req, res) => {
  try {
    const deleteSugg = await db.deleteSuggestion(req.params.suggestionID);
    if (deleteSugg.affectedRows !== 0) {
      return res.status(200).json({ success: true, data: null });
    }
    return res.status(404).json({ success: false, message: 'Suggestion not found' });
  } catch (err) {
    return res.status(500).json({ success: false, message: 'Unexpected error while deleting the suggestion' });
  }
});

router.get('/users', onlyAdmins, async (req, res) => {
  try {
    const users = await db.getUsers();
    return res.status(200).json({ success: true, data: users });
  } catch (err) {
    return res.status(500).json({ success: false, message: 'Error fetching users' });
  }
});

router.get('/users/me', async (req, res) => {
  try {
    const currentUser = await db.getUserByNumID(req.user.userNumID);
    if (!currentUser) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    return res.status(200).json({ success: true, data: currentUser });
  } catch (err) {
    return res.status(500).json({ success: false, message: 'Error fetching user' });
  }
});

router.patch('/admin/users/:userNumID/allow', onlyAdmins, async (req, res) => {
  try {
    const setAllowed = await db.setUserAllowed(req.params.userNumID);
    if (setAllowed.affectedRows === 1) {
      return res.sendStatus(204);
    }

    return res.status(404).json({ success: false, message: 'User not found' });
  } catch (err) {
    return res.status(500).send({ success: false, message: 'Unexpected error while allowing user access' });
  }
});

router.patch('/admin/users/:userNumID/block', onlyAdmins, async (req, res) => {
  try {
    const setBlocked = await db.setUserBlocked(req.params.userNumID);
    if (setBlocked.affectedRows === 1) {
      return res.sendStatus(204);
    }

    return res.status(404).json({ success: false, message: 'User not found' });
  } catch (err) {
    return res.status(500).send({ success: false, message: 'Unexpected error while blocking user access' });
  }
});

export default router;
