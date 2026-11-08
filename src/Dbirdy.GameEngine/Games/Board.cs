using Dbirdy.GameEngine.Enums;

namespace Dbirdy.GameEngine.Game;

public class Board
{
    public CellState[] Cells { get; set; } = new CellState[9];
}
