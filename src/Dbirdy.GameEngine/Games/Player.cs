using Dbirdy.GameEngine.Enums;

namespace Dbirdy.GameEngine.Game;

public class Player
{
    public Guid Id { get; set; }

    public PlayerSymbol Symbol { get; set; }

    public int Score { get; set; }
    public bool IsReady { get; set; }

    public List<Move> Moves { get; set; } = new();
}
