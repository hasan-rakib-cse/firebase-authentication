import React, { useState } from 'react';
import './App.css';
import * as firebase from 'firebase/app'
import 'firebase/auth'
import firebaseConfig from './firebase.config';
import { getAuth, signInWithPopup, GoogleAuthProvider, signOut } from "firebase/auth";


firebase.initializeApp(firebaseConfig)

function App() {

  const [user, setUser] = useState({
    isSignedIn: false,
    name: '',
    email: '',
    password: '',
    photo: ''
  })

  const auth = getAuth();
  const provider = new GoogleAuthProvider();

  const handleSignIn = () => {
    signInWithPopup(auth, provider)
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

  const handleSubmit = (event) => {
    event.preventDefault();
    if(user.email && user.password) {
      console.log('submitting')
    }

  }

  return (
    <div className="App">

      { user.isSignedIn ? <button onClick={handleSignOut}>Sign Out</button> : <button onClick={handleSignIn}>Sign In</button> }

      {
        user.isSignedIn && <div>
          <img src={user.photo} alt={user.name} />
          <p>Welcome, <b>{user.name}</b></p>
          <p>Email: {user.email}</p>
        </div>
      }

      <h1>Our Own Authentication</h1>
      <form action="" onSubmit={handleSubmit}>
        <input type="text" onBlur={handleBlur} name='name' placeholder='Enter Your Name' />
        <br />
        <input type="type" onBlur={handleBlur} name='email' placeholder='Your Email Address' required />
        <br/>
        <input type="password" onBlur={handleBlur} name="password" placeholder='Your Password' required />
        <br/>
        <input type="submit" value="Submit" />
      </form>
    </div>
  );
}

export default App;
