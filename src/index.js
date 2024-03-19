//credit to https://www.youtube.com/@NetNinja for tutorializing firebase
/*\
all code was typed by me for the purposes of my project. 
Some tutorialized code has not changed from the tutiorial, and credit goes
to "NetNinja" for that instruction
*/

import { 
  initializeApp
  } from 'firebase/app';

import { 
  getFirestore, 
  collection, 
  onSnapshot,
  addDoc,
  deleteDoc,
  doc,
  query,
  where,
  orderBy,
  serverTimestamp
  } from 'firebase/firestore';

  /*
import { 
  getAuth
  } from 'firebase/auth';
*/


const firebaseConfig = {
  apiKey: "AIzaSyA3Yyk4IFO2-h7fGTfXYxE8fyNeOhKjUeI",
  authDomain: "nutrition-tracking-app-26132.firebaseapp.com",
  projectId: "nutrition-tracking-app-26132",
  storageBucket: "nutrition-tracking-app-26132.appspot.com",
  messagingSenderId: "844911303258",
  appId: "1:844911303258:web:b6e65fa6b2f64cd8a69663"
};

// init firebase app
initializeApp(firebaseConfig)

// -----------------------------------------------------------------------------



// init services ---------------------------------------------------------------
const db = getFirestore()

// collection ref
const colRef = collection(db, 'biometrics')

//queries
const startDate = new Date('2024-03-01');
const endDate = new Date('2024-03-20');
const q = query(colRef,
  where('datetime', '>=', startDate ),
  where('datetime', '<', endDate ),
  orderBy('datetime', 'desc')
  );


// real time collection data
onSnapshot(q, (snapshot) => {
  let biometrics = []
  snapshot.docs.forEach((doc) => {
    biometrics.push({ ...doc.data(), id: doc.id })
  } )
  console.log(biometrics)
})


  // adding entry
const addBiometric = document.querySelector('.add')
addBiometric.addEventListener('submit', (e) => {
  e.preventDefault()
  const currentTime = serverTimestamp()
  addDoc(colRef, {
    height: addBiometric.height.value,
    weight: addBiometric.weight.value,
    datetime: currentTime
  })
  .then(() =>{
    //console.log(currentTime)
    addBiometric.reset()  
  })
})

  // deleting entry
const deleteBiometric = document.querySelector('.delete')
deleteBiometric.addEventListener('submit', (e) => {
  e.preventDefault()

  const docRef = doc(db, 'biometrics', deleteBiometric.id.value)

  deleteDoc(docRef)
    .then(() => {
      deleteBiometric.reset()
    })

})

