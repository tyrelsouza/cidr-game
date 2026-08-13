interface CidrChoiceQuery {
  base?: string;
  suffix?: string;
}
interface CidrChoices {
  ip?: string;
  suffix?: number;
  choices?: string[];
  answer?: number;
}
interface CIDR {
  ip?: string
  suffix?: number
}


export type {CidrChoiceQuery, CidrChoices, CIDR};
