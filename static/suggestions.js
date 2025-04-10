// eslint-disable-next-line no-unused-vars
async function deleteSuggestion(event, suggestionID) {
  const response = await fetch(`/api/rejectSuggestion/${suggestionID}`, {
    method: 'DELETE',
  });

  if (response.status === 204) {
    // successful deletion
    const parent = event.target.parentNode;
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
    // unsuccessful deletion - error message
    let checkIfErrorDivExists = document.getElementsByClassName('error')[0];
    if (!checkIfErrorDivExists) {
      checkIfErrorDivExists = document.createElement('div');
      checkIfErrorDivExists.setAttribute('class', 'error');
    }
    const main = document.getElementById('main');
    if (response.status === 404) {
      checkIfErrorDivExists.innerText = 'Couldn\'t delete the suggestion';
    } else {
      const body = await response.json();
      checkIfErrorDivExists.innerText = body.message;
    }
    main.appendChild(checkIfErrorDivExists);
  }
}
