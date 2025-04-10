// eslint-disable-next-line no-unused-vars
async function editButtons() {
  // set the right button for attaching the users to the courses
  const userNumID = document.getElementById('userselect').value;
  const courseNumID = document.getElementById('courseselect').value;
  const response = await fetch(`/api/checkMember/${userNumID}/${courseNumID}`);
  const body = await response.json();
  if (response.status === 200) {
    // if left, cannot leave again
    if (body.joined === 0) {
      document.getElementById('join').checked = true;
      document.getElementById('leavediv').style.display = 'none';
      document.getElementById('joindiv').style.display = 'block';
    } else {
      // if joined, cannot join again
      document.getElementById('leave').checked = true;
      document.getElementById('joindiv').style.display = 'none';
      document.getElementById('leavediv').style.display = 'block';
    }
  } else {
    // error message
    const checkIfErrorDivExists = document.getElementsByClassName('error')[0];
    if (!checkIfErrorDivExists) {
      const errorDiv = document.createElement('div');
      errorDiv.setAttribute('class', 'error');
      errorDiv.innerText = body.message;
      const main = document.getElementById('main');
      main.appendChild(errorDiv);
    } else {
      checkIfErrorDivExists.innerText = body.message;
    }
  }
}

// eslint-disable-next-line no-unused-vars
async function allowUser(userNumID) {
  // allow the user to log in
  const response = await fetch(`/api/allowUser/${userNumID}`, {
    method: 'PUT',
  });

  if (response.status === 204) {
    // cannot allow again, sho just the block button
    document.getElementById(`allowbtn${userNumID}`).style.display = 'none';
    document.getElementById(`blockbtn${userNumID}`).style.display = 'block';

    // success message
    const checkIfSuccessDivExists = document.getElementsByClassName('success')[0];
    if (!checkIfSuccessDivExists) {
      const sucessDiv = document.createElement('div');
      sucessDiv.setAttribute('class', 'success');
      sucessDiv.innerText = 'Success!';
      const main = document.getElementById('main');
      main.appendChild(sucessDiv);
    } else {
      checkIfSuccessDivExists.innerText = 'Success!';
    }
  } else if (response.status === 404) {
    // error message
    const checkIfErrorDivExists = document.getElementsByClassName('error')[0];
    if (!checkIfErrorDivExists) {
      const errorDiv = document.createElement('div');
      errorDiv.setAttribute('class', 'error');
      errorDiv.innerText = 'Couldn\'t allow user!';
      const main = document.getElementById('main');
      main.appendChild(errorDiv);
    } else {
      checkIfErrorDivExists.innerText = 'Couldn\'t allow user!';
    }
  } else {
    const body = await response.json();
    const checkIfErrorDivExists = document.getElementsByClassName('error')[0];
    if (!checkIfErrorDivExists) {
      const errorDiv = document.createElement('div');
      errorDiv.setAttribute('class', 'error');
      errorDiv.innerText = body.message;
      const main = document.getElementById('main');
      main.appendChild(errorDiv);
    } else {
      checkIfErrorDivExists.innerText = body.message;
    }
  }
}

// eslint-disable-next-line no-unused-vars
async function blockUser(userNumID) {
  // block the user from loging in
  const response = await fetch(`/api/blockUser/${userNumID}`, {
    method: 'PUT',
  });

  if (response.status === 204) {
    // if blocked, cannot block again
    document.getElementById(`allowbtn${userNumID}`).style.display = 'block';
    document.getElementById(`blockbtn${userNumID}`).style.display = 'none';

    // success message
    const checkIfSuccessDivExists = document.getElementsByClassName('success')[0];
    if (!checkIfSuccessDivExists) {
      const sucessDiv = document.createElement('div');
      sucessDiv.setAttribute('class', 'success');
      sucessDiv.innerText = 'Success!';
      const main = document.getElementById('main');
      main.appendChild(sucessDiv);
    } else {
      checkIfSuccessDivExists.innerText = 'Success!';
    }
  } else {
    // error message
    let checkIfErrorDivExists = document.getElementsByClassName('error')[0];
    if (!checkIfErrorDivExists) {
      checkIfErrorDivExists = document.createElement('div');
      checkIfErrorDivExists.setAttribute('class', 'error');
    }
    const main = document.getElementById('main');
    if (response.status === 404) {
      checkIfErrorDivExists.innerText = 'Couldn\'t block user';
    } else {
      const body = await response.json();
      checkIfErrorDivExists.innerText = body.message;
    }
    main.appendChild(checkIfErrorDivExists);
  }
}

// eslint-disable-next-line no-unused-vars
async function deleteUser(event, userNumID) {
  const response = await fetch(`/api/deleteUser/${userNumID}`, {
    method: 'DELETE',
  });

  if (response.status === 204) {
    const parent = event.target.parentNode.parentNode.parentNode;
    parent.remove();

    const checkIfSuccessDivExists = document.getElementsByClassName('success')[0];
    if (!checkIfSuccessDivExists) {
      const sucessDiv = document.createElement('div');
      sucessDiv.setAttribute('class', 'success');
      sucessDiv.innerText = 'Success!';
      const main = document.getElementById('main');
      main.appendChild(sucessDiv);
    } else {
      checkIfSuccessDivExists.innerText = 'Success!';
    }
  } else {
    // error message
    let checkIfErrorDivExists = document.getElementsByClassName('error')[0];
    if (!checkIfErrorDivExists) {
      checkIfErrorDivExists = document.createElement('div');
      checkIfErrorDivExists.setAttribute('class', 'error');
    }
    const main = document.getElementById('main');
    if (response.status === 404) {
      checkIfErrorDivExists.innerText = 'Couldn\'t delete user';
    } else {
      const body = await response.json();
      checkIfErrorDivExists.innerText = body.message;
    }
    main.appendChild(checkIfErrorDivExists);
  }
}

// eslint-disable-next-line no-unused-vars
async function acceptSuggestion(event, suggestionID) {
  // accept suggestion from user, apply
  const response = await fetch(`/api/acceptSuggestion/${suggestionID}`, {
    method: 'DELETE',
  });

  if (response.status === 204) {
    const parent = event.target.parentNode.parentNode;
    parent.remove();

    // success message
    const checkIfSuccessDivExists = document.getElementsByClassName('success')[0];
    if (!checkIfSuccessDivExists) {
      const sucessDiv = document.createElement('div');
      sucessDiv.setAttribute('class', 'success');
      sucessDiv.innerText = 'Success!';
      const main = document.getElementById('main');
      main.appendChild(sucessDiv);
    } else {
      checkIfSuccessDivExists.innerText = 'Success!';
    }
  } else {
    // error message
    let checkIfErrorDivExists = document.getElementsByClassName('error')[0];
    if (!checkIfErrorDivExists) {
      checkIfErrorDivExists = document.createElement('div');
      checkIfErrorDivExists.setAttribute('class', 'error');
    }
    const main = document.getElementById('main');
    if (response.status === 404) {
      checkIfErrorDivExists.innerText = 'Couldn\'t accept the suggestion!';
    } else if (response.status === 409) {
      checkIfErrorDivExists.innerText = 'Couldn\'t accept the suggestion! Out of date suggestion';
    } else {
      const body = await response.json();
      checkIfErrorDivExists.innerText = body.message;
    }
    main.appendChild(checkIfErrorDivExists);
  }
}

// eslint-disable-next-line no-unused-vars
async function rejectSuggestion(event, suggestionID) {
  // reject suggestion rfom user
  const response = await fetch(`/api/rejectSuggestion/${suggestionID}`, {
    method: 'DELETE',
  });

  if (response.status === 204) {
    const parent = event.target.parentNode.parentNode;
    parent.remove();

    // success message
    const checkIfSuccessDivExists = document.getElementsByClassName('success')[0];
    if (!checkIfSuccessDivExists) {
      const sucessDiv = document.createElement('div');
      sucessDiv.setAttribute('class', 'success');
      sucessDiv.innerText = 'Success!';
      const main = document.getElementById('main');
      main.appendChild(sucessDiv);
    } else {
      checkIfSuccessDivExists.innerText = 'Success!';
    }
  } else {
    // error message
    let checkIfErrorDivExists = document.getElementsByClassName('error')[0];
    if (!checkIfErrorDivExists) {
      checkIfErrorDivExists = document.createElement('div');
      checkIfErrorDivExists.setAttribute('class', 'error');
    }
    const main = document.getElementById('main');
    if (response.status === 404) {
      checkIfErrorDivExists.innerText = 'Couldn\'t reject the suggestion';
    } else {
      const body = await response.json();
      checkIfErrorDivExists.innerText = body.message;
    }
    main.appendChild(checkIfErrorDivExists);
  }
}

document.body.onload = () => {
  const courseselect = document.getElementById('courseselect');
  const userselect = document.getElementById('userselect');
  if (courseselect && userselect) {
    document.getElementById('radiodiv').style.display = 'block';
    courseselect.dispatchEvent(new Event('change'));
    userselect.dispatchEvent(new Event('change'));
  } else {
    document.getElementById('radiodiv').style.display = 'none';
  }
};
