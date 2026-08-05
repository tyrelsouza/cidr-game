import { useState, useEffect } from 'react'

export default function BaseIP(props) {
  const [choices,  setChoices] = useState([]);
  const [answer, setAnswer] = useState(0);
  const {cidr} = props; 

  useEffect(() => {
     const handleNewQuestion = async (cidr) => {
        const {ip, suffix} = cidr
        if (ip !== undefined) {
          const resp = await fetch(`/api/generate?base=${ip}&suffix=${suffix}`);
          const result = await resp.json();
          setChoices(result.choices);
          setAnswer(result.answer);
        }
     }
     if (props.cidr){
       handleNewQuestion(props.cidr);
     }
  }, [cidr]);

  const check = (idx: number) => {
      if(idx === answer){
        props.handleCorrect();
      } else {
        props.handleIncorrect();
      }
  }

  return (
    <>
      <h3>{cidr.ip}/{cidr.suffix}</h3>
      <p> What is the Base IP?</p>
        {choices?.map((choice, idx)=> (
            <button key={idx} onClick={() => { check(idx) }}> {choice} </button>
        ))}
    </>
  )
}

