using System;
using System.Collections.Generic;
using System.Text;

namespace Dbirdy.Domain.Common;

public abstract class BaseEntity
{
    public Guid Id { get; protected set; }

    public DateTime CreatedAt { get; protected set; }

    public DateTime UpdatedAt { get; protected set; }
}
