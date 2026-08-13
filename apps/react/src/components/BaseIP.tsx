import { useState, useEffect } from 'react'
import type { CidrChoices } from '@cidr-game/shared';

const apiUrl = import.meta.env.VITE_API_URL ?? "";

type BaseIPProps = {
  cidr: CidrChoices;
  handleCorrect?: () => void;
  handleIncorrect?: () => void;
};

export default function BaseIP(props: BaseIPProps) {
  const [choices, setChoices] = useState<string[]>([]);
  const [answer, setAnswer] = useState(0);
  const {cidr} = props; 

  useEffect(() => {
     const handleNewQuestion = async (cidr: CidrChoices) => {
        const {ip, suffix} = cidr
        if (ip !== undefined && suffix !== undefined) {
          const resp = await fetch(`${apiUrl}/api/generate?base=${ip}&suffix=${suffix}`);
          const result = await resp.json();
          setChoices(result.choices ?? []);
          setAnswer(result.answer ?? -1);
        }
     }
     if (props.cidr){
       handleNewQuestion(props.cidr);
     }
  }, [cidr]);

  const check = (idx: number) => {
      if(idx === answer){
        props.handleCorrect?.();
      } else {
        props.handleIncorrect?.();
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
