const handShapes = Array.from(document.getElementsByClassName('hand-shape'));
const cards = ['./rock.png', './paper.png', './scissors.png'];
const hands = ['rock', 'paper', 'scissors'];

function lastMod() {
  const modDate = document.lastModified;
  document.getElementById('modified').innerText = modDate;
  document.getElementById('modified').style.textAlign = 'center';
}

function setPlayerInfo() {
  document.getElementById('player-name').innerText = document.getElementById('name').value;
  document.getElementById('player-nickname').innerText = document.getElementById('nickname').value;
  document.getElementById('player-money').innerText = document.getElementById('money').value;
  const robotMoney = Math.floor(Math.random() * (101 - 1) + 1);
  document.getElementById('robot-money').innerText = robotMoney;
}

function checkValid() {
  let error = 0;
  if (!document.getElementById('name').validity.valid) {
    error = 1;
    document.getElementById('checknm').innerText = 'Invalid';
    document.getElementById('checknm').style.color = 'red';
  } else {
    document.getElementById('checknm').innerHTML = '&#10004';
    document.getElementById('checknm').style.color = 'green';
  }

  if (!document.getElementById('birthday').validity.valid) {
    error = 1;
  }

  if (!document.getElementById('nickname').validity.valid) {
    error = 1;
  }

  const email = document.getElementById('email');
  const ptemail = /^.*@(yahoo|gmail)\..+$/;
  const check = email.value.match(ptemail);
  if (check) {
    document.getElementById('checkem').innerHTML = '&#10004';
    document.getElementById('checkem').style.color = 'green';
  } else {
    document.getElementById('checkem').innerText = 'Invalid';
    document.getElementById('checkem').style.color = 'red';
    error = 1;
  }

  const url = document.getElementById('webpage');
  const ptweb = /^https?:\/\/[A-Za-z0-9-_]+\.[A-Za-z0-9-_]+[[A-Za-z0-9-_.]*\/*[A-Za-z0-9-_/.]*$/;
  const check1 = url.value.match(ptweb);
  if (check1) {
    document.getElementById('checkweb').innerHTML = '&#10004';
    document.getElementById('checkweb').style.color = 'green';
  } else {
    document.getElementById('checkweb').innerText = 'Invalid';
    document.getElementById('checkweb').style.color = 'red';
    error = 1;
  }

  if (error === 1) {
    document.getElementById('submitButton').style.display = 'none';
  } else {
    document.getElementById('submitButton').style.display = 'initial';
  }
  lastMod();
}

function hideGame() {
  document.getElementById('game').style.display = 'none';
}

function showGame() {
  document.getElementById('game').style.display = 'block';
}

function hideForm() {
  document.getElementById('form').style.display = 'none';
  document.getElementById('footer').style.display = 'none';
}

function showForm() {
  document.getElementById('form').style.display = 'block';
  document.getElementById('footer').style.display = 'block';
}

function submitClicked(event) {
  event.preventDefault();
  setPlayerInfo();
  hideForm();
  showGame();
}

function playerWon(current, robotCurrent) {
  if (current === robotCurrent) {
    return 0;
  }

  if (current === 'rock') {
    if (robotCurrent === 'paper') {
      return -1;
    }
    return 1;
  }

  if (current === 'paper') {
    if (robotCurrent === 'rock') {
      return 1;
    }
    return -1;
  }

  if (current === 'scissors') {
    if (robotCurrent === 'rock') {
      return -1;
    }
    return 1;
  }

  return 1;
}

function cardClicked(event) {
  const x = 1;
  const current = event.target.getAttribute('id');
  const currentTarget = event.target;
  currentTarget.disabled = 'true';

  handShapes.forEach((button) => {
    const currentButton = button;
    if (current !== currentButton.getAttribute('id')) {
      currentButton.style.visibility = 'hidden';
    }
  });

  const robotCard = Math.floor(Math.random() * 3);
  const robotCurrent = hands[robotCard];
  document.getElementById('robot-image').setAttribute('src', cards[robotCard]);
  const winner = playerWon(current, robotCurrent);

  let money = parseInt(document.getElementById('player-money').innerText, 10);
  let robotMoney = parseInt(document.getElementById('robot-money').innerText, 10);

  if (winner === 1) {
    money += x;
    robotMoney -= x;
    document.getElementById('who-wins').innerText = 'Player wins';
    document.getElementById('who-wins').style.color = 'white';
  } else if (winner === 0) {
    document.getElementById('who-wins').innerText = 'Draw';
    document.getElementById('who-wins').style.color = 'black';
  } else {
    money -= x;
    robotMoney += x;
    document.getElementById('who-wins').innerText = 'Robot wins';
    document.getElementById('who-wins').style.color = 'Red';
  }

  document.getElementById('player-money').innerText = money;
  document.getElementById('robot-money').innerText = robotMoney;

  if (money <= 0 || robotMoney <= 0) {
    document.getElementById('game-over').innerText = 'Game Over';
    document.getElementById('game-over').style.fontWeight = 'bold';
    document.getElementById('game-over').style.fontSize = '20px';
  } else {
    document.getElementById('continue').style.display = 'initial';
  }
}

function continueClicked() {
  handShapes.forEach((button) => {
    const currentButton = button;
    currentButton.style.visibility = 'visible';
    currentButton.disabled = false;
  });
  document.getElementById('continue').style.display = 'none';
  document.getElementById('who-wins').innerText = '';
  document.getElementById('robot-image').setAttribute('src', './hidden.png');
}

document.body.onload = () => {
  const formElements = Array.from(document.getElementsByClassName('form-element'));
  formElements.forEach((element) => {
    element.addEventListener('blur', checkValid);
  });
  document.getElementById('submitButton').addEventListener('click', submitClicked);
  handShapes.forEach((button) => {
    button.addEventListener('click', cardClicked);
  });

  document.getElementById('continue').style.display = 'none';
  document.getElementById('continue').addEventListener('click', continueClicked);
  hideGame();
  showForm();
  checkValid();
};
