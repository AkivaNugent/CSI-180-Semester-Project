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
  updateDoc,
  doc,
  query,
  where,
  orderBy,
  serverTimestamp,
  getDoc
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

// init firebase app
initializeApp(firebaseConfig);

// init services
const db = getFirestore();
const auth = getAuth();
const provider = new GoogleAuthProvider()


// -----------------------------------------------------------------------------
// collection ref
const colRef = collection(db, 'Biometrics');
const foodCol = collection(db, 'Foods');

//queries
const startDate = new Date('2024-03-01');
const endDate = new Date('2024-03-20');
const q = query(colRef,
  //where('datetime', '>=', startDate ),
  //where('datetime', '<', endDate ),
  orderBy('datetime', 'desc')
  );



// real time collection data
const unsubCol = onSnapshot(q, (snapshot) => {
  let biometrics = []
  snapshot.docs.forEach((doc) => {
    biometrics.push({ ...doc.data(), id: doc.id })
  } )
  console.log(biometrics)
})



  // adding entry
const addBiometric = document.querySelector('.add')
if(addBiometric){
  addBiometric.addEventListener('submit', (e) => {
    e.preventDefault()
    const user = auth.currentUser;
    const currentTime = serverTimestamp()
    if(user == null){
      console.log('log in, dipshit')
      alert('you must be logged in to add a biometric')
    } 
    else{
      addDoc(colRef, {
        height: addBiometric.height.value,
        weight: addBiometric.weight.value,
        datetime: currentTime,
        uid: user.uid
      })
      .then(() =>{
        console.log(currentTime)
        addBiometric.reset()  
    })}
    
  })}
  

// deleting entry
const deleteBiometric = document.querySelector('.delete')
if(deleteBiometric){
deleteBiometric.addEventListener('submit', (e) => {
  e.preventDefault()

  const docRef = doc(db, 'biometrics', deleteBiometric.id.value)

  deleteDoc(docRef)
    .then(() => {
      deleteBiometric.reset()
    })

})}

// updating entry
const updateBiometric = document.querySelector('.update')
if(updateBiometric){
updateBiometric.addEventListener('submit', (e) => {
  e.preventDefault()

  const docRef = doc(db, 'biometrics', updateBiometric.id.value)

  updateDoc(docRef, {
    height: '001'
  })
  .then(() => {
    updateBiometric.reset()
  })
})}

// signing up user
const signupForm = document.querySelector('.signup')
if(signupForm){
signupForm.addEventListener('submit', (e) => {
  e.preventDefault()
  //console.log('OBAMNA')

  const email = signupForm.email.value
  const password = signupForm.password.value

  createUserWithEmailAndPassword(auth, email, password)
    .then((cred) => {
      console.log('User Created:', cred.user)
      signupForm.reset();
    })
    .catch((err) => {
      console.log(err.message)
    })
})}

//login user
const loginForm = document.querySelector('.login')
if(loginForm){
loginForm.addEventListener('submit', (e) => {
  e.preventDefault()

  const email = loginForm.email.value
  const password = loginForm.password.value

  signInWithEmailAndPassword(auth, email, password)
    .then((cred) => {
      //console.log('the user is logged in: ', cred.user)
      window.location.href = 'pages/TEMP_dashboard.html'
    })
    .catch((err) => {
      console.log(err.message)
    })
})}

//logout user
const logoutForm = document.querySelector('.logout')
if(logoutForm){
logoutForm.addEventListener('click', () => {
  signOut(auth)
  .then(() => {
    //console.log('the user is signed out')
  })
  .catch((err) => {
    console.log(err.message)
  })
})}

//on auth state change
const unsubAuth = onAuthStateChanged(auth, (user) => {
  console.log('User status: ', user)
})

// Google Auth
const loginWithGoogle = document.querySelector('.googleLogin')
if(loginWithGoogle){
loginWithGoogle.addEventListener('click', () => {
  signInWithPopup(auth, provider)
  .then(() =>{
    redirectToDash()
  })
  .catch((err) => {
    console.log(err.message)
  })
})}

// Unsubscribe from changes (auth and db)
const unsubButton = document.querySelector('.unsub')
if(unsubButton){
unsubButton.addEventListener('click', () => {
  console.log('Unsubscribing')
  unsubCol()
  unsubAuth()
  console.log('Unsubscribed')
})}

// redirect to dashboard
export function redirectToDash() {
  window.location.href = 'pages/dashboard.html'
}
