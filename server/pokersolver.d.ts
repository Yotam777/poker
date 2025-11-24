declare module 'pokersolver' {
  export interface Hand {
    name: string;
    rank: number;
  }
  
  export function solve(cardArrays: string[][]): Hand[];
}
