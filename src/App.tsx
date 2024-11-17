import React, { useState } from "react";
import "./App.css";

// Tipos
type Letter = "B" | "I" | "N" | "G" | "O";
type BingoNumber = { letter: Letter; number: number };

// Gera números por faixa com letras
const generateBingoNumbers = (): BingoNumber[] => {
  const bingoNumbers: BingoNumber[] = [];
  const ranges = {
    B: [1, 15],
    I: [16, 30],
    N: [31, 45],
    G: [46, 60],
    O: [61, 75],
  };

  for (const [letter, [start, end]] of Object.entries(ranges)) {
    for (let i = start; i <= end; i++) {
      bingoNumbers.push({ letter: letter as Letter, number: i });
    }
  }

  return bingoNumbers;
};

// Frases típicas de bingo
const BINGO_PHRASES: string[] = [
  "Atenção, atenção, preparem suas cartelas. Lá vem o primeiro número!",
  "Lá vai o número, quem será o sortudo da vez?",
  "Será que sua sorte está a caminho?",
  "Prestem atenção, o próximo número vai mudar o jogo!",
  "Quem está perto de ganhar? Vamos descobrir!",
  "Cruzando os dedos, lá vem mais um!",
  "Já conferiu sua cartela? O próximo número está chegando!",
  "É agora! Quem vai gritar bingo primeiro?",
  "Olhos nas cartelas! Será o seu número?",
  "Respirem fundo... o próximo número vai sair!",
  "Será que a sorte está do seu lado hoje?",
  "Vamos girar e descobrir a sorte do momento!",
  "Segurem a emoção, o próximo número está a caminho!",
  "Alguém aí já está com uma linha quase cheia?",
  "Parece que a sorte está no ar... próximo número chegando!",
  "A cada número, a emoção só aumenta!",
  "Não percam a esperança, a sorte pode estar no próximo!",
  "Será que é agora que o grito de bingo sai?",
  "Quem está na frente?",
  "Mais um número para esquentar a competição!",
  "Todos de olho na tela, lá vem mais um número!",
  "Quem será o sortudo que vai gritar bingo hoje?",
  "Sente o suspense... lá vem mais um número!",
  "Coração acelerado? Mais um número no ar!",
  "Será que esse é o número que você estava esperando?",
];

const App: React.FC = () => {
  const [bingoNumbers, setBingoNumbers] = useState<BingoNumber[]>(
    generateBingoNumbers()
  );
  const [drawnNumbers, setDrawnNumbers] = useState<BingoNumber[]>([]);
  const [currentDraw, setCurrentDraw] = useState<BingoNumber | null>(null);
  const [phrase, setPhrase] = useState<string>("Bem-vindo ao Bingo Online!");
  const [isSpeaking, setIsSpeaking] = useState<boolean>(false);

  // Fala uma frase com controle de fala
  const speak = (text: string): void => {
    speechSynthesis.cancel(); // Cancela qualquer fala em andamento
    setIsSpeaking(true);

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = 0.9; // Velocidade fixa
    utterance.pitch = 1; // Tom fixo
    utterance.lang = "pt-BR"; // Configura para português do Brasil
    utterance.onend = () => setIsSpeaking(false); // Libera após terminar a fala

    speechSynthesis.speak(utterance);
  };

  const drawNumber = (): void => {
    if (bingoNumbers.length === 0) {
      setPhrase("Todos os números já foram sorteados!");
      return;
    }

    const randomIndex = Math.floor(Math.random() * bingoNumbers.length);
    const nextDraw = bingoNumbers[randomIndex];

    // Verifica o tamanho de drawnNumbers antes de atualizá-lo
    const isFirstDraw = drawnNumbers.length === 0;

    setBingoNumbers(bingoNumbers.filter((_, index) => index !== randomIndex));
    setDrawnNumbers([...drawnNumbers, nextDraw]);
    setCurrentDraw(nextDraw);

    if (isFirstDraw) {
      const firstPhrase = "Atenção, atenção, preparem suas cartelas. Lá vem o primeiro número!";
      setPhrase(firstPhrase); // Exibe a frase inicial

      const utterance = new SpeechSynthesisUtterance(firstPhrase);
      utterance.rate = 0.9;
      utterance.pitch = 1;
      utterance.lang = "pt-BR";
      utterance.onend = () => {
        // Após falar a frase inicial, anuncia o número sorteado
        announceNumber(nextDraw);
      };

      speechSynthesis.cancel(); // Cancela qualquer fala anterior
      speechSynthesis.speak(utterance);
    } else {
      announceNumber(nextDraw); // Anuncia o número normalmente
    }
  };


  // Repete apenas o número atual
  const repeatNumber = (): void => {
    if (currentDraw) {
      const letterForSpeech = currentDraw.letter === "O" ? "Ó" : currentDraw.letter;
      const repeatPhrase = `Letra ${letterForSpeech}, número ${currentDraw.number}.`;
      speak(repeatPhrase);
    }
  };

  // Reinicia o jogo
  const resetGame = (): void => {
    setBingoNumbers(generateBingoNumbers());
    setDrawnNumbers([]);
    setCurrentDraw(null);
    setPhrase("Bem-vindo ao Bingo Online!");
  };

  // Função para anunciar o número com frases específicas e aleatórias juntas
  const announceNumber = (draw: BingoNumber): void => {
    const specificPhrases: Record<number, string> = {
      1: "Começou o jogo, letra B número 1.",
      5: "Aperte o cinto, letra B número 5.",
      10: "É o craque da bola, número 10, letra B número 10.",
      22: "Dois patinhos na lagoa, letra I número 22.",
      33: "Idade de Cristo, letra N número 33.",
      45: "Fim do primeiro tempo, letra N número 45.",
      51: "Opa, uma boa ideia, letra G número 51.",
      75: "Terminou o jogo, letra O número 75.",
    };

    const letterForSpeech = draw.letter === "O" ? "Ó" : draw.letter;

    // Define a frase do número
    const numberPhrase = specificPhrases[draw.number]
      ? specificPhrases[draw.number]
      : `Letra ${letterForSpeech}, número ${draw.number}.`;

    // Define uma frase aleatória apenas após o quinto número sorteado
    const randomPhrase =
      drawnNumbers.length >= 5
        ? BINGO_PHRASES[Math.floor(Math.random() * BINGO_PHRASES.length)]
        : "";

    // Combina as frases se aplicável
    const combinedPhrase = randomPhrase
      ? `${randomPhrase} ${numberPhrase}`
      : numberPhrase;

    speak(combinedPhrase);
    setPhrase(combinedPhrase);
  };

  return (
    <div className="bingo-app">
      <h1>Bingo de Natal 🎄</h1>
      <p className="phrase">{phrase}</p>
      <div className="current-number">
        <h2>
          {currentDraw
            ? `Letra ${currentDraw.letter}, Número ${currentDraw.number}`
            : "Clique em 'Sortear Número' para começar!"}
        </h2>
      </div>
      <div className="controls">
        <button onClick={drawNumber} disabled={isSpeaking || bingoNumbers.length === 0}>
          Sortear Número
        </button>
        <button onClick={repeatNumber} disabled={!currentDraw || isSpeaking}>
          Repetir Número
        </button>
        <button onClick={resetGame}>Reiniciar Jogo</button>
      </div>
      <div className="drawn-numbers">
        <h3>Números Sorteados:</h3>
        <p>
          {drawnNumbers.length > 0
            ? drawnNumbers
              .map((draw) => `${draw.letter}${draw.number}`)
              .join(", ")
            : "Nenhum número sorteado ainda."}
        </p>
      </div>
    </div>
  );
};

export default App;
