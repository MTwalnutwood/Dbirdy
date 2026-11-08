using Dbirdy.GameEngine.Enums;
using Dbirdy.GameEngine.Game;

namespace Dbirdy.GameEngine.Games;

public class Game
{

    public Guid Id { get; set; } = Guid.NewGuid();
    public Board Board { get; set; } = new();

    public Player PlayerO { get; set; } = new();

    public Player PlayerX { get; set; } = new();

    public PlayerSymbol CurrentTurn { get; set; }

    public int CurrentRound { get; set; } = 1;

    public GameState State { get; set; } = GameState.WaitingForPlayers;
    public bool Start()
    {
        if (PlayerO.Id == Guid.Empty || PlayerX.Id == Guid.Empty)
            return false;

        if (!PlayerO.IsReady || !PlayerX.IsReady)
            return false;

        State = GameState.InProgress;
        CurrentTurn = PlayerSymbol.O;

        return true;
    }
    public bool SetReady(Guid playerId)
    {
        if (PlayerO.Id == playerId)
        {
            PlayerO.IsReady = true;
        }
        else if (PlayerX.Id == playerId)
        {
            PlayerX.IsReady = true;
        }
        else
        {
            return false;
        }

        if (PlayerO.IsReady && PlayerX.IsReady)
        {
            Start();
        }

        return true;
    }
  
    public bool AddPlayer(Guid playerId, PlayerSymbol symbol)
    {
        if (symbol == PlayerSymbol.O)
        {
            if (PlayerO.Id != Guid.Empty)
                return false;

            PlayerO.Id = playerId;
            PlayerO.Symbol = PlayerSymbol.O;
        }
        else
        {
            if (PlayerX.Id != Guid.Empty)
                return false;

            PlayerX.Id = playerId;
            PlayerX.Symbol = PlayerSymbol.X;
        }

        if (PlayerO.Id != Guid.Empty && PlayerX.Id != Guid.Empty)
        {
            State = GameState.WaitingForReady;
        }

        return true;
    }
    public void StartNextRound()
    {
        if (CurrentRound >= 3)
        {
            State = GameState.MatchFinished;
            return;
        }

        CurrentRound++;

        Board.Cells = new CellState[9];

        PlayerO.Moves.Clear();
        PlayerX.Moves.Clear();

        CurrentTurn = PlayerSymbol.O;

        State = GameState.InProgress;
    }
    public PlayerSymbol GetWinner()
    {
        if (State != GameState.MatchFinished)
            throw new InvalidOperationException("The match is not finished.");

        if (PlayerO.Score > PlayerX.Score)
            return PlayerSymbol.O;

        return PlayerSymbol.X;
    }

    private bool HasWon(Player player)
    {
        var positions = player.Moves
            .Select(move => move.Position)
            .ToList();

        int[][] winningPositions =
        {
        new[] { 0, 1, 2 },
        new[] { 3, 4, 5 },
        new[] { 6, 7, 8 },
        new[] { 0, 3, 6 },
        new[] { 1, 4, 7 },
        new[] { 2, 5, 8 },
        new[] { 0, 4, 8 },
        new[] { 2, 4, 6 }
    };

        return winningPositions.Any(line =>
            line.All(position => positions.Contains(position)));
    }
    public bool MakeMove(int position)
    {
        if (State != GameState.InProgress)
            return false;

        if (position < 0 || position > 8)
            return false;

        if (Board.Cells[position] != CellState.Empty)
            return false;

        Player player = CurrentTurn == PlayerSymbol.O
            ? PlayerO
            : PlayerX;

        Board.Cells[position] = CurrentTurn == PlayerSymbol.O
            ? CellState.O
            : CellState.X;

        var move = new Move
        {
            Player = CurrentTurn,
            Position = position
        };



        player.Moves.Add(move);

        if (player.Moves.Count > 3)
        {
            var oldestMove = player.Moves[0];

            Board.Cells[oldestMove.Position] = CellState.Empty;

            player.Moves.RemoveAt(0);
        }
        if (HasWon(player))
        {
            player.Score++;
            State = GameState.RoundFinished;
            return true;
        }

        CurrentTurn = CurrentTurn == PlayerSymbol.O
            ? PlayerSymbol.X
            : PlayerSymbol.O;

        return true;
    }
}
