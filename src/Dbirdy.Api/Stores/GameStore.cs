using Dbirdy.GameEngine.Games;

namespace Dbirdy.Api.Stores;

public class GameStore
{
    private readonly Dictionary<Guid, Game> _games = new();

    public Game Create()
    {
        var game = new Game();

        _games.Add(game.Id, game);

        return game;
    }

    public Game? Get(Guid id)
    {
        _games.TryGetValue(id, out var game);

        return game;
    }
}
