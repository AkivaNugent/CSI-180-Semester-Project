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

//DateSet
let pullDate = new Date()

// -----------------------------------------------------------------------------
// collection ref
const bioRef = collection(db, 'Biometrics');
const foodCol = collection(db, 'Foods');
const entryCol = collection(db, 'Food_Entry')
const exerciseCol = collection(db, 'exercise')

// -----------------------------------------------------------------------------
// TODO - make the table fill with entries


 // adding entry -------------------------------------------------------TAKE OUT
 const addFood = document.querySelector('.foodform')
 if(addFood){
   addFood.addEventListener('submit', (e) => {
     e.preventDefault()
     addDoc(foodCol, {
       name: addFood.name.value,
       fid: addFood.fid.value,
       serving_size: addFood.serving_size.value,
       calories: addFood.calories.value,
       protein: addFood.protien.value,
       carbs: addFood.carbs.value,
       fats: addFood.fats.value,
     })
     .then(() =>{
       addFood.reset()  
     })
   })}


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
if (window.location.pathname === '/dist/pages/dashboard.html') {
  document.addEventListener('click', function(event) {
    dismissPopup(event);
  });
}

function dismissPopup(event) {
  let popup = document.querySelector('.popup_active');
  let isClickInside = popup.contains(event.target);
  let blur = document.querySelector('.dash');

  if (!isClickInside && popup.classList.contains('popup_active')) {
    popup.classList.remove('popup_active');
    blur.classList.remove('blur_active');
  }
}

//FOOD FORM
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
            let amount = servingsInput.value || serving;
            addDoc(entryCol, {
              fid: item.fid,
              servings: amount,
              datetime: new Date(),
              uid: auth.currentUser.uid
            })
            .then(() =>{
              foodConfirm.reset();
              clearFoodPopup();
              
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

    let exCalories = document.querySelector('.exercise_calories').value;
    let exType = document.querySelector('.exercise_select').value;
    
    console.log('we`re in')
    addDoc(exerciseCol, {
      caloriesBurned: exCalories,
      exerciseType: exType,
      datetime: new Date(),
      uid: auth.currentUser.uid
    })
    .then(() =>{
      clearFoodPopup();
      
      let popup = document.querySelector('.popup_active');
      let blur = document.querySelector('.dash');

      popup.classList.remove('popup_active');
      blur.classList.remove('blur_active');   
    })
})}

//Adding Biometric

async function getMostRecentDocument(collectionRef) {
  const q = query(collectionRef, 
    orderBy('timestamp', 'desc'), 
    limit(1)
  );
  const snapshot = await getDocs(q);

  return snapshot.docs[0].data();
}

const biometricForm = document.querySelector('.biometric_submit_button')
if(biometricForm) {
  console.log('its here')
  biometricForm.addEventListener('click', async (e) =>{
    e.preventDefault();
    e.stopPropagation();

    let bioValue = document.querySelector('.biometric_value').value;
    let exType = document.querySelector('.biometric_select').value;
    let syncBio = getMostRecentDocument(bioRef)
    console.log(syncBio)
    let height = bioValue;
    let weight = bioValue;
    if(exType == "height"){
      weight = syncBio.weight;
    }
    if(exType == "weight"){
      weight = syncBio.height;
    }
    //START HERE -------------------- I AM TRYING TO DEFINE LIMIT BECAUSE IT DOESNT UNDERSTAND FOR SOME REASON
    // MAYBE JUST MAKE AN ARRAY OF THEM ALL AND ONLY USE arr[0]
    console.log('we`re in')
    addDoc(bioRef, {
      caloriesBurned: exCalories,
      exerciseType: exType,
      datetime: new Date(),
      uid: auth.currentUser.uid
    })
    .then(() =>{
      clearFoodPopup();
      
      let popup = document.querySelector('.popup_active');
      let blur = document.querySelector('.dash');

      popup.classList.remove('popup_active');
      blur.classList.remove('blur_active');   
    })
})}



//Snaphots
onSnapshot(entryCol, async() => {
  const user = getAuth().currentUser;

  await updateEntryTable(user.uid);
  updateMacroTotals();
  fetchAndUpdateProgressBars();

});

onSnapshot(exerciseCol, async() => {
  const user = getAuth().currentUser;

  await updateEntryTable(user.uid);
  updateMacroTotals();
  fetchAndUpdateProgressBars();

});

async function updateEntryTable(uid) {
  try {
    //Date
    const currentDate = new Date();
    const startDate = new Date(currentDate);
    startDate.setHours(0, 0, 0, 0);
    const endDate = new Date(currentDate);
    endDate.setHours(23, 59, 59, 999);

    //Food entries
    let FoodResults = [];
    const entryQ = query(entryCol,
      where('datetime', '>=', startDate),
      where('datetime', '<', endDate),
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
        where('datetime', '>=', startDate),
        where('datetime', '<', endDate),
        where('uid', '==', uid),
        orderBy('datetime', 'desc')
      );
      const snapshotEx = await getDocs(exercQ);
      snapshotEx.docs.forEach((doc) => {
          exerciseResults.push({ ...doc.data(), id: doc.id });
      });

      console.log(exerciseResults)

      //ENTRY TABLE HTML
      let tableHTML = ''
      tableHTML += await generateEntryTableHTML(FoodResults);
      tableHTML += await generateExerciseTableHTML(exerciseResults);
      
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
      entryRow = document.getElementById(`food_entry ${FoodEntryRow}`)
      if(!entryRow){
        break
      }
      
      calorieSum += parseFloat(entryRow.dataset.calories)
      proteinSum += parseFloat(entryRow.dataset.protein)
      carbSum += parseFloat(entryRow.dataset.carbs)
      fatsSum += parseFloat(entryRow.dataset.fats)
      FoodEntryRow++
    }
    console.log('pre exercise')
    while(ExerciseRow < 999){
      entryRow = document.getElementById(`exercise_entry ${ExerciseRow}`)
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
  const biometricsQ = query(bioRef, where('uid', '==', uid), orderBy('datetime', 'desc'));
  let biometricsResults = [];
  const snapshot = await getDocs(biometricsQ);
  snapshot.docs.forEach((doc) => {
    biometricsResults.push({ ...doc.data(), id: doc.id });
  });

  const currentWeight = biometricsResults[0].weight;
  const currentHeight = biometricsResults[0].height;
  const calorieLcalc = 88.362 + (13.397 * currentWeight) + (4.799 * currentHeight) - (5.677 * 25);
  const protienLcalc = Math.floor(currentWeight * 1.8)
  const fatsLcalc = Math.floor((calorieLcalc * 0.3) / 9)
  const carbLcalc = Math.floor((calorieLcalc - (protienLcalc * 4) - (fatsLcalc * 9))/4)

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

// Function to fetch and update progress bars (replace with your actual logic)
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

fetchAndUpdateProgressBars(); // Call this when data is ready

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
                  <tr class="table_entry" id="food_entry ${index}" data-id="${item.id}" data-protein="${protein}" data-carbs="${carbs}" data-fats="${fats}" data-calories="${calories}">
                      <td class="food_filler"></td>
                      <td class="food_icon">Food</td>
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

  // Iterate over exercise array
  for (const [index, item] of exerciseResults.entries()) {
      try {
        let calories = item.caloriesBurned;
        let protein = 0
        let carbs = 0
        let fats = 0

        tableHTMLinsert += `
            <tr class="table_entry" id="exercise_entry ${index}" data-id="${item.id}" data-protein="${protein}" data-carbs="${carbs}" data-fats="${fats}" data-calories="${calories}">
                <td class="exercise_filler"></td>
                <td class="exercise_icon">Exercise</td>
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

  tableHTMLinsert += `
        </tbody>
        </table>
        `;

  return tableHTMLinsert;
}

