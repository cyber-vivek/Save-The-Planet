import React, { useCallback, useState } from 'react';
import styles from '../styles/maincontainer.module.css';
import { GAME_DIFFICULTY_LEVEL, GAME_OUTCOMES, GAME_STATES, WIN_DESTROY_COUNT } from '../constants/constants';
import MainComponent from './MainComponent';

export const MainContainer = () => {

    const [gameState, setGameState] = useState(GAME_STATES.BEGIN);
    const [endStats, setEndStats] = useState({});
    const [selectedDifficulty, setselectedDifficulty] = useState(GAME_DIFFICULTY_LEVEL.MEDIUM);

    const handleDifficultyChange = (event) => {
        setselectedDifficulty(event.target.value);
    };

    const handleStartGame = useCallback((event) => {
        event?.stopPropagation();
        setGameState(GAME_STATES.RUNNING);
    }, [])

    const handleGameOver = useCallback((gameData) => {
        setGameState(GAME_STATES.END);
        setEndStats(gameData);
    }, [])

    return (
        <div className={styles.container}>
            {gameState === GAME_STATES.RUNNING ?
                <MainComponent handleGameOver={handleGameOver} difficulty={selectedDifficulty}/>
                : (
                    <div className={styles.overlay}>
                        {
                            gameState === GAME_STATES.BEGIN && <>
                                <h1>Save The Planet</h1>
                                <p>Incoming Threats 💥, Are You Ready to Save the Planet?</p>
                            </>
                        }
                        {
                            gameState === GAME_STATES.END && <>
                                <h1>
                                    {
                                        endStats.outcome === GAME_OUTCOMES.VICTORY ? "Good game Avenger!" : "Too Many. Too Fast. You Did Your Best"
                                    }
                                </h1>
                                <p>
                                    {
                                        endStats.outcome === GAME_OUTCOMES.VICTORY ? "The earth is now safe.🛡️🌍" :
                                            <>
                                                Asteroids Destroyed💥: {endStats.score} (Target : {WIN_DESTROY_COUNT})
                                            </>
                                    }
                                </p>
                            </>
                        }
                        <div className={styles.dropdownContainer}>
                        <label htmlFor="my-select">Select Difficulty:</label>
                        <select id="my-select" value={selectedDifficulty} onChange={handleDifficultyChange}>
                            {Object.values(GAME_DIFFICULTY_LEVEL).map(value => <option value={value}>{value.charAt(0).toUpperCase() + value.slice(1)}</option>)}
                        </select>
                        </div>
                        <button className={styles.button} onClick={handleStartGame}>{gameState === GAME_STATES.BEGIN ? "Begin Mission" : "Resatart"}</button>
                    </div>
                )
            }
        </div>
    )
}