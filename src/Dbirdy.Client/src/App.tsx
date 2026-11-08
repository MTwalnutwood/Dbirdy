import { useState } from 'react'
import './App.css'

interface Player {
  id: string
  symbol: number
  score: number
  isReady: boolean
}

interface Game {
  id: string
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

  const createGame = async () => {
    setLoading(true)
    setError(null)

    try {
      // Create a new game room
      const createResponse = await fetch(API_URL, {
        method: 'POST',
      })

      if (!createResponse.ok) {
        throw new Error('Could not create game.')
      }

      const newGame: Game = await createResponse.json()

      // Generate an ID for the first player
      const newPlayerId = crypto.randomUUID()

      // Join the newly created room
      const joinResponse = await fetch(
        `${API_URL}/${newGame.id}/players`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            playerId: newPlayerId,
          }),
        },
      )

      if (!joinResponse.ok) {
        throw new Error('Game created, but could not join it.')
      }

      const joinedGame: Game = await joinResponse.json()

      setGame(joinedGame)
      setPlayerId(newPlayerId)
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : 'Something went wrong.',
      )
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
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          playerId: newPlayerId,
        }),
      })

      if (!response.ok) {
        if (response.status === 404) {
          throw new Error('Game not found.')
        }

        const message = await response.text()
        throw new Error(message || 'Could not join game.')
      }

      const joinedGame: Game = await response.json()

      setGame(joinedGame)
      setPlayerId(newPlayerId)
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : 'Something went wrong.',
      )
    } finally {
      setLoading(false)
    }
  }
const setReady = async () => {
  if (!game || !playerId) return

  setLoading(true)
  setError(null)

  try {
    const response = await fetch(
      `${API_URL}/${game.id}/ready`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          playerId,
        }),
      },
    )

    if (!response.ok) {
      throw new Error('Could not set player ready.')
    }

    const updatedGame: Game = await response.json()

    setGame(updatedGame)
  } catch (err) {
    setError(
      err instanceof Error
        ? err.message
        : 'Something went wrong.',
    )
  } finally {
    setLoading(false)
  }
}

const setReady = async () => {
  if (!game || !playerId) return

  setLoading(true)
  setError(null)

  try {
    const response = await fetch(
      `${API_URL}/${game.id}/ready`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          playerId,
        }),
      },
    )

    if (!response.ok) {
      throw new Error('Could not set player ready.')
    }

    const updatedGame: Game = await response.json()

    setGame(updatedGame)
  } catch (err) {
    setError(
      err instanceof Error
        ? err.message
        : 'Something went wrong.',
    )
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

      const updatedGame: Game = await response.json()
      setGame(updatedGame)
      setError(null)
    } catch {
      setError('Could not refresh game.')
    }
  }

  const mySymbol =
    game && playerId
      ? game.playerO.id === playerId
        ? 'O'
        : game.playerX.id === playerId
          ? 'X'
          : null
      : null

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
              onChange={(event) =>
                setGameIdInput(event.target.value)
              }
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
  {!game.playerO.id ||
  game.playerO.id === '00000000-0000-0000-0000-000000000000'
    ? 'Waiting'
    : game.playerO.isReady
      ? 'Ready'
      : 'Joined'}
</span>
            </div>

            <div className="player-card">
              <span className="symbol">X</span>
              <strong>Player X</strong>
           <span>
  {!game.playerX.id ||
  game.playerX.id === '00000000-0000-0000-0000-000000000000'
    ? 'Waiting'
    : game.playerX.isReady
      ? 'Ready'
      : 'Joined'}
</span>
            </div>
          </div>
{game.state === 2 && (
  <p className="your-symbol">
    Game Started! Player {game.currentTurn === 0 ? 'O' : 'X'} goes first.
  </p>
)}
          <button
            onClick={refreshGame}
            className="secondary-button"
          >
{game.state === 1 && (
  <button
    onClick={setReady}
    disabled={loading || (mySymbol === 'O'
      ? game.playerO.isReady
      : game.playerX.isReady)}
    className="primary-button"
  >
    {mySymbol === 'O'
      ? game.playerO.isReady
        ? 'You are Ready'
        : 'Ready'
      : game.playerX.isReady
        ? 'You are Ready'
        : 'Ready'}
  </button>
)}
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