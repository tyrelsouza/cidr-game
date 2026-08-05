interface CidrChoiceQuery {
  base?: string;
  suffix?: string;
}
interface CidrChoices {
  ip?: string;
  choices?: string[];
  answer?: number;
}
interface CIDR {
  ip?: string
  suffix?: number
}


export {CidrChoiceQuery, CidrChoices, CIDR};