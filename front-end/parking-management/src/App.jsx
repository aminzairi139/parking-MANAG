import { useState } from "react";
import reactLogo from "./assets/react.svg";
import viteLogo from "/vite.svg";
import "./App.css";

function App() {
  const [count, setCount] = useState(0);
  const [email, setEmail] = useState("");
  const [emailError, setEmailError] = useState("");

  const validateEmail = (value) => {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(value);
  };

  const handleEmailChange = (e) => {
    const val = e.target.value;
    setEmail(val);
    if (!val) {
      setEmailError("");
      return;
    }
    if (!validateEmail(val)) {
      setEmailError("Email invalide");
    } else {
      setEmailError("");
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!email) {
      setEmailError("Veuillez saisir un email");
      return;
    }
    if (!validateEmail(email)) {
      setEmailError("Email invalide");
      return;
    }
    // email valide — ici on peut envoyer le formulaire
    // pour l'instant on affiche dans la console
    console.log("Email soumis :", email);
    alert("Email soumis : " + email);
  };

  return (
    <>
      <div>
        <a href="https://vite.dev" target="_blank">
          <img src={viteLogo} className="logo" alt="Vite logo" />
        </a>
        <a href="https://react.dev" target="_blank">
          <img src={reactLogo} className="logo react" alt="React logo" />
        </a>
      </div>
      <h1>Vite + React</h1>
      <div className="card">
        <form onSubmit={handleSubmit} className="formulaire">
          <div className="groupe-champ">
            <label className="libelle-champ">Email</label>
            <input
              type="email"
              value={email}
              onChange={handleEmailChange}
              className={`champ-saisie ${emailError ? "error" : ""}`}
              placeholder="votre@exemple.com"
            />
            {emailError && (
              <span className="indication" style={{ color: "#ef4444" }}>
                {emailError}
              </span>
            )}
          </div>
          <div style={{ display: "flex", gap: 12 }}>
            <button type="submit" className="bouton-connexion">
              Envoyer
            </button>
            <button
              type="button"
              onClick={() => {
                setEmail("");
                setEmailError("");
              }}
              className="lien-inscription"
            >
              Effacer
            </button>
          </div>
        </form>

        <div style={{ marginTop: 16 }}>
          <button onClick={() => setCount((count) => count + 1)}>
            count is {count}
          </button>
          <p>
            Edit <code>src/App.jsx</code> and save to test HMR
          </p>
        </div>
      </div>
      <p className="read-the-docs">
        Click on the Vite and React logos to learn more
      </p>
    </>
  );
}

export default App;
