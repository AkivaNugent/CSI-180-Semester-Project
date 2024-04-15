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
  const provider = new GoogleAuthProvider()

//DateSet
let pullDate = new Date()

// -----------------------------------------------------------------------------
// collection ref
const colRef = collection(db, 'biometrics');
const foodCol = collection(db, 'Foods');
const entryCol = collection(db, 'Food_Entry')
  
// Queries

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
    console.log("obamna")
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
        //console.log(item);
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

auth.onAuthStateChanged(function(user) {
  if (user) {
    var uid = user.uid;
    console.log('logged in :' + uid)
    updateEntryTable(uid);
    updateMacroTotals()
    console.log('done')
    
  } else {
    console.log('not getting the uid for the table')
  }
});

async function updateEntryTable(uid) {
  try {
    console.log('test')
      let FoodResults = [];
      const currentDate = new Date();
      const startDate = new Date(currentDate);
      startDate.setHours(0, 0, 0, 0);
      const endDate = new Date(currentDate);
      endDate.setHours(23, 59, 59, 999);
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

      //ENTRY TABLE HTML
      let tableHTML = ''
      console.log("before generate function")
      tableHTML += await generateEntryTableHTML(FoodResults);
      console.log('before table insert')
      document.querySelector('.food_list_body').innerHTML = tableHTML;
      console.log('end of first try')

  } catch (err) {
      console.error('Error updating entry table:', err);
  }
}

async function updateMacroTotals() {

  console.log('before try statement')
  try {
    //CALCULATES Total Calories
    console.log('before html update')
    let calorieTotal = document.querySelector('.calorie_total')
    let calorieTotalHTML = ""
    calorieTotalHTML += `OBAMNA`
    calorieTotal.innerHTML = "OBAMNA 2 THE RE-BOMANING"
    console.log('after html update')
  }
  catch (err) {
    console.error('Error making the macros calc', err)
  }
}

async function generateEntryTableHTML(FoodResults) {
  let tableHTMLinsert = '';

  tableHTMLinsert = `
    <table class="food_list_table">
        <thead>
            <tr class="food_entry">
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
              let protein = (foodInfo.protien * (item.servings / foodInfo.serving_size)).toFixed(2);
              let carbs = (foodInfo.carbs * (item.servings / foodInfo.serving_size)).toFixed(2);
              let fats = (foodInfo.fats * (item.servings / foodInfo.serving_size)).toFixed(2);

              tableHTMLinsert += `
                  <tr class="food_entry" id="entry ${index}" data-id="${item.id}" data-protein="${protein}" data-carbs="${carbs}" data-fats="${fats}" data-calories="${calories}">
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

        tableHTMLinsert += `
        </tbody>
        </table>
        `;
      } catch (error) {
          console.error('Error getting food info:', error);
      }
  }

  return tableHTMLinsert;
}

