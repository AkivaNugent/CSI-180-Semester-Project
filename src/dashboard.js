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

const entryQ = query(entryCol,
  where("uid", "==", auth.currentUser.uid )
)

/*
document.addEventListener('DOMContentLoaded', () => {
  auth.onAuthStateChanged(user => {
    if (user) {
      const entryQ = query(entryCol, 
        where('userId', '==', user.uid)
      )
      const unsubEntry = onSnapshot(entryQ, (snapshot) => {
        let entryList = []
        snapshot.docs.forEach((doc) => {
          entryList.push({ ...doc.data(), id: doc.id })
        } )
        console.log('Entry list')
        console.log(entryList)
      })
    } else {
      // No user is signed in
      console.log('No user is currently logged in.');
    }
  });
});

*/
// -----------------------------------------------------------------------------
// TODO - easier temp inputs to Foods db for demo
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


/*
const addFoodFinalize = document.querySelector('.add_food_Finalize')
addFoodFinalize.addEventListener('click', () => {
  <tr class="food_entry">
    <th class="food_filler"></th>
    <th class="food_icon"></th>
    <th class="food_name"></th>
    <th class="food_quantity"></th>
    <th class="food_unit"></th>
    <th class="food_calories"></th>
    <th class="food_kCal"></th>
</tr>
})
*/

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
    let popup = document.querySelector('.popup_active');
    let isClickInside = popup.contains(event.target);
    let blur = document.querySelector('.dash');
  
    if (!isClickInside && popup.classList.contains('popup_active')) {
      popup.classList.remove('popup_active');
      blur.classList.remove('blur_active');
    }
  });
}

//FOOD FORM
function generateTableHTML(data) {
  let html = '<table class="results_table">';
  // Table header
  html += '<thead class="results_thead"><tr class="results_tr"><th class="results_th">Name</th><th class="results_th">Calories</th></tr></thead>';
  // Table body
  html += '<tbody class="results_tbody">';
  data.forEach(item => {
    html += `<tr class="results_tr"><td class="results_td">${item.name}</td><td class="results_td">${item.calories}</td></tr>`;
  });
  html += '</tbody></table>';
  return html;
}

const foodSearch = document.querySelector('.food_search')
if(foodSearch){
  foodSearch.addEventListener('submit', (e) => {
    e.preventDefault();
    e.stopPropagation();
    //console.log('clicked 1')
    const searchTerm = foodSearch.foodSearchInput.value.trim()
    foodSearch.reset()
    const q = query(
      foodCol,
      where("name", ">=", searchTerm),
      where("name", "<=", searchTerm + "\uf8ff")
    );
    getDocs(q)
      .then((snapshot) => {
        let results = []
        snapshot.docs.forEach((doc) => {
          results.push({...doc.data(), id: doc.id })
        })
        //console.log(results)

        let resultsHTML = document.querySelector('.food_results')
        resultsHTML.innerHTML = generateTableHTML(results)
      })
  })
}

/*
let q = query(foodCol, 
  where("name", ">=", searchTerm),
  where("name", "<=", searchTerm)
)
*/

//main page entry accoutning
// real time collection data
onSnapshot(entryQ, (snapshot) => {
  let entries = []
  snapshot.docs.forEach((doc) => {
    entries.push({ ...doc.data(), id: doc.id })
  } )
  console.log(entries)
})