from unittest.mock import MagicMock

import pytest

from app.core.config import Settings
from app.db.session import build_engine, get_session


def test_engine_is_configured_without_connecting(
    monkeypatch: pytest.MonkeyPatch, settings: Settings
) -> None:
    create = MagicMock()
    monkeypatch.setattr("app.db.session.create_engine", create)
    assert build_engine(settings) is create.return_value
    assert create.call_args.kwargs["pool_pre_ping"] is True
    assert create.call_args.kwargs["connect_args"]["connect_timeout"] == 3
    create.return_value.connect.assert_not_called()


def test_session_rolls_back_and_closes_on_failure() -> None:
    request = MagicMock()
    context = request.app.state.session_factory.return_value
    session = context.__enter__.return_value
    dependency = get_session(request)
    assert next(dependency) is session
    with pytest.raises(RuntimeError, match="failed"):
        dependency.throw(RuntimeError("failed"))
    session.rollback.assert_called_once()
    context.__exit__.assert_called_once()


def test_session_does_not_implicitly_commit() -> None:
    request = MagicMock()
    context = request.app.state.session_factory.return_value
    session = context.__enter__.return_value
    assert list(get_session(request)) == [session]
    session.commit.assert_not_called()
    context.__exit__.assert_called_once()
