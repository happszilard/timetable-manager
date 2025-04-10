// eslint-disable-next-line no-unused-vars
async function deleteMaterial(event, materialID) {
  const response = await fetch(`/api/deleteMaterial/${materialID}`, {
    method: 'DELETE',
  });

  // delete a material
  if (response.status === 204) {
    // successful deletion
    const parent = event.target.parentNode;
    parent.remove();

    // success message
    const sucessDiv = document.createElement('div');
    sucessDiv.setAttribute('class', 'success');
    sucessDiv.innerText = 'File deleted successfully';
    const main = document.getElementById('main');
    main.appendChild(sucessDiv);
  } else {
    // unsuccessful deletion - error message
    const errorDiv = document.createElement('div');
    errorDiv.setAttribute('class', 'error');
    const main = document.getElementById('main');
    if (response.status === 404) {
      errorDiv.innerText = 'File deletion was unsuccessful!';
    } else {
      const body = await response.json();
      errorDiv.innerText = body.message;
    }
    main.appendChild(errorDiv);
  }
}
