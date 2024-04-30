import { 
    initializeApp
    } from 'firebase/app';
  
  import { 
    getFirestore, 
    collection, 
    onSnapshot,
    getDocs,
    addDoc,
    deleteDoc,
    updateDoc,
    doc,
    query,
    where,
    orderBy,
    serverTimestamp,
    snapshotEqual,
    QueryStartAtConstraint
    } from 'firebase/firestore';
  
  import { 
    getAuth,
    createUserWithEmailAndPassword,
    signOut,
    signInWithEmailAndPassword,
    onAuthStateChanged,
    GoogleAuthProvider,
    signInWithPopup
    } from 'firebase/auth';
  
  const firebaseConfig = {
    apiKey: "AIzaSyA3Yyk4IFO2-h7fGTfXYxE8fyNeOhKjUeI",
    authDomain: "nutrition-tracking-app-26132.firebaseapp.com",
    projectId: "nutrition-tracking-app-26132",
    storageBucket: "nutrition-tracking-app-26132.appspot.com",
    messagingSenderId: "844911303258",
    appId: "1:844911303258:web:b6e65fa6b2f64cd8a69663"
  };
  
  import {
  } from './dashboard.js'
  
  // init firebase app
  initializeApp(firebaseConfig);
  
  // init services
  const db = getFirestore();
  const auth = getAuth();

//Querying Dates/Times
let pullOpenDate = new Date();
pullOpenDate.setHours(0);
pullOpenDate.setMinutes(0);
pullOpenDate.setSeconds(0);
pullOpenDate.setMilliseconds(0);

let pullCloseDate = new Date();
pullCloseDate.setDate(pullCloseDate.getDate() + 1);
pullCloseDate.setHours(0);
pullCloseDate.setMinutes(0);
pullCloseDate.setSeconds(0);
pullCloseDate.setMilliseconds(0);

function addTimeToPullDate(){
  const newDate = new Date();

const newHours = newDate.getHours();
const newMinutes = newDate.getMinutes();
const newSeconds = newDate.getSeconds();
const newMilliseconds = newDate.getMilliseconds();

pullOpenDate.setHours(newHours);
pullOpenDate.setMinutes(newMinutes);
pullOpenDate.setSeconds(newSeconds);
pullOpenDate.setMilliseconds(newMilliseconds);

}

function zeroPullDate(){
  pullOpenDate.setHours(0);
  pullOpenDate.setMinutes(0);
  pullOpenDate.setSeconds(0);
  pullOpenDate.setMilliseconds(0);
}

// -----------------------------------------------------------------------------
// collection ref
const heightCol = collection(db, 'Height');
const weightCol = collection(db, 'Weight');
const foodCol = collection(db, 'Foods');
const entryCol = collection(db, 'Food_Entry');
const exerciseCol = collection(db, 'exercise');
const notesCol = collection(db, 'Notes');

// POP UPS ---------------------------------------------------------------------
//FOOD
let addFoodButton = document.querySelector('#food_image')
if(addFoodButton){
  addFoodButton.addEventListener('click', () => {
    let windowSelection = '.food_popup'
    popupWindow(windowSelection);
  })
}

//EXERCISE
let addExerciseButton = document.querySelector('#exercise_image')
if(addExerciseButton){
  addExerciseButton.addEventListener('click', () => {
    let windowSelection = '.exercise_popup'
    popupWindow(windowSelection);
  })
}

//BIOMETRICS
let addBioButton = document.querySelector('#biometric_image')
if(addBioButton){
  addBioButton.addEventListener('click', () => {
    let windowSelection = '.biometric_popup'
    popupWindow(windowSelection);
  })
}

//NOTES
let addNotesButton = document.querySelector('#notes_image')
if(addNotesButton){
  addNotesButton.addEventListener('click', () => {
    let windowSelection = '.notes_popup'
    popupWindow(windowSelection);
  })
}
function popupWindow(windowSelection) {
  event.stopPropagation();
    let blur = document.querySelector('.dash');
    blur.classList.toggle('blur_active')
    let popup = document.querySelector(windowSelection);
    popup.classList.toggle('popup_active')
}

//DISMISS POPUPS
document.addEventListener('click', function(event) {
  let popupActive = document.querySelectorAll('.popup_active')
  if(popupActive === null || popupActive.length === 0) {
    // No active popups
} else {
    dismissPopup(event);
}
});

function dismissPopup(event) {
  let popup = document.querySelector('.popup_active');
  let isClickInside = popup.contains(event.target);
  let blur = document.querySelector('.dash');

  if (!isClickInside && popup.classList.contains('popup_active')) {
    popup.classList.remove('popup_active');
    blur.classList.remove('blur_active');
  }
}
//FOOD 
function generateTableHTML(data) {
  let html = '<table class="results_table">';
  // Table header
  html += '<thead class="results_thead"><tr class="results_tr"><th class="results_th">Name</th><th class="results_th">Calories</th></tr></thead>';
  // Table body
  html += '<tbody class="results_tbody">';
  data.forEach((item, index) => {
    html += `<tr class="results_tr" id="row-${index}"><td class="results_td">${item.name}</td><td class="results_td">${item.calories}</td></tr>`;
  });
  html += '</tbody></table>';
  return html;
}

function addRowClickEventListeners(data) {
  data.forEach((item, index) => {
    const row = document.getElementById(`row-${index}`);
    if (row) {
      row.addEventListener('click', () => {
        let highlight = document.querySelectorAll('.highlighted')
        highlight.forEach(function(highlight) {
          highlight.classList.remove('highlighted');
        });
        row.classList.add('highlighted')

        let protienPS = item.protein;
        let carbsPS = item.carbs;
        let fatsPS = item.fats;
        let caloriesPS = item.calories;
        let serving = item.serving_size;

        updateNutritionalValues(protienPS, carbsPS, fatsPS, caloriesPS, serving, serving);

        let servingsInput = document.querySelector('.food_selection_servings_input');
        if (servingsInput) {
          servingsInput.addEventListener('input', () => {
            let amount = servingsInput.value || serving;
            updateNutritionalValues(protienPS, carbsPS, fatsPS, caloriesPS, serving, amount);
          });
        }

        let foodConfirm = document.querySelector('.food_selection_form')
        foodConfirm.addEventListener('submit', (e) => {
          e.preventDefault()
          e.stopPropagation()

          addTimeToPullDate()

          let amount = servingsInput.value || serving;
          addDoc(entryCol, {
            fid: item.fid,
            servings: amount,
            datetime: pullOpenDate,
            uid: auth.currentUser.uid
          })
          .then(() =>{
            foodConfirm.reset();
            clearFoodPopup();
            zeroPullDate();
            item = "";
            let popup = document.querySelector('.popup_active');
            let blur = document.querySelector('.dash');

            popup.classList.remove('popup_active');
            blur.classList.remove('blur_active');   
          })
        });
      });
    }
  });
}

function updateNutritionalValues(protienPS, carbsPS, fatsPS, caloriesPS, serving, amount) {
  let multiplier = amount / serving;
  document.querySelector('.food_selection_protien').textContent = (protienPS * multiplier).toFixed(2) + 'p';
  document.querySelector('.food_selection_carbs').textContent = (carbsPS * multiplier).toFixed(2) + 'c';
  document.querySelector('.food_selection_fats').textContent = (fatsPS * multiplier).toFixed(2) + 'f';
  document.querySelector('.food_selection_calories').textContent = (caloriesPS * multiplier).toFixed(2) + 'kCal';
}
function clearFoodPopup(){
  let foodResults = document.querySelector('.food_results')
  foodResults.innerHTML = ""
  document.querySelector('.food_selection_protien').textContent = "";
  document.querySelector('.food_selection_carbs').textContent = "";
  document.querySelector('.food_selection_fats').textContent = "";
  document.querySelector('.food_selection_calories').textContent = "";
}

const foodSearch = document.querySelector('.food_search')
if(foodSearch){
  foodSearch.addEventListener('submit', (e) => {
    e.preventDefault();
    e.stopPropagation();
    const searchTerm = foodSearch.foodSearchInput.value.trim()
    foodSearch.reset()
    const q = query(
      foodCol,
      where("name", ">=", searchTerm),
      where("name", "<=", searchTerm + "\uf8ff")
    );
    let results = []
    getDocs(q)
      .then((snapshot) => {
        snapshot.docs.forEach((doc) => {
          results.push({...doc.data(), id: doc.id })
      })
        let resultsHTML = document.querySelector('.food_results')
        resultsHTML.innerHTML = generateTableHTML(results)
        addRowClickEventListeners(results)
      })
  })
}

//Adding Exercises
const exerciseForm = document.querySelector('.exercise_submit_button')
if(exerciseForm) {
  exerciseForm.addEventListener('click', (e) =>{
    e.preventDefault();
    e.stopPropagation();
    addTimeToPullDate();

    let exCalories = document.querySelector('.exercise_calories').value || 0;
    let exType = document.querySelector('.exercise_select').value;
    
    addDoc(exerciseCol, {
      caloriesBurned: exCalories,
      exerciseType: exType,
      datetime: pullOpenDate,
      uid: auth.currentUser.uid
    })
    .then(() =>{
      clearFoodPopup();
      zeroPullDate();
      
      let popup = document.querySelector('.popup_active');
      let blur = document.querySelector('.dash');

      popup.classList.remove('popup_active');
      blur.classList.remove('blur_active');   
    })
})}

//Adding Biometric
async function getMostRecentDoc(collectionRef) {

  const q = query(collectionRef,
    where("uid", "==", auth.currentUser.uid),
    orderBy('datetime', 'desc')
  );
  let results = [];
  let snapshot = await getDocs(q);
  snapshot.docs.forEach((doc) => {
    results.push({ ...doc.data(), id: doc.id });
  });
  return results[0];
}

async function setBioMetricsOnScreen(){
  
  let currentHeightDoc = await getMostRecentDoc(heightCol);
  let currentHeight = currentHeightDoc.height;
  let currentHeightElement = document.querySelector(".current_height_value")
  currentHeightElement.innerHTML = currentHeight + " cm";

  let currentWeightDoc = await getMostRecentDoc(weightCol);
  let currentWeight = currentWeightDoc.weight;
  let currentWeightElement = document.querySelector(".current_weight_value")
  currentWeightElement.innerHTML = currentWeight + " kg";
}

const biometricForm = document.querySelector('.biometric_submit_button')
if(biometricForm) {
  biometricForm.addEventListener('click', async (e) =>{
    e.preventDefault();
    e.stopPropagation();
    addTimeToPullDate();

    let bioValue = document.querySelector('.biometric_value').value;
    let exType = document.querySelector('.biometric_select').value;

    if(bioValue){
      if(exType == "height"){
        addDoc(heightCol, {
          height: bioValue,
          datetime: pullOpenDate,
          uid: auth.currentUser.uid
        })
      }
      if(exType == "weight"){
        addDoc(weightCol, {
          weight: bioValue,
          datetime: pullOpenDate,
          uid: auth.currentUser.uid
        })
      }
    }
    clearFoodPopup();
    zeroPullDate();
  
    let popup = document.querySelector('.popup_active');
    let blur = document.querySelector('.dash');

    popup.classList.remove('popup_active');
    blur.classList.remove('blur_active');   
})}

//Adding Notes
let noteSubmitButton = document.querySelector('.note_submit');
if(noteSubmitButton) {
  noteSubmitButton.addEventListener('click', async(e) => {
    e.preventDefault();
    e.stopPropagation();
    addTimeToPullDate();

    let noteText = document.querySelector('.note_input').value;
    
    addDoc(notesCol, {
      note: noteText,
      datetime: pullOpenDate,
      uid: auth.currentUser.uid
    })
    .then(() =>{
      clearFoodPopup();
      zeroPullDate();
      
      let popup = document.querySelector('.popup_active');
      let blur = document.querySelector('.dash');

      popup.classList.remove('popup_active');
      blur.classList.remove('blur_active');   
    })
  }
)}

//Snaphots
async function updateAllData() {
  const user = getAuth().currentUser;

  zeroPullDate();
  await setBioMetricsOnScreen();
  await updateEntryTable(user.uid);
  await updateMacroTotals();
  await fetchAndUpdateProgressBars();
  addEntryRowClickEventListeners();
}
onSnapshot(entryCol, () => updateAllData());
onSnapshot(exerciseCol, () => updateAllData());
onSnapshot(heightCol, () => updateAllData());
onSnapshot(weightCol, () => updateAllData());
onSnapshot(notesCol, () => updateAllData());

async function updateEntryTable(uid) {
  try {

    //Food entries
    let FoodResults = [];
    const entryQ = query(entryCol,
      where('datetime', '>=', pullOpenDate),
      where('datetime', '<', pullCloseDate),
      where('uid', '==', uid),
      orderBy('datetime', 'desc')
    );
    const snapshot = await getDocs(entryQ);
    snapshot.docs.forEach((doc) => {
        FoodResults.push({ ...doc.data(), id: doc.id });
    });

    //Exercise entries
    let exerciseResults = [];
    const exercQ = query(exerciseCol,
      where('datetime', '>=', pullOpenDate),
      where('datetime', '<', pullCloseDate),
      where('uid', '==', uid),
      orderBy('datetime', 'desc')
    );
    const snapshotEx = await getDocs(exercQ);
    snapshotEx.docs.forEach((doc) => {
        exerciseResults.push({ ...doc.data(), id: doc.id });
    });

    //Height entries
      let heightResults = [];
      const heightQ = query(heightCol,
        where('datetime', '>=', pullOpenDate),
        where('datetime', '<', pullCloseDate),
        where('uid', '==', uid),
        orderBy('datetime', 'desc')
      );
      const snapshotHi = await getDocs(heightQ);
      snapshotHi.docs.forEach((doc) => {
        heightResults.push({ ...doc.data(), id: doc.id });
      });

      //Weight entries
      let weightResults = [];
      const weightQ = query(weightCol,
        where('datetime', '>=', pullOpenDate),
        where('datetime', '<', pullCloseDate),
        where('uid', '==', uid),
        orderBy('datetime', 'desc')
      );
      const snapshotWe = await getDocs(weightQ);
      snapshotWe.docs.forEach((doc) => {
        weightResults.push({ ...doc.data(), id: doc.id });
      });
      //Notes entries
        let notesResults = [];
        const notesQ = query(notesCol,
          where('datetime', '>=', pullOpenDate),
          where('datetime', '<', pullCloseDate),
          where('uid', '==', uid),
          orderBy('datetime', 'desc')
        );
        const snapshotNo = await getDocs(notesQ);
        snapshotNo.docs.forEach((doc) => {
          notesResults.push({ ...doc.data(), id: doc.id });
        });

      //ENTRY TABLE HTML
      let tableHTML = ''
      tableHTML += await generateEntryTableHTML(FoodResults);
      tableHTML += await generateExerciseTableHTML(exerciseResults);
      tableHTML += await generateHeightTableHTML(heightResults);
      tableHTML += await generateWeightTableHTML(weightResults);
      tableHTML += await generateNotesTableHTML(notesResults);
      
      tableHTML += `
        </tbody>
        </table>
        `;

      document.querySelector('.food_list_body').innerHTML = tableHTML;

  } catch (err) {
      console.error('Error updating entry table:', err);
  }
}
async function updateMacroTotals() {

  try {
    //CALCULATES Total Calories
    //FILLER STUFF
    let calorieTotal = document.querySelector('.calorie_value')
    let protienotal = document.querySelector('.protein_value')
    let carbTotal = document.querySelector('.carb_value')
    let fatsTotal = document.querySelector('.fats_value')
    let calorieTotalHTML = ""
    calorieTotalHTML += `OBAMNA 2 THE RE-BOMNAING`
    calorieTotal.innerHTML = calorieTotalHTML
    
    let FoodEntryRow = 0;
    let ExerciseRow = 0;
    let calorieSum = 0;
    let proteinSum  = 0;
    let carbSum = 0;
    let fatsSum = 0;
    let entryRow

    while(FoodEntryRow < 999){
      entryRow = document.getElementById(`food_entry_${FoodEntryRow}`)
      if(!entryRow){
        break
      }
      
      calorieSum += parseFloat(entryRow.dataset.calories)
      proteinSum += parseFloat(entryRow.dataset.protein)
      carbSum += parseFloat(entryRow.dataset.carbs)
      fatsSum += parseFloat(entryRow.dataset.fats)
      FoodEntryRow++
    }
    while(ExerciseRow < 999){
      entryRow = document.getElementById(`exercise_entry_${ExerciseRow}`)
      if(!entryRow){
        break
      }
      calorieSum -= parseFloat(entryRow.dataset.calories)
      ExerciseRow++
    }
    
    calorieTotal.innerHTML = calorieSum.toFixed(2) + " kCal"
    protienotal.innerHTML = proteinSum.toFixed(2) + " P"
    carbTotal.innerHTML = carbSum.toFixed(2) + " C"
    fatsTotal.innerHTML = fatsSum.toFixed(2) + " F"


  }
  catch (err) {
    console.error('Error making the macros calc', err)
  }
}
async function calculateMacroLimits(uid, calorieLimit, proteinLimit, carbLimit, fatsLimit) {
  const recentHeightDoc = await getMostRecentDoc(heightCol);
  const recentWeightDoc = await getMostRecentDoc(weightCol);
  const currentWeight = recentWeightDoc.weight;
  const currentHeight = recentHeightDoc.height;
  const calorieLcalc = (88.362 + (13.397 * currentWeight) + (4.799 * currentHeight) - (5.677 * 25)).toFixed(0);
  const protienLcalc = (Math.floor(currentWeight * 1.8)).toFixed(0)
  const fatsLcalc = (Math.floor((calorieLcalc * 0.3) / 9)).toFixed(0)
  const carbLcalc = (Math.floor((calorieLcalc - (protienLcalc * 4) - (fatsLcalc * 9))/4)).toFixed(0)

  const calculatedLimits = {
    calorieLimit: calorieLcalc,
    proteinLimit: protienLcalc,
    fatsLimit: fatsLcalc,
    carbLimit: carbLcalc,
  };

  return calculatedLimits;
}

async function progressBarPrinting(proteinValueE, proteinLimitE, progressBar) {
  const value = parseFloat(proteinValueE.textContent);
  const limit = parseFloat(proteinLimitE.textContent);

  const width = ((value/ limit) * 100) || 0
  progressBar.style.setProperty('--width', width);
  progressBar.style.backgroundColor = width > 100 ? 'red' : '#c7c7c7';
}
async function fetchAndUpdateProgressBars() {
  const user = getAuth().currentUser;
  let calorieLimitValue;
  let proteinLimitValue;
  let carbLimitValue;
  let fatLimitValue;

  const calculatedLimits = await calculateMacroLimits(user.uid, calorieLimitValue, proteinLimitValue, carbLimitValue, fatLimitValue);

  calorieLimitValue = calculatedLimits.calorieLimit;
  proteinLimitValue = calculatedLimits.proteinLimit;
  carbLimitValue = calculatedLimits.carbLimit;
  fatLimitValue = calculatedLimits.fatsLimit;

  const calorieValue = document.querySelector('.calorie_value');
  const calorieLimit = document.querySelector('.calorie_limit');
  const calorieProgress = document.querySelector('.calorie_bar');
  calorieLimit.textContent = calorieLimitValue;
  
  const proteinValue = document.querySelector('.protein_value');
  const proteinLimit = document.querySelector('.protein_limit');
  const proteinProgress = document.querySelector('.protein_bar');
  proteinLimit.textContent = proteinLimitValue;

  const carbValue = document.querySelector('.carb_value');
  const carbLimit = document.querySelector('.carb_limit');
  const carbProgress = document.querySelector('.carb_bar');
  carbLimit.textContent = carbLimitValue;

  const fatValue = document.querySelector('.fats_value');
  const fatLimit = document.querySelector('.fats_limit');
  const fatProgress = document.querySelector('.fats_bar');
  fatLimit.textContent = fatLimitValue;

  await progressBarPrinting(calorieValue, calorieLimit, calorieProgress);
  await progressBarPrinting(proteinValue, proteinLimit, proteinProgress);
  await progressBarPrinting(carbValue, carbLimit, carbProgress);
  await progressBarPrinting(fatValue, fatLimit, fatProgress);
}
async function generateEntryTableHTML(FoodResults) {
  let tableHTMLinsert = '';

  tableHTMLinsert = `
    <table class="food_list_table" >
        <thead>
            <tr class="table_entry">
                <th class="food_filler"></th>
                <th class="food_icon">Type</th>
                <th class="food_name">Name</th>
                <th class="food_quantity">#</th>
                <th class="food_unit">Serving size/unit</th>
                <th class="food_calories"></th>
                <th class="food_kCal">Calories</th>
            </tr>
        </thead>
        <tbody>
  `;

  // Iterate over FoodResults array
  for (const [index, item] of FoodResults.entries()) {
      try {
          const querySnapshot = await getDocs(query(foodCol, where("fid", "==", item.fid)));

          querySnapshot.forEach((doc) => {
              const foodInfo = doc.data();
              let calories = (foodInfo.calories * (item.servings / foodInfo.serving_size)).toFixed(2);
              let protein = (foodInfo.protein * (item.servings / foodInfo.serving_size)).toFixed(2);
              let carbs = (foodInfo.carbs * (item.servings / foodInfo.serving_size)).toFixed(2);
              let fats = (foodInfo.fats * (item.servings / foodInfo.serving_size)).toFixed(2);

              tableHTMLinsert += `
                  <tr class="food_entry" id="food_entry_${index}" data-id="${item.id}" data-servings="${item.servings}" data-foodName="${foodInfo.name}" data-protein="${protein}" data-carbs="${carbs}" data-fats="${fats}" data-calories="${calories}">
                      <td class="food_filler"></td>
                      <td class="food_icon">
                      <img class="table_image" id="food_image" src="https://pbs.twimg.com/media/GJJTUpCWMAIjNgY?format=png&name=small" alt="food">
                  </td>
                      <td class="food_name">${foodInfo.name}</td>
                      <td class="food_quantity">${item.servings}</td>
                      <td class="food_unit">grams</td>
                      <td class="food_calories">${calories}</td>
                      <td class="food_kCal">kCal</td>
                  </tr>
              `;
          });

      } catch (error) {
          console.error('Error getting food info:', error);
      }
  }

  return tableHTMLinsert;
}
async function generateExerciseTableHTML(exerciseResults) {
  let tableHTMLinsert = '';

  for (const [index, item] of exerciseResults.entries()) {
      try {
        let calories = item.caloriesBurned;
        let protein = 0
        let carbs = 0
        let fats = 0

        tableHTMLinsert += `
            <tr class="exercise_entry" id="exercise_entry_${index}" data-id="${item.id}"  data-type="${item.exerciseType}" data-protein="${protein}" data-carbs="${carbs}" data-fats="${fats}" data-calories="${calories}">
                <td class="exercise_filler"></td>
                <td class="exercise_icon">
                <img class="table_image" id="exercise_image"  src="https://pbs.twimg.com/media/GJJTc-7WsAA-qT0?format=png&name=medium" alt="exercise">
            </td>
                <td class="exercise_name">${item.exerciseType}</td>
                <td class="exercise_quantity"></td>
                <td class="exercise_unit"></td>
                <td class="exercise_calories">${calories}</td>
                <td class="exercise_kCal">kCal</td>
            </tr>
        `;

      } catch (error) {
          console.error('Error getting exercise info:', error);
      }
  }

  return tableHTMLinsert;
}
async function generateHeightTableHTML(heightResults) {
  let tableHTMLinsert = '';

  for (const [index, item] of heightResults.entries()) {
      try {
        let calories = 0;
        let protein = 0
        let carbs = 0
        let fats = 0

        tableHTMLinsert += `
            <tr class="bio_entry_h" id="bio_entry_h_${index}" data-id="${item.id}" data-height="${item.height}" data-type="height" data-protein="${protein}" data-carbs="${carbs}" data-fats="${fats}" data-calories="${calories}">
                <td class="exercise_filler"></td>
                <td class="exercise_icon"> 
                <img class="table_image" id="biometric_image" src="https://pbs.twimg.com/media/GJJTpkhXgAE74xl?format=png&name=small" alt="biometric">
            </td>
                <td class="exercise_name">${item.height} cm</td>
                <td class="exercise_quantity"></td>
                <td class="exercise_unit"></td>
                <td class="exercise_calories"></td>
                <td class="exercise_kCal"></td>
            </tr>
        `;

      } catch (error) {
          console.error('Error getting exercise info:', error);
      }
  }

  return tableHTMLinsert;
}
async function generateWeightTableHTML(weightResults) {
  let tableHTMLinsert = '';

  for (const [index, item] of weightResults.entries()) {
      try {
        let calories = 0;
        let protein = 0
        let carbs = 0
        let fats = 0

        tableHTMLinsert += `
            <tr class="bio_entry_w" id="bio_entry_w_${index}" data-id="${item.id}" data-weight="${item.weight}"data-type="weight" data-protein="${protein}" data-carbs="${carbs}" data-fats="${fats}" data-calories="${calories}">
                <td class="exercise_filler"></td>
                <td class="exercise_icon">
                <img class="table_image" id="biometric_image" src="https://pbs.twimg.com/media/GJJTpkhXgAE74xl?format=png&name=small" alt="biometric">
            </td>
                <td class="exercise_name">${item.weight} kg</td>
                <td class="exercise_quantity"></td>
                <td class="exercise_unit"></td>
                <td class="exercise_calories"></td>
                <td class="exercise_kCal"></td>
            </tr>
        `;

      } catch (error) {
          console.error('Error getting exercise info:', error);
      }
  }

  return tableHTMLinsert;
}
async function generateNotesTableHTML(notesResults) {
  let tableHTMLinsert = '';

  for (const [index, item] of notesResults.entries()) {
      try {
        let calories = 0;
        let protein = 0
        let carbs = 0
        let fats = 0
        let notePreview = item.note.slice(0,100)

        tableHTMLinsert += `
            <tr class="note_entry" id="note_entry_${index}" data-id="${item.id}" data-note="${item.note}" data-protein="${protein}" data-carbs="${carbs}" data-fats="${fats}" data-calories="${calories}">
                <td class="exercise_filler"></td>
                <td class="exercise_icon">
                <img class="table_image" id="notes_image" src="https://pbs.twimg.com/media/GJJT2I1XgAAJbKf?format=png&name=small" alt="notes">
            </td>
                <td class="exercise_name">${notePreview}...</td>
                <td class="exercise_quantity"></td>
                <td class="exercise_unit"></td>
                <td class="exercise_calories"></td>
                <td class="exercise_kCal"></td>
            </tr>
        `;

      } catch (error) {
          console.error('Error getting exercise info:', error);
      }
  }

  return tableHTMLinsert;
}


function addEntryRowClickEventListeners() {
  let foodRows = document.querySelectorAll('.food_entry')
  foodRows.forEach((item, index) => {
    const row = document.getElementById(`food_entry_${index}`);
    row.addEventListener('click', (e) =>{
      console.log(`food entry ${index}`)
      popupWindow('.food_entry_popup')
      populateFoodEntryPopup(row)
    })
  })
  let exRows = document.querySelectorAll('.exercise_entry')
  exRows.forEach((item, index) => {
    const row = document.getElementById(`exercise_entry_${index}`);
    row.addEventListener('click', (e) =>{
      console.log(`exercise entry ${index}`)
      popupWindow('.exercise_entry_popup')
      populateExerciseEntryPopup(row)

      e.stopPropagation()
    })
  })
  let bioHRows = document.querySelectorAll('.bio_entry_h')
  bioHRows.forEach((item, index) => {
    const row = document.getElementById(`bio_entry_h_${index}`);
    row.addEventListener('click', (e) =>{
      console.log(`height entry ${index}`)
      popupWindow('.height_entry_popup')
      populateHeightEntryPopup(row)
      e.stopPropagation()
    })
  })
  let bioWRows = document.querySelectorAll('.bio_entry_w')
  bioWRows.forEach((item, index) => {
    const row = document.getElementById(`bio_entry_w_${index}`);
    row.addEventListener('click', (e) =>{
      console.log(`weight entry ${index}`)
      popupWindow('.weight_entry_popup')
      populateWeightEntryPopup(row)
      e.stopPropagation()
    })
  })
  let noteRows = document.querySelectorAll('.note_entry')
  noteRows.forEach((item, index) => {
    const row = document.getElementById(`note_entry_${index}`);
    row.addEventListener('click', (e) =>{
      console.log(`note entry ${index}`)
      popupWindow('.note_entry_popup')
      populateNotesEntryPopup(row)
      e.stopPropagation()
    })
  })
}

//Food Entry POPUP
function populateFoodEntryPopup(row){
  let fepn = document.querySelector('.food_entry_popup_name')
  let fepk = document.querySelector('.food_entry_popup_calories')
  let fepp = document.querySelector('.food_entry_popup_protein')
  let fepc = document.querySelector('.food_entry_popup_carbs')
  let fepf = document.querySelector('.food_entry_popup_fats')
  let feps = document.querySelector('.food_entry_popup_servings')
  let fepd = document.querySelector('.food_entry_popup_passing_data')

  fepn.innerHTML = row.dataset.foodname;
  fepk.innerHTML = row.dataset.calories + "kCal";
  fepp.innerHTML = row.dataset.protein + "p";
  fepc.innerHTML = row.dataset.carbs + "c";
  fepf.innerHTML = row.dataset.fats + "f";
  feps.placeholder = row.dataset.servings;

  if (!fepd.data) {
    fepd.data = {};
}
  fepd.dataset.id = row.dataset.id;
}
let updateFoodEntryButton = document.querySelector('.food_entry_popup_update')
if(updateFoodEntryButton){
  updateFoodEntryButton.addEventListener('click', async(e) => {
    e.preventDefault()
    e.stopPropagation()

    let passedData = document.querySelector('.food_entry_popup_passing_data')
    let eid = passedData.dataset.id;
    let newServing = document.querySelector('.food_entry_popup_servings').value

    const docRef = doc(db, 'Food_Entry', eid)

    updateDoc(docRef, {
      servings: newServing
    })
    .then(() =>{
      clearFoodPopup();
      
      let popup = document.querySelector('.popup_active');
      let blur = document.querySelector('.dash');

      popup.classList.remove('popup_active');
      blur.classList.remove('blur_active');   
    })
  })
}
let deleteFoodEntryButton = document.querySelector('.food_entry_popup_delete')
if(deleteFoodEntryButton){
  deleteFoodEntryButton.addEventListener('click', async(e) => {
    e.preventDefault()
    e.stopPropagation()

    let passedData = document.querySelector('.food_entry_popup_passing_data')
    let eid = passedData.dataset.id;

    const docRef = doc(db, 'Food_Entry', eid)

    deleteDoc(docRef)
    .then(() =>{
      clearFoodPopup();
      
      let popup = document.querySelector('.popup_active');
      let blur = document.querySelector('.dash');

      popup.classList.remove('popup_active');
      blur.classList.remove('blur_active');   
    })
  })
}

//Exercise Entry POPUP
function populateExerciseEntryPopup(row){
  let eepn = document.querySelector('.exercise_entry_popup_name')
  let eepk = document.querySelector('.exercise_entry_popup_calories')
  let eepd = document.querySelector('.exercise_entry_popup_passing_data')

  console.log(`TYPE ${row.dataset.type}`)
  console.log(`CALORIES ${row.dataset.calories}`)
  eepn.innerHTML = row.dataset.type;
  eepk.placeholder = row.dataset.calories;

  if (!eepd.data) {
    eepd.data = {};
}
console.log(`ID ${row.dataset.id}`)
  eepd.dataset.id = row.dataset.id;
}
let updateExerciseEntryButton = document.querySelector('.exercise_entry_popup_update')
if(updateExerciseEntryButton){
  updateExerciseEntryButton.addEventListener('click', async(e) => {
    e.preventDefault()
    e.stopPropagation()

    let passedData = document.querySelector('.exercise_entry_popup_passing_data')
    let eid = passedData.dataset.id;
    let burned = document.querySelector('.exercise_entry_popup_calories').value

    const docRef = doc(db, 'exercise', eid)
    console.log(eid)
    console.log(burned)
    updateDoc(docRef, {
      caloriesBurned: burned
    })
    .then(() =>{
      clearFoodPopup();
      
      let popup = document.querySelector('.popup_active');
      let blur = document.querySelector('.dash');

      popup.classList.remove('popup_active');
      blur.classList.remove('blur_active');   
    })
  })
}
let deleteExerciseEntryButton = document.querySelector('.exercise_entry_popup_delete')
if(deleteExerciseEntryButton){
  deleteExerciseEntryButton.addEventListener('click', async(e) => {
    e.preventDefault()
    e.stopPropagation()

    let passedData = document.querySelector('.exercise_entry_popup_passing_data')
    let eid = passedData.dataset.id;

    const docRef = doc(db, 'exercise', eid)

    deleteDoc(docRef)
    .then(() =>{
      clearFoodPopup();
      
      let popup = document.querySelector('.popup_active');
      let blur = document.querySelector('.dash');

      popup.classList.remove('popup_active');
      blur.classList.remove('blur_active');   
    })
  })
}

//Height Entry POPUP
function populateHeightEntryPopup(row){
  let eepv = document.querySelector('.height_entry_popup_value')
  let eepd = document.querySelector('.height_entry_popup_passing_data')

  eepv.placeholder = row.dataset.height;

  if (!eepd.data) {
    eepd.data = {};
}
  eepd.dataset.id = row.dataset.id;
}
let updateHeightEntryButton = document.querySelector('.height_entry_popup_update')
if(updateHeightEntryButton){
  updateHeightEntryButton.addEventListener('click', async(e) => {
    e.preventDefault()
    e.stopPropagation()

    let passedData = document.querySelector('.height_entry_popup_passing_data')
    let eid = passedData.dataset.id;
    let height = document.querySelector('.height_entry_popup_value').value

    const docRef = doc(db, 'Height', eid)
    console.log(eid)
    console.log(height)
    updateDoc(docRef, {
      height: height
    })
    .then(() =>{
      clearFoodPopup();
      
      let popup = document.querySelector('.popup_active');
      let blur = document.querySelector('.dash');

      popup.classList.remove('popup_active');
      blur.classList.remove('blur_active');   
    })
  })
}
let deleteHeightEntryButton = document.querySelector('.height_entry_popup_delete')
if(deleteHeightEntryButton){
  deleteHeightEntryButton.addEventListener('click', async(e) => {
    e.preventDefault()
    e.stopPropagation()

    let passedData = document.querySelector('.height_entry_popup_passing_data')
    let eid = passedData.dataset.id;

    const docRef = doc(db, 'Height', eid)

    deleteDoc(docRef)
    .then(() =>{
      clearFoodPopup();
      
      let popup = document.querySelector('.popup_active');
      let blur = document.querySelector('.dash');

      popup.classList.remove('popup_active');
      blur.classList.remove('blur_active');   
    })
  })
}

//Weight Entry POPUP
function populateWeightEntryPopup(row){
  let eepv = document.querySelector('.weight_entry_popup_value')
  let eepd = document.querySelector('.weight_entry_popup_passing_data')

  eepv.placeholder = row.dataset.weight;

  if (!eepd.data) {
    eepd.data = {};
}
  eepd.dataset.id = row.dataset.id;
}
let updateWeightEntryButton = document.querySelector('.weight_entry_popup_update')
if(updateWeightEntryButton){
  updateWeightEntryButton.addEventListener('click', async(e) => {
    e.preventDefault()
    e.stopPropagation()

    let passedData = document.querySelector('.weight_entry_popup_passing_data')
    let eid = passedData.dataset.id;
    let weight = document.querySelector('.weight_entry_popup_value').value

    const docRef = doc(db, 'Weight', eid)
    console.log(eid)
    console.log(weight)
    updateDoc(docRef, {
      weight: weight
    })
    .then(() =>{
      clearFoodPopup();
      
      let popup = document.querySelector('.popup_active');
      let blur = document.querySelector('.dash');

      popup.classList.remove('popup_active');
      blur.classList.remove('blur_active');   
    })
  })
}
let deleteWeightEntryButton = document.querySelector('.weight_entry_popup_delete')
if(deleteWeightEntryButton){
  deleteWeightEntryButton.addEventListener('click', async(e) => {
    e.preventDefault()
    e.stopPropagation()

    let passedData = document.querySelector('.weight_entry_popup_passing_data')
    let eid = passedData.dataset.id;

    const docRef = doc(db, 'Weight', eid)

    deleteDoc(docRef)
    .then(() =>{
      clearFoodPopup();
      
      let popup = document.querySelector('.popup_active');
      let blur = document.querySelector('.dash');

      popup.classList.remove('popup_active');
      blur.classList.remove('blur_active');   
    })
  })
}

//Note Entry POPUP
function populateNotesEntryPopup(row){
  let eepv = document.querySelector('.note_entry_popup_value')
  let eepd = document.querySelector('.note_entry_popup_passing_data')

  eepv.value = row.dataset.note;

  if (!eepd.data) {
    eepd.data = {};
}
  eepd.dataset.id = row.dataset.id;
}
let updateNoteEntryButton = document.querySelector('.note_entry_popup_update')
if(updateNoteEntryButton){
  updateNoteEntryButton.addEventListener('click', async(e) => {
    e.preventDefault()
    e.stopPropagation()

    let passedData = document.querySelector('.note_entry_popup_passing_data')
    let eid = passedData.dataset.id;
    let note = document.querySelector('.note_entry_popup_value').value

    const docRef = doc(db, 'Notes', eid)
    console.log(eid)
    console.log(note)
    updateDoc(docRef, {
      note: note
    })
    .then(() =>{
      clearFoodPopup();
      
      let popup = document.querySelector('.popup_active');
      let blur = document.querySelector('.dash');

      popup.classList.remove('popup_active');
      blur.classList.remove('blur_active');   
    })
  })
}
let deleteNoteEntryButton = document.querySelector('.note_entry_popup_delete')
if(deleteNoteEntryButton){
  deleteNoteEntryButton.addEventListener('click', async(e) => {
    e.preventDefault()
    e.stopPropagation()

    let passedData = document.querySelector('.note_entry_popup_passing_data')
    let eid = passedData.dataset.id;

    const docRef = doc(db, 'Notes', eid)

    deleteDoc(docRef)
    .then(() =>{
      clearFoodPopup();
      
      let popup = document.querySelector('.popup_active');
      let blur = document.querySelector('.dash');

      popup.classList.remove('popup_active');
      blur.classList.remove('blur_active');   
    })
  })
}

//CALENDAR
  function generateCalendar(year, month) {
    const firstDayOfMonth = new Date(year, month, 1).getDay();
    const lastDayOfMonth = new Date(year, month + 1, 0).getDate();

    const tbody = document.querySelector('.calendar-table tbody');
    tbody.innerHTML = '';

    let date = 1;
    for (let i = 0; i < 6; i++) {
      const row = document.createElement('tr');
      for (let j = 0; j < 7; j++) {
        const cell = document.createElement('td');
        if ((i === 0 && j < firstDayOfMonth) || date > lastDayOfMonth) {
          cell.textContent = '';
        } else {
          cell.textContent = date;
          const dateString = new Date(year, month, date).toISOString();
          cell.addEventListener('click', function() {
            pullOpenDate = new Date(dateString);
            pullCloseDate = new Date(dateString);
            pullCloseDate.setDate(pullCloseDate.getDate() + 1);
            updateAllData();
          });
          date++;
        }
        cell.classList.add('calendar-cell');
        row.appendChild(cell);
      }
      tbody.appendChild(row);
      if (date > lastDayOfMonth) {
        break;
      }
    }
    document.querySelector('.current-month-year').textContent = `${new Date(year, month).toLocaleString('default', { month: 'long' })} ${year}`;
  }

  const today = new Date();
  let currentYear = today.getFullYear();
  let currentMonth = today.getMonth();
  generateCalendar(currentYear, currentMonth);

  document.querySelector('.prev-month-btn').addEventListener('click', function() {
    currentMonth--;
    if (currentMonth < 0) {
      currentMonth = 11;
      currentYear--;
    }
    generateCalendar(currentYear, currentMonth);
  });

  document.querySelector('.next-month-btn').addEventListener('click', function() {
    currentMonth++;
    if (currentMonth > 11) {
      currentMonth = 0;
      currentYear++;
    }
    generateCalendar(currentYear, currentMonth);
  });
