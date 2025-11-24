declare module 'pokersolver' {
  interface Hand {
    name: string;
    rank: number;
  }
  
  function solve(cardArrays: string[][]): Hand[];
  
  export = { solve };
}
