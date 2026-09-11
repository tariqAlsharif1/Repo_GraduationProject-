"""
Engine + connection management.

We use plain SQLAlchemy Core connections (no ORM Session). FastAPI routes
depend on `get_db` to receive a live `Connection`, run insert()/select()/
update()/delete() statements against it, and it's closed automatically
when the request finishes.
"""

from collections.abc import Generator

from sqlalchemy import Connection, create_engine

from app.config import settings

engine = create_engine(settings.database_url, pool_pre_ping=True, future=True)


def get_db() -> Generator[Connection, None, None]:
    """FastAPI dependency that yields a SQLAlchemy Core connection per request."""
    connection = engine.connect()
    try:
        yield connection
        connection.commit()
    except Exception:
        connection.rollback()
        raise
    finally:
        connection.close()
