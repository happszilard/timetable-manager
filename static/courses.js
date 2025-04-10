// eslint-disable-next-line no-unused-vars
async function loadMaterials(courseID) {
  const response = await fetch(`/api/getMaterials/${courseID}`);
  const body = await response.json();
  if (response.status === 200) {
    const courseList = document.querySelectorAll('.wrapper');
    // iterate through courses in index.ejs
    courseList.forEach((course) => {
      const materialDiv = course.lastElementChild;
      const materialDivId = materialDiv.getAttribute('id');
      // course which was selected
      if (materialDivId === `materialID${courseID}`) {
        materialDiv.innerText = '';
        if (body.material.length === 0) {
          const noMaterialDiv = document.createElement('div');
          noMaterialDiv.innerText = 'There are no materials';
          noMaterialDiv.setAttribute('class', 'material');
          materialDiv.appendChild(noMaterialDiv);
        } else {
          // load the materials
          body.material.forEach((material) => {
            const newMaterial = document.createElement('a');
            const { materialID } = material;
            newMaterial.setAttribute('href', `/course_details/download/${materialID}`);
            newMaterial.setAttribute('class', 'material');
            newMaterial.innerText = material.name;
            materialDiv.appendChild(newMaterial);
          });
        }
      } else {
        materialDiv.innerText = '';
      }
    });
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
