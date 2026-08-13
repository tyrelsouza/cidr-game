import {useState} from "react";
import './App.css'
import BaseIP from "./components/BaseIP"
import type { CidrChoices } from "@cidr-game/shared";

const apiUrl = import.meta.env.VITE_API_URL ?? "";

function App() {
  const [cidr, setCidr] = useState<CidrChoices>({'ip': '', 'choices': [], answer: -1});
  const [correct, setCorrect] = useState(0);
  const [incorrect, setIncorrect] = useState(0);
  const [total, setTotal] = useState(0);

  function newGame(){
    setIncorrect(0)
    setCorrect(0)
    setTotal(0)
    getNew()
  }

  async function getNew(){
    const resp = await fetch(`${apiUrl}/api/new_ip`);
    const result = await resp.json();
    console.log(result)
    setCidr(result);
  }

  function handleCorrect(){
    setCorrect(correct+1)
    setTotal(total+1)
    getNew();
  }
  function handleIncorrect(){
    setIncorrect(incorrect+1)
    setTotal(total+1)
    getNew();
  }

  return (
    <>
      <h1> CIDR Game </h1>
      <hr />
      <button onClick={() => { newGame() }} > New Game </button>
      {cidr.ip && <h2> SCORE: ✅{correct}/❌{incorrect}</h2>}
      
      <div>
        { cidr.ip && <BaseIP
          cidr={cidr}
          handleCorrect={handleCorrect}
          handleIncorrect={handleIncorrect}
         />
        }
      </div>
    </>
  )
}

export default App
