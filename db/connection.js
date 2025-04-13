import util from 'util';
import mysql from 'mysql';

const connectionPool = mysql.createPool({
  connectionLimit: 10,
  database: 'timetable',
  host: 'localhost',
  port: 3306,
  user: 'myuser',
  password: 'mypwd123',
});

const basicQuery = util.promisify(connectionPool.query).bind(connectionPool);

export const createTableCourses = async () => {
  try {
    await basicQuery(`CREATE TABLE IF NOT EXISTS courses (
      courseNumID INT PRIMARY KEY AUTO_INCREMENT,
      courseID VARCHAR(255) UNIQUE,
      name VARCHAR(255),
      class INT,
      lecture INT,
      seminar INT,
      lab INT,
      userNumID INT,
      color VARCHAR(127),
      FOREIGN KEY (userNumID) REFERENCES users(userNumID)
      );
    `);
    console.log('Table courses created successfully');
  } catch (err) {
    console.error(`Create table courses error: ${err}`);
    process.exit(1);
  }
};

export const createTableUsers = async () => {
  try {
    await basicQuery(`CREATE TABLE IF NOT EXISTS users (
      userNumID INT PRIMARY KEY auto_increment,
      userID VARCHAR(255) unique,
      firstName VARCHAR(255),
      lastName VARCHAR(255),
      username VARCHAR(255),
      password VARCHAR(255),
      userType INT,
      allowed INT
      );
    `);
    console.log('Table users created successfully');
  } catch (err) {
    console.error(`Create table users error: ${err}`);
    process.exit(1);
  }
};

export const createTableMembers = async () => {
  try {
    await basicQuery(`CREATE TABLE IF NOT EXISTS members (
      courseNumID INT,
      userNumID INT,
      PRIMARY KEY (courseNumID, userNumID),
      FOREIGN KEY (courseNumID) REFERENCES Courses(courseNumID),
      FOREIGN KEY (userNumID) REFERENCES Users(userNumID)
      );
    `);
    console.log('Table members created successfully');
  } catch (err) {
    console.error(`Create table members error: ${err}`);
    process.exit(1);
  }
};

export const createTableMaterials = async () => {
  try {
    await basicQuery(`CREATE TABLE IF NOT EXISTS materials (
      materialID INT PRIMARY KEY AUTO_INCREMENT,
      name VARCHAR(255),
      path VARCHAR(255),
      pathName VARCHAR(255)
      );
    `);
    console.log('Table materials created successfully');
  } catch (err) {
    console.error(`Create table materials error: ${err}`);
    process.exit(1);
  }
};

export const createTableCourseMaterials = async () => {
  try {
    await basicQuery(`CREATE TABLE IF NOT EXISTS coursematerials (
      courseNumID INT,
      materialID INT,
      PRIMARY KEY (courseNumID, materialID),
      FOREIGN KEY (courseNumID) REFERENCES Courses(courseNumID),
      FOREIGN KEY (materialID) REFERENCES Materials(materialID)
      );
    `);
    console.log('Table coursematerials created successfully');
  } catch (err) {
    console.error(`Create table coursematerials error: ${err}`);
    process.exit(1);
  }
};

export const createTableHours = async () => {
  try {
    await basicQuery(`CREATE TABLE IF NOT EXISTS hours (
      timeID INT PRIMARY KEY AUTO_INCREMENT,
      repr VARCHAR(127)
      );
    `);
    console.log('Table hours created successfully');
  } catch (err) {
    console.error(`Create table hours error: ${err}`);
    process.exit(1);
  }
};

export const populateTableHours = async () => {
  try {
    await basicQuery(`INSERT INTO hours (repr) VALUES
      ('08:00-10:00'),
      ('10:00-12:00'),
      ('12:00-14:00'),
      ('14:00-16:00'),
      ('16:00-18:00'),
      ('18:00-20:00')
    `);
    console.log('Table hours populated successfully');
  } catch (err) {
    console.error(`Populate table hours error: ${err}`);
    process.exit(1);
  }
};

export const createTableDays = async () => {
  try {
    await basicQuery(`CREATE TABLE IF NOT EXISTS days (
      dayID INT PRIMARY KEY AUTO_INCREMENT,
      name VARCHAR(127)
      );
    `);
    console.log('Table days created successfully');
  } catch (err) {
    console.error(`Create table days error: ${err}`);
    process.exit(1);
  }
};

export const populateTableDays = async () => {
  try {
    await basicQuery(`INSERT INTO days (name) VALUES
      ('Monday'),
      ('Tuesday'),
      ('Wednesday'),
      ('Thursday'),
      ('Friday'),
      ('Saturday'),
      ('Sunday')
    `);
    console.log('Table days populated successfully');
  } catch (err) {
    console.error(`Populate table days error: ${err}`);
    process.exit(1);
  }
};

export const createTableCalendar = async () => {
  try {
    await basicQuery(`CREATE TABLE IF NOT EXISTS calendar (
      calendarID INT PRIMARY KEY AUTO_INCREMENT,
      courseNumID INT,
      dayID INT,
      timeID INT,
      FOREIGN KEY (courseNumID) REFERENCES Courses(courseNumID),
      FOREIGN KEY (timeID) REFERENCES hours(timeID),
      FOREIGN KEY (dayID) REFERENCES days(dayID)
      );
    `);
    console.log('Table calendar created successfully');
  } catch (err) {
    console.error(`Create table calendar error: ${err}`);
    process.exit(1);
  }
};

export const createTableSuggestions = async () => {
  try {
    await basicQuery(`CREATE TABLE IF NOT EXISTS suggestions (
      suggestionID INT PRIMARY KEY AUTO_INCREMENT,
      courseNumID INT,
      dayID INT,
      timeID INT,
      isInsert INT,
      userNumID INT,
      FOREIGN KEY (userNumID) REFERENCES users(userNumID),
      FOREIGN KEY (courseNumID) REFERENCES Courses(courseNumID),
      FOREIGN KEY (timeID) REFERENCES hours(timeID),
      FOREIGN KEY (dayID) REFERENCES days(dayID)
      );
    `);
    console.log('Table suggestions created successfully');
  } catch (err) {
    console.error(`Create table suggestions error: ${err}`);
    process.exit(1);
  }
};

export const getCourses = () => {
  const query = 'SELECT * FROM courses';
  return basicQuery(query);
};

export const getUserCourses = (params) => {
  const query = `select courses.courseNumID, courseID, name, class, lecture, seminar, lab, courses.userNumID, color from courses join members
  on courses.courseNumID = members.courseNumID where members.userNumID = ?`;
  return basicQuery(query, [params]);
};

export const getDays = () => {
  const query = 'SELECT * FROM days';
  return basicQuery(query);
};

export const getHours = () => {
  const query = 'SELECT * FROM hours';
  return basicQuery(query);
};

export const getCourse = (params) => {
  const query = 'SELECT * FROM courses WHERE courseID = ?';
  return basicQuery(query, [params]).then((course) => course[0]);
};

export const getCourseByNumID = (params) => {
  const query = 'SELECT * FROM courses WHERE courseNumID = ?';
  return basicQuery(query, [params]).then((course) => course[0]);
};

export const getUsers = () => {
  const query = 'SELECT userNumID userID, firstName, lastName, username, userType, allowed FROM users';
  return basicQuery(query);
};

export const getUserByNumID = (params) => {
  const query = 'SELECT userNumID userID, firstName, lastName, username, userType, allowed FROM users WHERE userNumID = ?';
  return basicQuery(query, [params]).then((user) => user[0]);
};

export const insertCourse = (params) => {
  const query = `INSERT INTO courses (courseID, name, class, lecture, seminar, lab, userNumID, color)
  VALUES (?,?,?,?,?,?,?,?);`;
  return basicQuery(query, [
    params.courseID,
    params.name,
    params.year,
    params.lecture,
    params.seminar,
    params.lab,
    params.userNumID,
    params.color,
  ]);
};

export const insertUser = (params) => {
  const query = `INSERT INTO users (userID, firstName, lastName, username, password, userType, allowed)
  VALUES (?,?,?,?,?,?,?);`;
  return basicQuery(query, [
    params.userID,
    params.firstName,
    params.lastName,
    params.username,
    params.password,
    params.userType,
    params.allowed,
  ]);
};

export const insertCalendar = (params) => {
  const query = `INSERT INTO calendar (courseNumID, dayID, timeID)
  VALUES (?,?,?);`;
  return basicQuery(query, [params.courseNumID, params.dayID, params.timeID]);
};

export const findCalendarElement = (params) => {
  const query =    'SELECT calendarID FROM calendar WHERE dayID = ? AND timeID = ?';
  return basicQuery(query, [params.dayID, params.timeID]).then(
    (calendar) => calendar[0],
  );
};

export const getCalendarCourseNumID = (params) => {
  const query =    'SELECT courseNumID FROM calendar WHERE dayID = ? AND timeID = ?';
  return basicQuery(query, [params.dayID, params.timeID]).then(
    (calendar) => calendar[0],
  );
};

export const getCalendar = () => {
  const query =    'SELECT courses.name, courses.color, dayID, timeID FROM calendar join courses on calendar.courseNumID = courses.courseNumID';
  return basicQuery(query);
};

export const getUserCalendar = (params) => {
  const query = `SELECT courses.name, courses.color, dayID, timeID FROM calendar join courses on calendar.courseNumID = courses.courseNumID
  join members on members.courseNumID = calendar.courseNumID where members.userNumID = ?`;
  return basicQuery(query, [params]);
};

export const findCourseById = (params) => {
  const query = 'SELECT courseID FROM courses WHERE courseID = ?';
  return basicQuery(query, [params]);
};

export const findCourseByNumId = (params) => {
  const query = 'SELECT courseID FROM courses WHERE courseNumID = ?';
  return basicQuery(query, [params]);
};

export const findHourByID = (params) => {
  const query = 'SELECT timeID FROM hours WHERE timeID = ?';
  return basicQuery(query, [params]);
};

export const findDayByID = (params) => {
  const query = 'SELECT dayID FROM days WHERE dayID = ?';
  return basicQuery(query, [params]);
};

export const findUserById = (params) => {
  const query = 'SELECT userID FROM users WHERE userID = ?';
  return basicQuery(query, [params]);
};

export const findUserByUsername = (params) => {
  const query = 'SELECT username FROM users WHERE username = ?';
  return basicQuery(query, [params]);
};

export const findUserByNumID = (params) => {
  const query = 'SELECT userNumID FROM users WHERE userNumID = ?';
  return basicQuery(query, [params]);
};

export const findUserMember = (params) => {
  const query =    'SELECT userNumID FROM members WHERE courseNumID = ? AND userNumID = ?';
  return basicQuery(query, [params.course, params.user]);
};

export const insertUserMember = (params) => {
  const query = 'INSERT INTO members VALUES (?, ?);';
  return basicQuery(query, [params.course, params.user]);
};

export const deleteUserMember = (params) => {
  const query = 'DELETE FROM members WHERE courseNumID = ? AND userNumID = ?';
  return basicQuery(query, [params.course, params.user]);
};

export const deleteUserMemberAll = (params) => {
  const query = 'DELETE FROM members WHERE userNumID = ?';
  return basicQuery(query, [params]);
};

export const deleteUser = (params) => {
  const query = 'DELETE FROM users WHERE userNumID = ?';
  return basicQuery(query, [params]);
};

export const setUserBlocked = (params) => {
  const query = 'UPDATE users SET allowed = 0 WHERE userNumID = ?';
  return basicQuery(query, [params]);
};

export const setUserAllowed = (params) => {
  const query = 'UPDATE users SET allowed = 1 WHERE userNumID = ?';
  return basicQuery(query, [params]);
};

export const getMaterials = (params) => {
  const query = `SELECT materials.materialID, materials.name, materials.path, materials.pathName from materials
  join coursematerials on materials.materialID = coursematerials.materialID where courseNumID = ?`;
  return basicQuery(query, [params]);
};

export const getMaterialNames = (params) => {
  const query = `SELECT materials.materialID, materials.name from materials
  join coursematerials on materials.materialID = coursematerials.materialID where courseNumID = ?`;
  return basicQuery(query, [params]);
};

export const deleteMaterial = (params) => {
  const query = 'DELETE FROM materials WHERE materialID = ?';
  return basicQuery(query, [params]);
};

export const deleteCourseMaterial = (params) => {
  const query = 'DELETE FROM coursematerials WHERE materialID = ?';
  return basicQuery(query, [params]);
};

export const deleteCourseMaterialByCourse = (params) => {
  const query = 'DELETE FROM coursematerials WHERE courseNumID = ?';
  return basicQuery(query, [params]);
};

export const deleteCourseMember = (params) => {
  const query = 'DELETE FROM members WHERE courseNumID = ?';
  return basicQuery(query, [params]);
};

export const deleteCourseCalendar = (params) => {
  const query = 'DELETE FROM calendar WHERE courseNumID = ?';
  return basicQuery(query, [params]);
};

export const deleteCourse = (params) => {
  const query = 'DELETE FROM courses WHERE courseNumID = ?';
  return basicQuery(query, [params]);
};

export const getMaterial = (params) => {
  const query = 'SELECT * FROM materials WHERE materialID = ?';
  return basicQuery(query, [params]).then((material) => material[0]);
};

export const insertMaterial = (params) => {
  const query = 'INSERT INTO materials (name, path, pathName) VALUES (?,?,?);';
  return basicQuery(query, [params.name, params.path, params.pathName]);
};

export const insertCourseMaterial = (params) => {
  const query = 'INSERT INTO coursematerials VALUES (?,?);';
  return basicQuery(query, [params.courseNumID, params.materialID]);
};

export const getUserByUserName = (params) => {
  const query = 'SELECT * FROM users WHERE username = ?';
  return basicQuery(query, [params]).then((user) => user[0]);
};

export const getUserMembers = () => {
  const query =    'SELECT members.userNumID, courses.name, courses.color from members JOIN courses ON members.courseNumID = courses.courseNumID';
  return basicQuery(query);
};

export const getMembers = () => {
  const query = 'SELECT * from members';
  return basicQuery(query);
};

export const insertSuggestion = (params) => {
  const query = `INSERT INTO suggestions (courseNumID, dayID, timeID, isInsert, userNumID) VALUES
  (?,?,?,?,?);`;
  return basicQuery(query, [
    params.courseNumID,
    params.dayID,
    params.timeID,
    params.isInsert,
    params.userNumID,
  ]);
};

export const getSuggestions = () => {
  const query = `select suggestions.suggestionID, courses.name as coursename, days.name as dayname, hours.repr as hourname, isInsert, suggestions.userNumID
  from suggestions join courses on suggestions.courseNumID = courses.courseNumID
  join days on days.dayID = suggestions.dayID join hours on suggestions.timeID = hours.timeID`;
  return basicQuery(query);
};

export const deleteSuggestion = (params) => {
  const query = 'DELETE FROM suggestions WHERE suggestionID = ?';
  return basicQuery(query, [params]);
};

export const deleteSuggestionByUser = (params) => {
  const query = 'DELETE FROM suggestions WHERE userNumID = ?';
  return basicQuery(query, [params]);
};

export const getSuggestionByID = (params) => {
  const query = 'SELECT * FROM suggestions WHERE suggestionID = ?';
  return basicQuery(query, [params]).then((suggestions) => suggestions[0]);
};

export const deleteCalendarElement = (params) => {
  const query = 'DELETE FROM calendar WHERE calendarID = ?';
  return basicQuery(query, [params]);
};

export const getUserSuggestions = (params) => {
  const query = `select suggestions.suggestionID, courses.name as coursename, days.name as dayname, hours.repr as hourname, isInsert, suggestions.userNumID
  from suggestions join courses on suggestions.courseNumID = courses.courseNumID
  join days on days.dayID = suggestions.dayID join hours on suggestions.timeID = hours.timeID where suggestions.userNumID = ?`;
  return basicQuery(query, [params]);
};
