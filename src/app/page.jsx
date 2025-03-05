"use client";

import { useEffect, useRef, useState } from "react";
import styles from "./styles/Game.module.css";
import Head from "next/head";
import html2canvas from "html2canvas";
import Image from "next/image";

const colors = ["Red", "Blue", "Green", "Yellow"];

function generateRandomColors() {
  return Array.from(
    { length: 4 },
    () => colors[Math.floor(Math.random() * colors.length)]
  );
}

export default function PlayPage() {
  const [targetColors, setTargetColors] = useState(generateRandomColors);
  const [guesses, setGuesses] = useState([]);
  const [input, setInput] = useState([null, null, null, null]);
  const [selectedIndex, setSelectedIndex] = useState(0);

  const [showModal, setShowModal] = useState(false);

  const [timer, setTimer] = useState(0);
  const [isTimerRunning, setIsTimerRunning] = useState(false);
  const [isGameOver, setIsGameOver] = useState(false);

  const [showHowToPlay, setShowHowToPlay] = useState(false);

  useEffect(() => {
    setShowHowToPlay(true);
  }, [])

  useEffect(() => {
    let interval;
    if (isTimerRunning) {
      interval = setInterval(() => {
        setTimer((prev) => prev + 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isTimerRunning]);

  const startTimer = () => {
    if (!isTimerRunning) setIsTimerRunning(true);
  };

  const handleCircleClick = (color) => {
    if (selectedIndex > 3) return;
    const newInput = [...input];
    newInput[selectedIndex] = color;
    setInput(newInput);
    setSelectedIndex(selectedIndex + 1);
  };

  const handleRemoveLast = () => {
    if (selectedIndex > 0) {
      const newInput = [...input];
      newInput[selectedIndex - 1] = null;
      setInput(newInput);
      setSelectedIndex(selectedIndex - 1);
    }
  };

  const handleSubmit = () => {
   
    if (input.includes(null)) {
      return;
    }

    if (guesses.length === 0) startTimer();

    const feedback = [];
    const targetCopy = [...targetColors]; // Copy of the target colors to mark processed indices

    // First pass: Add green squares for correct positions
    input.forEach((color, idx) => {
      if (color === targetColors[idx]) {
        feedback.push("green");
        targetCopy[idx] = null; // Mark the position as processed
      }
    });

    // Second pass: Add yellow squares for correct colors in wrong positions
    input.forEach((color, idx) => {
      if (color !== targetColors[idx] && targetCopy.includes(color)) {
        feedback.push("yellow");
        targetCopy[targetCopy.indexOf(color)] = null; // Mark the color as used
      }
    });

    // Fill the rest with empty squares
    while (feedback.length < 4) {
      feedback.push("empty");
    }

    const correct = input.filter(
      (color, index) => color === targetColors[index]
    ).length;

    setGuesses([...guesses, { guess: [...input], correct, feedback }]);

    if (correct === 4) {
      setShowModal(true);
      setIsTimerRunning(false);
      setIsGameOver(false);
    } else if (guesses.length === 7) {
      setShowModal(true);
      setIsTimerRunning(false);
      setIsGameOver(true);
    }

    setInput([null, null, null, null]);
    setSelectedIndex(0);
  };

  const closeModal = () => {
    setShowModal(false);
    setTargetColors(generateRandomColors);
    setGuesses([]);
  };

  const formatTimer = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  const modalContentRef = useRef(null);

  const handleShare = async () => {
  
    try {
      // Create canvas from modal content, excluding button and text
      // const modalContent = modalContentRef.current;
      const options = {
        ignoreElements: (element) => {
          return element.classList.contains(styles.modalButton);
        }
      };
      const canvas  = await html2canvas(modalContentRef.current, options);

      // Convert canvas to blob
      const blob = await new Promise((resolve) => {
        canvas.toBlob(resolve, "image/png");
      });

      // Create file from blob
      const file = new File([blob], "dots-game-result.png", {
        type: "image/png",
      });

      // Check if Web Share API is available
      if (navigator.share) {
        await navigator.share({
          title: "my DOTS game result",
          text: `I completed DOTS in ${formatTimer(timer)}! www.thedotsgame.xyz`,
          files: [file],
        });
      } else {
        // Fallback for browsers that don't support Web Share API
        const link = document.createElement("a");
        link.href = URL.createObjectURL(blob);
        link.download = "dots-game-result.png";
        link.click();
        URL.revokeObjectURL(link.href);
      }
    } catch (error) {
      console.error("Error sharing:", error);
    } 
  };

  return (
    <>
      <Head>
        <title>dots</title>
        <meta
          name="description"
          content="guess the correct combination of 4 colors"
        />
        <meta name="image" content="/placeholder.png" />
        <meta property="og:image" content="/placeholder.png" />
        <meta property="og:title" content="dots" />
        <meta
          property="og:description"
          content="guess the correct combination of 4 colors"
        />
      </Head>
      <div className={styles.container}>
        <h1 className={styles.title}>
          D<div className={styles.circleLogo}></div>TS
        </h1>
        <p className={styles.instructions}>
          guess the correct combination of 4 colors
        </p>
        <div className={styles.inputRow}>
          <div className={styles.circlesContainer} onClick={handleRemoveLast}>
            {input.map((color, index) => (
              <div
                key={index}
                className={`${styles.circle} ${
                  color ? styles[color.toLowerCase()] : styles.empty
                }`}
              />
            ))}
          </div>
        </div>
        <p className={styles.instructions}>
          tap on a color below to set your guess
        </p>
        <div className={styles.colorOptions}>
          {colors.map((color) => (
            <div
              key={color}
              className={`${styles.colorCircle} ${styles[color.toLowerCase()]}`}
              onClick={() => handleCircleClick(color)}
            />
          ))}
        </div>
        <button onClick={handleSubmit} className={styles.button}>
          submit
        </button>
        {guesses.length > 0 && (
          <>
            <p className={styles.numberGuesses}>{guesses.length} / 8</p>
            <div className={styles.row}>
              <div className={`${styles.feedbackSquare} ${styles.green}`} />
              <p className={styles.explainerText}> correct color & spot</p>
              <div
                className={`${styles.feedbackSquare} ${styles.yellow} ${styles.marginLeft}`}
              />
              <p className={styles.explainerText}> correct color </p>
            </div>
          </>
        )}
        <ul className={styles.guesses}>
          {guesses
            .slice()
            .reverse()
            .map((g, i) => (
              <li key={i} className={styles.guess}>
                <div className={styles.guessNumber}>
                  {guesses.length - i} |{" "}
                </div>
                <div className={styles.guessCircles}>
                  {g.guess.map((color, idx) => (
                    <div
                      key={idx}
                      className={`${styles.circle} ${
                        styles[color.toLowerCase()]
                      }`}
                    />
                  ))}
                </div>
                <div className={styles.feedbackGrid}>
                  {g.feedback.map((type, index) => (
                    <div
                      key={index}
                      className={`${styles.feedbackSquare} ${styles[type]}`}
                    />
                  ))}
                </div>
              </li>
            ))}
        </ul>
      </div>
      {showHowToPlay && (
        <div className={styles.modalOverlayHowTo}>
         <div className={styles.howToModal}>
            <h1 className={styles.title}>How to Play</h1>
            <p className={styles.instructions}>
              Guess the correct color combination in 8 tries
            </p>
            <br />
            <p className={styles.instructions}>
              -Tap the colors in the order you want to guess
            </p>
            <p className={styles.instructions}>
              -Square tiles will show how close your guess <br/> was to the combination 
            </p>
            <br />
            <p className={styles.instructions}>
              <b>Example target combination:</b>
            </p>
            <div className={styles.exampleColors}>
            
              <div className={`${styles.circle} ${styles.yellow}`} />
              <div className={`${styles.circle} ${styles.yellow}`} />
              <div className={`${styles.circle} ${styles.green}`} />
              <div className={`${styles.circle} ${styles.green}`} />
              
            </div>
            <br />
            <div className={styles.exampleColors}>
              <div className={`${styles.circle} ${styles.red}`} />
              <div className={`${styles.circle} ${styles.green}`} />
              <div className={`${styles.circle} ${styles.blue}`} />
              <div className={`${styles.circle} ${styles.red}`} />
              <div className={styles.feedbackGrid}>
                <div
                  className={`${styles.feedbackSquare} ${styles["yellow"]}`}
                />
                 <div
                  className={`${styles.feedbackSquare} ${styles["empty"]}`}
                />
                 <div
                  className={`${styles.feedbackSquare} ${styles["empty"]}`}
                />
                 <div
                  className={`${styles.feedbackSquare} ${styles["empty"]}`}
                />
            </div>
            </div>
            <p className={styles.instructions}>
            <span className={styles.smallCircle}></span> correct color wrong position, yellow square 
            </p>
           
            <div className={styles.exampleColors}>
              <div className={`${styles.circle} ${styles.blue}`} />
              <div className={`${styles.circle} ${styles.yellow}`} />
              <div className={`${styles.circle} ${styles.green}`} />
              <div className={`${styles.circle} ${styles.red}`} />
              <div className={styles.feedbackGrid}>
                <div
                  className={`${styles.feedbackSquare} ${styles["green"]}`}
                />
                 <div
                  className={`${styles.feedbackSquare} ${styles["empty"]}`}
                />
                 <div
                  className={`${styles.feedbackSquare} ${styles["empty"]}`}
                />
                 <div
                  className={`${styles.feedbackSquare} ${styles["empty"]}`}
                />
            </div>
            </div>
            <p className={styles.instructions}>
            <span className={styles.smallCircleYellow}></span> correct color and position, green square
            </p>
            

            <button className={styles.playButton} onClick={() => setShowHowToPlay(false)}>
              <p>play</p>
            </button>
          </div>
        </div>
      )}
      {showModal && (
        <div className={styles.modalOverlay}>
          <div ref={modalContentRef} className={styles.modal}>
            <h1 className={styles.title}>
              D<div className={styles.circleLogo}></div>TS
            </h1>
            <div className={styles.modalHeader}>
              <p className={styles.modalDate}>
                {new Date()
                  .toLocaleDateString("en-US", {
                    weekday: "long",
                    month: "short",
                    day: "numeric",
                  })
                  .toLowerCase()}
              </p>
              <p
                className={`${styles.timer} ${
                  isGameOver ? styles.timerGameOver : ""
                }`}
              >
                {formatTimer(timer)}
              </p>
            </div>

            <ul className={styles.guesses}>
              {guesses.slice().map((g, i) => (
                <li key={i} className={styles.guess}>
                  {/* <div className={styles.guessNumber}>{i + 1} | </div> */}
                  <div className={styles.guessCircles}>
                    {g.guess.map((color, idx) => (
                      <div
                        key={idx}
                        className={`${styles.circleResult} ${
                          styles[color.toLowerCase()]
                        }`}
                      />
                    ))}
                  </div>
                </li>
              ))}
            </ul>
            {isGameOver &&
            <><p className={styles.instructions}>
                game over
              </p>
              <div className={styles.guesses}>
              <div className={styles.guessCircles}>
                {targetColors.map((color, idx) => (
                  <div
                    key={idx}
                    className={`${styles.circleResult} ${styles[color.toLowerCase()]}`} />))}
                </div>
                </div>
                </>
            }
            <p className={styles.modalText}>
              congratulations -- you won!
            </p>
            {!isGameOver &&  (
              <button className={styles.modalButton} onClick={handleShare}>
                share
              </button>
            )}
            {isGameOver &&  (
              <button className={styles.modalButton} onClick={closeModal}>
                try again
              </button>
            )}
          </div>
        </div>
      )}
      <footer className={styles.footer}>
        <a href="mailto:gleb@uwalumni.com" className={styles.footerLink}>
          contact
        </a>
      </footer>
    </>
  );
}
