import React, { useEffect, useState } from 'react';
import MessagesDisplay from './components/MessagesDisplay';
import MessageForm from './components/MessageForm';
import AccountManagement from './components/AccountManagement';

import './App.css';
import LogoImage from './secret-messages-logo.png';
import MessagesContext from './contexts/MessagesContext';
import AccountContext from './contexts/AccountContext';

// EXERCISE 4.1
const hostURL = "https://localhost:3002";

const apiSignup = hostURL+ "/signup";
const apiLogin = hostURL+ "/login";
const apiLogout = hostURL+ "/logout";
const apiPostNew = hostURL+ "/message";
const apiGetAll = hostURL+ "/";
const apiUpdateOne = hostURL+ "/message/";
const apiDeleteOne = hostURL+ "/message/";

const postSignupParams = {
  headers: { 'Content-Type': 'application/json' },
  method: 'POST',
  credentials: 'include'
};
const postLoginParams = {
  headers: { 'Content-Type': 'application/json' },
  method: 'POST',
  credentials: 'include'
};
const postLogoutParams = {
  headers: { 'Content-Type': 'application/json' },
  method: 'POST',
  credentials: 'include'
};
const postNewParams = {
  headers: { 'Content-Type': 'application/json' },
  method: 'POST',
  credentials: 'include'
};
const getAllParams = {
  method: 'GET',
  credentials: 'include'
}
const updateOneParams = {
  headers: { 'Content-Type': 'application/json' },
  method: 'PATCH',
  credentials: 'include'
};
const deleteOneParams = {
  method: 'DELETE',
  credentials: 'include'
};

function App(props) {
  const [loggedInUser, setLoggedInUser] = useState("");
  const [messages, showMessages] = useState([]);
  const [isSecret, setSecret] = useState(false);

  async function signupUser(user) {
    try {
      const postSignupParamsWithBody = {
        ...postSignupParams,
        body: JSON.stringify(user)
      };

      const response = await fetch(apiSignup, postSignupParamsWithBody);
      if (response.status === 201) {
        setLoggedInUser(user.username);
        saveLocalAccountData(user.username);

        return true;
      }
    } catch (error) {
      console.error(error);
    }

    return false;
  }

  async function loginUser(user) {
    try {
      const postLoginParamsWithBody = {
        ...postLoginParams,
        body: JSON.stringify(user)
      };

      const response = await fetch(apiLogin, postLoginParamsWithBody);
      if (response.status === 200) {
        setLoggedInUser(user.username);
        saveLocalAccountData(user.username);

        return true;
      }
    } catch (error) {
      console.error(error);
    }

    return false;
  }

  async function logoutUser() {
    try {
      const response = await fetch(apiLogout, postLogoutParams);
      if (response.status === 200) {
        setLoggedInUser("");
        clearLocalAccountData();

        return true;
      }
    } catch (error) {
      console.error(error);
    }

    return false;
  }

  function loadLocalAccountData() {
    const username = localStorage.getItem("username");
    if (username !== null) {
      setLoggedInUser(username);
    }
  }

  function saveLocalAccountData(username) {
    localStorage.setItem("username", username);
  }

  function clearLocalAccountData() {
    localStorage.removeItem("username");
  }

  async function newMessage(message) {
    try {
      message.date = (new Date()).toISOString();

      const postNewParamsWithBody = {
        ...postNewParams,
        body: JSON.stringify(message)
      };

      const response = await fetch(apiPostNew, postNewParamsWithBody);
      if (response.status === 201) {
        if (message.secret === isSecret) {
          showMessages([message, ...messages]);  
        }
      }
    } catch (error) {
      console.error(error);
    }
  }
  async function getMessages(isSecret) {
    try {
      const response = await fetch(apiGetAll + isSecret, getAllParams);
      if (response.status === 200) {
        let receivedMessages = await response.json();
        showMessages(receivedMessages);
        setSecret(JSON.parse(isSecret));
      }
    } catch (error) {
      console.error(error);
    }
  }
  async function updateMessage(messageId, newMessage) {
    try {
      const now = (new Date()).toISOString();

      const response = await fetch(apiUpdateOne + messageId, {
        ...updateOneParams,
        body: JSON.stringify({
          message: newMessage,
          date: now
        })
      });
      if (response.status === 200) {
        const message = messages.find(message => message._id === messageId);
        message.message = newMessage;
        message.date = now;
        showMessages([...messages]);
      }
    } catch (error) {
      console.error(error);
    }
  }
  async function deleteMessage(messageId) {
    try {
      const response = await fetch(apiDeleteOne + messageId, deleteOneParams);
      if (response.status === 200) {
        const messageIndex = messages.findIndex(message => message._id === messageId);
        messages.splice(messageIndex, 1);
        showMessages([...messages]);
      }
    } catch (error) {
      console.error(error);
    }
  }

  useEffect(() => {
    if (props.secrets === true) {
      if (loggedInUser !== "") {
        getMessages("true");
      }
    }
    else {
      getMessages("false");
    }
  }, [props, loggedInUser]); // This will activate any time App itself gets re-rendered

  useEffect(() => {
    loadLocalAccountData();
  }, []);

  return (
    <AccountContext.Provider value={{loggedInUser, signupUser, loginUser, logoutUser}}>
      <MessagesContext.Provider value={{messages, newMessage, getMessages, updateMessage, deleteMessage}}>
        <header>
          <nav id="branding">
            <img id="logo" src={LogoImage} alt="Secret Messages App" />
            <h1 id="title">Secret Messages</h1>
          </nav>
          <AccountManagement />
        </header>
        <div id="main">
          <MessagesDisplay secrets={props.secrets} />
          <MessageForm />
        </div>
        <footer>
            <p>&copy; 2024 Secret Messages</p>
        </footer>
      </MessagesContext.Provider>
    </AccountContext.Provider>
  );
}

export default App;
