import './App.css'
import Choices from "./components/Choices"


function App() {


  return (
    <>
      <h1> CIDR Game </h1>
      <p> <a href="/login"> Login </a> </p>
      <hr />
      <Choices
        question="10.0.15.130/16"
        choices={[
          {id: 1, ip:"10.0.14.1"},
          {id:2, ip:"10.10.15.128"},
          {id:3, ip:"10.10.15.130"}
        ]}
        answer={2} />
    </>
  )
}

export default App
