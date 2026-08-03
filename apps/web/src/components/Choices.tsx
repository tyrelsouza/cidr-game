import { useState } from 'react'

export default function Choices(props) {
  const {question, choices, answer} = props; 
  const checkAnswer = (choice) => {
    if (choice === answer) {
      alert("yay");
    }

  }

  return (
    <>
      <h3>{question}</h3>
      <ul>
        {choices.map((choice)=> (
          <li key={choice.id}>
            <button onClick={() => {checkAnswer(choice.id)}}>
            {choice.ip}
            </button>
          </li>
        ))}
      </ul>
    </>
  )
}

