import React, { useState } from 'react';
import './App.css';
import * as firebase from 'firebase/app'
import 'firebase/auth'
import firebaseConfig from './firebase.config';
import { getAuth, signInWithPopup, GoogleAuthProvider, signOut, createUserWithEmailAndPassword, signInWithEmailAndPassword, updateProfile, FacebookAuthProvider } from "firebase/auth";


firebase.initializeApp(firebaseConfig)

function App() {

  const auth = getAuth();
  const googleProvider = new GoogleAuthProvider();
  const facebookProvider = new FacebookAuthProvider();

  const [newUser, setNewUser] = useState(false);

  const [user, setUser] = useState({
    isSignedIn: false,
    name: '',
    email: '',
    password: '',
    photo: '',
    error: '',
    success: false
  })

  // Sign In with Google
  const handleSignIn = () => {
    signInWithPopup(auth, googleProvider)
    .then((result) => {

      // This gives you a Google Access Token. You can use it to access the Google API.
      // const credential = GoogleAuthProvider.credentialFromResult(result);
      // const token = credential.accessToken;
      const {displayName, photoURL, email} = result.user;
      const signedInUser = {
        isSignedIn: true,
        name: displayName,
        email: email,
        photo: photoURL
      }
      setUser(signedInUser);

    }).catch((error) => {
      const errorCode = error.code;
      const errorMessage = error.message;
      const email = error.customData.email;
      const credential = GoogleAuthProvider.credentialFromError(error);

      console.log(errorCode, errorMessage, email, credential);
    });
  }

  // Sign Out with Google
  const handleSignOut = () => {
    signOut(auth).then((res) => {
      const signedOutUser = {
        isSignedIn: false,
        name: '',
        email: '',
        photo: ''
      }
      setUser(signedOutUser);
    }).catch((error) => {
      
    });
  }

  // Save email & password in state
  const handleBlur = (e) => {
    let isFieldValid = true;
    if(e.target.name === 'email') {
      isFieldValid = /\S+@\S+\.\S+/.test(e.target.value);
    }
    if(e.target.name === 'password') {
      const isPasswordValid = e.target.value.length > 5;
      const passwordHasNumber = /\d{1}/.test(e.target.value);
      isFieldValid = isPasswordValid && passwordHasNumber;
    }
    if(isFieldValid) {
      const newUserInfo = {...user};
      newUserInfo[e.target.name] = e.target.value;
      setUser(newUserInfo);
    }
  }

  // Submit form
  const handleSubmit = (event) => {
    event.preventDefault();

    // Sign Up with Email & Password
    if(newUser && user.email && user.password) {
      createUserWithEmailAndPassword(auth, user.email, user.password)
      .then((res) => {
        const newUserInfo = {...user};
        newUserInfo.error = '';
        newUserInfo.success = true;
        setUser(newUserInfo);
        updateUserName(user.name)
      })
      .catch((error) => {
        const newUserInfo = {...user};
        newUserInfo.error = error.message;
        newUserInfo.success = false;
        setUser(newUserInfo);
      });
    }

    // Sign In with Email & Password
    if(!newUser && user.email && user.password) {
      signInWithEmailAndPassword(auth, user.email, user.password)
      .then((res) => {
        // Signed in 
        // const user = userCredential.user;
        const newUserInfo = {...user};
        newUserInfo.error = '';
        newUserInfo.success = true;
        setUser(newUserInfo);
        console.log('sign In User Info', res.user);
      })
      .catch((error) => {
        const newUserInfo = {...user};
        newUserInfo.error = error.message;
        newUserInfo.success = false;
        setUser(newUserInfo);
      });
    }

  }

  // Update a user's profile with Email & Password
  const updateUserName = (name) => {
    updateProfile(auth.currentUser, {
      displayName: name
    }).then(() => {
      console.log('user name updated successfully')
    }).catch((error) => {
      console.log(error)
    });
  }

  // Sign In with Facebook
  const handleFbSignIn = () => {
    signInWithPopup(auth, facebookProvider)
    .then((result) => {
      const user = result.user;
      console.log('FB user after sign-in', user)

      // This gives you a Facebook Access Token. You can use it to access the Facebook API.
      // const credential = FacebookAuthProvider.credentialFromResult(result);
      // const accessToken = credential.accessToken;
    })
    .catch((error) => {

      const errorCode = error.code;
      const errorMessage = error.message;
      const email = error.customData.email;
      const credential = FacebookAuthProvider.credentialFromError(error);
      console.log(errorCode)
      console.log(errorMessage)
      console.log(email)
      console.log(credential)
    });
  }

  return (
    <div className="App">

      { user.isSignedIn ? <button onClick={handleSignOut}>Sign Out</button> : <button onClick={handleSignIn}>Sign In</button> }
      <br />
      <button onClick={handleFbSignIn}>Sign In With Facebook</button>

      {
        user.isSignedIn && <div>
          <img src={user.photo} alt={user.name} />
          <p>Welcome, <b>{user.name}</b></p>
          <p>Email: {user.email}</p>
        </div>
      }

      <h1>Our Own Authentication</h1>
      <input type="checkbox" onChange={() => setNewUser(!newUser)} name="newUser" id="newUser" />
      <label htmlFor="newUser">New User Sign Up</label>

      <form action="" onSubmit={handleSubmit}>
        {newUser && <input type="text" onBlur={handleBlur} name='name' placeholder='Enter Your Name' />}
        <br />
        <input type="type" onBlur={handleBlur} name='email' placeholder='Your Email Address' required />
        <br/>
        <input type="password" onBlur={handleBlur} name="password" placeholder='Your Password' required />
        <br/>
        <input type="submit" value={newUser ? 'Sign Up' : 'Sign In'} />
      </form>

      <p style={{color: 'red'}}>{user.error}</p>
      {user.success && <p style={{color: 'green'}}>User {newUser ? 'created' : 'Logged In'} Successfully.</p>}
       
    </div>
  );
}

export default App;
