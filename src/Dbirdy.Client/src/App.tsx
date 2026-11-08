
import { useState } from 'react'
import './App.css'

interface Player {
  id: string
  symbol: number
  score: number
  isReady: boolean
}

interface Board {
  cells: number[]
}

interface Game {
  id: string
  board: Board
  playerO: Player
  playerX: Player
  currentTurn: number
  currentRound: number
  state: number
}

const API_URL = 'http://localhost:5032/api/Game'

function App() {
  const [game, setGame] = useState<Game | null>(null)
  const [gameIdInput, setGameIdInput] = useState('')
  const [playerId, setPlayerId] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const mySymbol =
    game && playerId
      ? game.playerO.id === playerId
        ? 'O'
        : game.playerX.id === playerId
          ? 'X'
          : null
      : null

  const createGame = async () => {
    setLoading(true)
    setError(null)

    try {
      const createResponse = await fetch(API_URL, {
        method: 'POST',
      })

      if (!createResponse.ok) {
        throw new Error('Could not create game.')
      }

      const newGame: Game = await createResponse.json()
      const newPlayerId = crypto.randomUUID()

      const joinResponse = await fetch(
        `${API_URL}/${newGame.id}/players`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ playerId: newPlayerId }),
        },
      )

      if (!joinResponse.ok) {
        throw new Error('Game created, but could not join it.')
      }

      const joinedGame: Game = await joinResponse.json()

      setGame(joinedGame)
      setPlayerId(newPlayerId)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong.')
    } finally {
      setLoading(false)
    }
  }

  const joinGame = async () => {
    const id = gameIdInput.trim()

    if (!id) {
      setError('Please enter a Game ID.')
      return
    }

    setLoading(true)
    setError(null)

    try {
      const newPlayerId = crypto.randomUUID()

      const response = await fetch(`${API_URL}/${id}/players`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ playerId: newPlayerId }),
      })

      if (!response.ok) {
        if (response.status === 404) {
          throw new Error('Game not found.')
        }

        throw new Error((await response.text()) || 'Could not join game.')
      }

      const joinedGame: Game = await response.json()

      setGame(joinedGame)
      setPlayerId(newPlayerId)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong.')
    } finally {
      setLoading(false)
    }
  }

  const setReady = async () => {
    if (!game || !playerId) return

    setLoading(true)
    setError(null)

    try {
      const response = await fetch(`${API_URL}/${game.id}/ready`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ playerId }),
      })

      if (!response.ok) {
        throw new Error('Could not set player ready.')
      }

      setGame(await response.json())
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong.')
    } finally {
      setLoading(false)
    }
  }

  const refreshGame = async () => {
    if (!game) return

    try {
      const response = await fetch(`${API_URL}/${game.id}`)

      if (!response.ok) {
        throw new Error('Could not refresh game.')
      }

      setGame(await response.json())
      setError(null)
    } catch {
      setError('Could not refresh game.')
    }
  }

  const makeMove = async (position: number) => {
    if (!game || !mySymbol || loading) return

    setLoading(true)
    setError(null)

    try {
      const response = await fetch(`${API_URL}/${game.id}/moves`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ position }),
      })

      if (!response.ok) {
        throw new Error((await response.text()) || 'Invalid move.')
      }

      setGame(await response.json())
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not make move.')
    } finally {
      setLoading(false)
    }
  }

  const isPlayerReady =
    mySymbol === 'O'
      ? game?.playerO.isReady
      : mySymbol === 'X'
        ? game?.playerX.isReady
        : false

  const isMyTurn =
    game !== null &&
    ((mySymbol === 'O' && game.currentTurn === 0) ||
      (mySymbol === 'X' && game.currentTurn === 1))

  const isPlayerJoined = (player: Player) =>
    player.id !== '00000000-0000-0000-0000-000000000000'

  const getCellSymbol = (cell: number) => {
    if (cell === 1) return 'O'
    if (cell === 2) return 'X'
    return ''
  }

  return (
    <main className="app">
      <h1>Dbirdy</h1>
      <p className="subtitle">A simple game for two players</p>

      {!game ? (
        <section className="room-panel">
          <button
            onClick={createGame}
            disabled={loading}
            className="primary-button"
          >
            {loading ? 'Please wait...' : 'Create New Game'}
          </button>

          <div className="separator">
            <span>OR</span>
          </div>

          <form
            onSubmit={(event) => {
              event.preventDefault()
              joinGame()
            }}
          >
            <label htmlFor="gameId">Join Existing Game</label>

            <input
              id="gameId"
              type="text"
              value={gameIdInput}
              onChange={(event) => setGameIdInput(event.target.value)}
              placeholder="Enter Game ID"
            />

            <button
              type="submit"
              disabled={loading}
              className="secondary-button"
            >
              {loading ? 'Joining...' : 'Join Game'}
            </button>
          </form>
        </section>
      ) : (
        <section className="game-panel">
          <h2>Game Room</h2>

          <p className="game-id">
            <span>Game ID</span>
            <strong>{game.id}</strong>
          </p>

          <p className="your-symbol">
            You are Player {mySymbol ?? 'Unknown'}
          </p>

          <div className="players">
            <div className="player-card">
              <span className="symbol">O</span>
              <strong>Player O</strong>
              <span>
                {isPlayerJoined(game.playerO)
                  ? game.playerO.isReady ? 'Ready' : 'Joined'
                  : 'Waiting'}
              </span>
              <span>Score: {game.playerO.score}</span>
            </div>

            <div className="player-card">
              <span className="symbol">X</span>
              <strong>Player X</strong>
              <span>
                {isPlayerJoined(game.playerX)
                  ? game.playerX.isReady ? 'Ready' : 'Joined'
                  : 'Waiting'}
              </span>
              <span>Score: {game.playerX.score}</span>
            </div>
          </div>

          {game.state === 1 && (
            <div className="ready-section">
              <p>Both players must be ready to start.</p>

              <button
                onClick={setReady}
                disabled={loading || isPlayerReady || !mySymbol}
                className="primary-button"
              >
                {isPlayerReady ? 'You are Ready' : 'Ready'}
              </button>
            </div>
          )}

          {game.state === 2 && (
            <>
              <div className="round-info">
                <h2>Round {game.currentRound} / 3</h2>
                <p>
                  {isMyTurn
                    ? 'Your turn!'
                    : `Player ${game.currentTurn === 0 ? 'O' : 'X'}'s turn`}
                </p>
              </div>

              <div className="board">
                {game.board.cells.map((cell, index) => (
                  <button
                    key={index}
                    className={`board-cell ${getCellSymbol(cell)}`}
                    onClick={() => makeMove(index)}
                    disabled={
                      loading ||
                      cell !== 0 ||
                      !isMyTurn ||
                      game.state !== 2
                    }
                  >
                    {getCellSymbol(cell)}
                  </button>
                ))}
              </div>
            </>
          )}

          {game.state === 3 && (
            <div className="round-info">
              <h2>Round Finished!</h2>
              <p>Refresh the game to see the latest result.</p>
            </div>
          )}

          {game.state === 4 && (
            <div className="round-info">
              <h2>Match Finished!</h2>
              <p>
                Winner: Player {game.playerO.score > game.playerX.score ? 'O' : 'X'}
              </p>
            </div>
          )}

          <button onClick={refreshGame} className="secondary-button">
            Refresh Game
          </button>

          <button
            onClick={() => {
              setGame(null)
              setPlayerId(null)
              setError(null)
            }}
            className="text-button"
          >
            Back to Menu
          </button>
        </section>
      )}

      {error && <p className="error">{error}</p>}
    </main>
  )
}

export default App
