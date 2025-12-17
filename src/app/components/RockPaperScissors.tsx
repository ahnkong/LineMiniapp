"use client";
import { useState } from "react";
import {
  ConnectButton,
  TransactionButton,
  useActiveAccount,
  useActiveWallet,
  useDisconnect,
  useReadContract,
} from "thirdweb/react";
import { client } from "../client";
import { inAppWallet } from "thirdweb/wallets";
import { shortenAddress } from "thirdweb/utils";
import { getContract } from "thirdweb";
import { baseSepolia } from "thirdweb/chains";
import { claimTo, getBalance } from "thirdweb/extensions/erc20";

type Choice = "Rock" | "Paper" | "Scissors";
type Result = "Win" | "Lose" | "Tie";

const choices: Choice[] = ["Rock", "Paper", "Scissors"];

const getComputerChoice = (): Choice =>
  choices[Math.floor(Math.random() * choices.length)];

const determineWinner = (
  playerChoice: Choice,
  computerChoice: Choice
): Result => {
  if (playerChoice === computerChoice) return "Tie";
  if (
    (playerChoice === "Rock" && computerChoice === "Scissors") ||
    (playerChoice === "Paper" && computerChoice === "Rock") ||
    (playerChoice === "Scissors" && computerChoice === "Paper")
  ) {
    return "Win";
  }
  return "Lose";
};

interface GameResult {
  playerChoice: Choice;
  computerChoice: Choice;
  gameResult: Result;
}

// Component to handle token balance reading
function TokenBalance({ 
  contract, 
  address 
}: { 
  contract: ReturnType<typeof getContract>; 
  address: `0x${string}`;
}) {
  const { data: tokenbalance } = useReadContract(getBalance, {
    contract: contract,
    address: address,
  });
  return (
    <p className="text-xs text-gray-400 font-medium">
      Balance: <span className="text-[#00C300] font-semibold">{tokenbalance?.displayValue || "0"}</span>
    </p>
  );
}

export default function RockPaperScissors() {
  const account = useActiveAccount();
  const { disconnect } = useDisconnect();
  const wallet = useActiveWallet();

  const tokenContractAddress = process.env.NEXT_PUBLIC_TOKEN_CONTRACT;
  const hasTokenContract = !!tokenContractAddress && !!tokenContractAddress.trim();

  const contract = hasTokenContract && tokenContractAddress
    ? getContract({
        client: client,
        chain: baseSepolia,
        address: tokenContractAddress as `0x${string}`,
      })
    : null;

  const [result, setResult] = useState<GameResult | null>(null);
  const [showPrize, setShowPrize] = useState<boolean>(false);
  const [showModal, setShowModal] = useState<boolean>(false);
  const [prizeClaimed, setPrizeClaimed] = useState<boolean>(false);
  const [gameCount, setGameCount] = useState<number>(0);
  const [wins, setWins] = useState<number>(0);
  const [losses, setLosses] = useState<number>(0);
  const [ties, setTies] = useState<number>(0);
  const [gameFinished, setGameFinished] = useState<boolean>(false);

  const MAX_GAMES = 10;

  const handleChoice = (playerChoice: Choice) => {
    if (gameFinished) return;
    
    const computerChoice = getComputerChoice();
    const gameResult = determineWinner(playerChoice, computerChoice);
    setResult({ playerChoice, computerChoice, gameResult });
    setShowPrize(gameResult === "Win" && hasTokenContract);

    // 전적 카운팅
    if (gameResult === "Win") {
      setWins(prev => prev + 1);
    } else if (gameResult === "Lose") {
      setLosses(prev => prev + 1);
    } else {
      setTies(prev => prev + 1);
    }

    // 게임 횟수 증가
    const newGameCount = gameCount + 1;
    setGameCount(newGameCount);

    // 10판이 끝나면 게임 종료
    if (newGameCount >= MAX_GAMES) {
      setGameFinished(true);
    }
  };

  const resetGame = () => {
    if (gameFinished) {
      // 게임이 끝났을 때는 전체 초기화
      setResult(null);
      setShowPrize(false);
      setPrizeClaimed(false);
      setGameCount(0);
      setWins(0);
      setLosses(0);
      setTies(0);
      setGameFinished(false);
    } else {
      // 게임 진행 중일 때는 결과만 초기화
      setResult(null);
      setShowPrize(false);
      setPrizeClaimed(false);
    }
  };

  const claimPrize = () => {
    if (hasTokenContract && contract) {
      setShowModal(true);
    }
  };

  return (
    <div className="flex flex-col items-center min-h-screen w-screen bg-black px-[5%] py-8 gap-6">
      <div className="w-full max-w-md">
        {/* Account Info Container */}
        {account && (
          <div className="bg-gray-900 rounded-3xl shadow-2xl p-6 border border-gray-800 mb-6 min-h-[100px] flex items-center">
            <div className="flex items-center w-full gap-4">
              {/* Profile Icon */}
              <div className="w-16 h-16 bg-gray-800 rounded-full flex items-center justify-center flex-shrink-0">
                <span className="text-3xl">👤</span>
              </div>
              
              {/* Account Info */}
              <div className="flex-1 min-w-0">
                <p className="text-base font-semibold text-white mb-1 truncate">
                  {shortenAddress(account.address)}
                </p>
                {hasTokenContract && contract && account?.address && (
                  <TokenBalance 
                    contract={contract} 
                    address={account.address as `0x${string}`} 
                  />
                )}
              </div>
              
              {/* Logout Button */}
              <button
                onClick={() => disconnect(wallet!)}
                className="px-5 py-2.5 bg-red-600 text-white rounded-xl text-sm font-semibold hover:bg-red-700 transition-all duration-200 flex-shrink-0"
              >
                로그아웃
              </button>
            </div>
          </div>
        )}

        {/* Main Game Card */}
        <div className="bg-gray-900 rounded-3xl shadow-2xl p-8 border border-gray-800 min-h-[500px] flex flex-col">
          {!account ? (
            <div className="text-center py-12 flex-1 flex flex-col justify-center">
              <h1 className="text-3xl font-bold text-[#00C300] mb-4">
                가위바위보 게임
              </h1>
              <p className="text-gray-400 mb-8 text-sm">지갑을 연결하고 게임을 시작하세요</p>
              <div className="transform hover:scale-105 transition-transform duration-200">
                <ConnectButton
                  client={client}
                  accountAbstraction={{
                    chain: baseSepolia,
                    sponsorGas: true,
                  }}
                  wallets={[
                    inAppWallet({
                      auth: {
                        options: ["email"],
                      },
                    }),
                  ]}
                />
              </div>
            </div>
          ) : (
            <div className="flex-1 flex flex-col">
              <h1 className="text-3xl font-bold text-[#00C300] text-center mb-8">
                가위바위보
              </h1>
              
              {gameFinished ? (
                <div className="space-y-6 flex-1 flex flex-col justify-center text-center">
                  <div className="text-6xl mb-4">🎊</div>
                  <h2 className="text-2xl font-bold text-[#00C300] mb-2">10판 완료!</h2>
                  <p className="text-gray-400 mb-6">게임이 종료되었습니다</p>
                  <button
                    onClick={resetGame}
                    className="w-full py-4 bg-[#00C300] text-white rounded-2xl font-semibold shadow-lg shadow-[#00C300]/30 hover:bg-[#00B300] transition-all duration-200 hover:scale-[1.02] active:scale-98"
                  >
                    새 게임 시작
                  </button>
                </div>
              ) : !result ? (
                <div className="space-y-10 flex-1 flex flex-col justify-center">
                  <div className="text-center mb-4">
                    <h3 className="text-lg font-semibold text-gray-300 mb-2">선택하세요</h3>
                    <p className="text-sm text-gray-500">
                      {gameCount}/{MAX_GAMES}판 진행 중
                    </p>
                  </div>
                  <div className="flex justify-center gap-6">
                    {choices.map((choice) => (
                      <button
                        key={choice}
                        onClick={() => handleChoice(choice)}
                        className="w-32 h-32 rounded-3xl flex items-center justify-center transition-all duration-300 hover:scale-110 hover:-translate-y-2 active:scale-95 hover:bg-gray-800"
                      >
                        <span className="text-7xl">
                          {choice === "Rock"
                            ? "✊"
                            : choice === "Paper"
                            ? "✋"
                            : "✌️"}
                        </span>
                      </button>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="space-y-8 flex-1 flex flex-col justify-center">
                  {/* Result Display */}
                  <div className="text-center space-y-6">
                    <div className="flex items-center justify-center gap-6 mb-8">
                      <div className="flex flex-col items-center">
                        <div className="w-28 h-28 rounded-2xl flex items-center justify-center mb-2">
                          <span className="text-7xl">
                            {result.playerChoice === "Rock"
                              ? "✊"
                              : result.playerChoice === "Paper"
                              ? "✋"
                              : "✌️"}
                          </span>
                        </div>
                        <p className="text-sm text-gray-400 font-semibold">나</p>
                      </div>
                      <div className="text-3xl text-gray-500 font-bold">VS</div>
                      <div className="flex flex-col items-center">
                        <div className="w-28 h-28 rounded-2xl flex items-center justify-center mb-2">
                          <span className="text-7xl">
                            {result.computerChoice === "Rock"
                              ? "✊"
                              : result.computerChoice === "Paper"
                              ? "✋"
                              : "✌️"}
                          </span>
                        </div>
                        <p className="text-sm text-gray-400 font-semibold">컴퓨터</p>
                      </div>
                    </div>

                    <div className={`inline-block px-8 py-4 rounded-2xl font-bold text-2xl ${
                      result.gameResult === "Win"
                        ? "bg-[#00C300] text-white shadow-lg shadow-[#00C300]/30"
                        : result.gameResult === "Lose"
                        ? "bg-red-600 text-white shadow-lg shadow-red-600/30"
                        : "bg-gray-700 text-white shadow-lg"
                    }`}>
                      {result.gameResult === "Win" ? "🎉 승리!" : result.gameResult === "Lose" ? "😢 패배" : "🤝 무승부"}
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex flex-col gap-3 pt-4">
                    {gameFinished ? (
                      <button
                        onClick={resetGame}
                        className="w-full py-4 bg-[#00C300] text-white rounded-2xl font-semibold shadow-lg shadow-[#00C300]/30 hover:bg-[#00B300] transition-all duration-200 hover:scale-[1.02] active:scale-98"
                      >
                        새 게임 시작
                      </button>
                    ) : (
                      <>
                        <button
                          onClick={resetGame}
                          className="w-full py-4 bg-[#00C300] text-white rounded-2xl font-semibold shadow-lg shadow-[#00C300]/30 hover:bg-[#00B300] transition-all duration-200 hover:scale-[1.02] active:scale-98"
                        >
                          {gameCount < MAX_GAMES ? "다시 하기" : "결과 보기"}
                        </button>

                        {showPrize && !prizeClaimed && (
                          <button
                            onClick={claimPrize}
                            className="w-full py-4 bg-yellow-500 text-white rounded-2xl font-semibold shadow-lg shadow-yellow-500/30 hover:bg-yellow-600 transition-all duration-200 hover:scale-[1.02] active:scale-98"
                          >
                            🎁 상품 받기
                          </button>
                        )}
                      </>
                    )}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Statistics Container */}
        {account && gameCount > 0 && (
          <div className="bg-gray-900 rounded-3xl shadow-2xl p-6 border border-gray-800 mt-6">
            <h3 className="text-lg font-bold text-[#00C300] mb-4 text-center">전적</h3>
            <div className="grid grid-cols-3 gap-4">
              <div className="text-center">
                <p className="text-2xl font-bold text-[#00C300]">{wins}</p>
                <p className="text-xs text-gray-400 mt-1">승</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-gray-400">{ties}</p>
                <p className="text-xs text-gray-400 mt-1">무</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-red-500">{losses}</p>
                <p className="text-xs text-gray-400 mt-1">패</p>
              </div>
            </div>
            {gameCount === MAX_GAMES && (
              <div className="mt-4 pt-4 border-t border-gray-800">
                <p className="text-center text-sm text-gray-400">
                  승률: <span className="text-[#00C300] font-semibold">
                    {wins > 0 ? Math.round((wins / MAX_GAMES) * 100) : 0}%
                  </span>
                </p>
              </div>
            )}
          </div>
        )}

        {/* Modal */}
        {showModal && hasTokenContract && contract && (
          <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex justify-center items-center z-50 p-4 animate-in fade-in duration-200">
            <div className="bg-gray-900 rounded-3xl shadow-2xl max-w-sm w-full p-8 text-center border border-gray-800 animate-in zoom-in-95 duration-200">
              <div className="text-6xl mb-4">🎉</div>
              <h2 className="text-2xl font-bold text-[#00C300] mb-2">10 토큰 획득!</h2>
              <p className="text-gray-400 mb-6 text-sm">
                승리하셨습니다! 지갑으로 토큰을 받아보세요.
              </p>

              <TransactionButton
                transaction={() =>
                  claimTo({
                    contract: contract,
                    to: account!.address,
                    quantity: "10",
                  })
                }
                onTransactionConfirmed={() => {
                  alert("토큰을 받았습니다! 🎉");
                  setShowModal(false);
                  setPrizeClaimed(true);
                }}
                className="w-full py-4 bg-[#00C300] text-white rounded-2xl font-semibold shadow-lg shadow-[#00C300]/30 hover:bg-[#00B300] transition-all duration-200 hover:scale-[1.02] active:scale-98"
              >
                토큰 받기
              </TransactionButton>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
