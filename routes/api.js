import express from 'express';
import { unlink } from 'fs';
import * as db from '../db/connection.js';

const router = express.Router();

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

// Block a user from loging in
router.put('/blockUser/:userNumID', async (req, res) => {
  try {
    const setBlocked = await db.setUserBlocked(req.params.userNumID);
    if (setBlocked.affectedRows === 1) {
      res.sendStatus(204);
    } else {
      res.sendStatus(404);
    }
  } catch (err) {
    res.status(500).send({ message: err.message });
  }
});

// Allow a user to log in
router.put('/allowUser/:userNumID', async (req, res) => {
  try {
    const setAllowed = await db.setUserAllowed(req.params.userNumID);
    if (setAllowed.affectedRows === 1) {
      res.sendStatus(204);
    } else {
      res.sendStatus(404);
    }
  } catch (err) {
    res.status(500).send({ message: err.message });
  }
});

// Delete a suggestion and do not apply it
router.delete('/rejectSuggestion/:suggestionID', async (req, res) => {
  try {
    const deleteSugg = await db.deleteSuggestion(req.params.suggestionID);
    if (deleteSugg.affectedRows !== 0) {
      res.sendStatus(204);
    } else {
      res.sendStatus(404);
    }
  } catch (err) {
    res.status(500).send({ message: err.message });
  }
});

// Delete a suggestion and apply it
router.delete('/acceptSuggestion/:suggestionID', async (req, res) => {
  try {
    let error = 204;
    const suggestion = await db.getSuggestionByID(req.params.suggestionID);
    const checkOccupied = await db.findCalendarElement({
      dayID: suggestion.dayID,
      timeID: suggestion.timeID,
    });

    if (suggestion.isInsert === 1 && !checkOccupied) {
      await db.insertCalendar({
        courseNumID: suggestion.courseNumID,
        dayID: suggestion.dayID,
        timeID: suggestion.timeID,
      });
      const deleteSugg = await db.deleteSuggestion(req.params.suggestionID);
      if (deleteSugg.affectedRows === 0) {
        error = 404;
      }
    } else if (suggestion.isInsert === 0 && checkOccupied) {
      const calendar = await db.findCalendarElement({
        dayID: suggestion.dayID,
        timeID: suggestion.timeID,
      });
      await db.deleteSuggestion(req.params.suggestionID);
      const deleteCal = await db.deleteCalendarElement(calendar.calendarID);
      if (deleteCal.affectedRows === 0) {
        error = 404;
      }
    } else {
      error = 409;
    }

    res.sendStatus(error);
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

export default router;
