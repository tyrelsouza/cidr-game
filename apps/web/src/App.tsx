import {useState} from "react";
import './App.css'
import Choices from "./components/Choices"


function App() {
  const [cidr, setCidr] = useState({});
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
    const resp = await fetch("/api/new_ip");
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
      <Choices
        cidr={cidr}
        handleCorrect={handleCorrect}
        handleIncorrect={handleIncorrect}
       />
      <h4>{correct}/{incorrect}</h4>
    </>
  )
}

export default App
