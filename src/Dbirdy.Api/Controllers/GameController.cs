using Dbirdy.Api.Dtos;
using Dbirdy.Api.Stores;
using Dbirdy.GameEngine.Enums;
using Microsoft.AspNetCore.Mvc;

namespace Dbirdy.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class GameController : ControllerBase
{
    private readonly GameStore _gameStore;

    public GameController(GameStore gameStore)
    {
        _gameStore = gameStore;
    }

    [HttpPost]
    public IActionResult CreateGame()
    {
        var game = _gameStore.Create();

        return Ok(game);
    }
    [HttpPost("{id:guid}/moves")]
    public IActionResult MakeMove(Guid id, MoveRequest request)
    {
        var game = _gameStore.Get(id);

        if (game is null)
            return NotFound("Game not found.");

        var success = game.MakeMove(request.Position);

        if (!success)
            return BadRequest("Invalid move.");

        return Ok(game);
    }
    [HttpGet("{id:guid}")]
    public IActionResult GetGame(Guid id)
    {
        var game = _gameStore.Get(id);

        if (game is null)
            return NotFound();

        return Ok(game);
    }

    [HttpPost("{id:guid}/players")]
    public IActionResult AddPlayer(
        Guid id,
        JoinGameRequest request)
    {
        var game = _gameStore.Get(id);

        if (game is null)
            return NotFound();

        PlayerSymbol symbol;

        if (game.PlayerO.Id == Guid.Empty)
        {
            symbol = PlayerSymbol.O;
        }
        else if (game.PlayerX.Id == Guid.Empty)
        {
            symbol = PlayerSymbol.X;
        }
        else
        {
            return BadRequest("Game is full.");
        }

        var added = game.AddPlayer(request.PlayerId, symbol);

        if (!added)
            return BadRequest("Player could not join the game.");



      return Ok(game);



    }
    [HttpPost("{id:guid}/ready")]
    public IActionResult SetReady(Guid id, ReadyRequest request)
    {
        var game = _gameStore.Get(id);

        if (game is null)
            return NotFound("Game not found.");

        var success = game.SetReady(request.PlayerId);

        if (!success)
            return BadRequest("Player not found.");

        return Ok(game);
    }
}
