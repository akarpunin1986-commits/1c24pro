"""Global HTTP client with connection pooling.

Reuses TCP/TLS connections — saves 500ms-1s on every external request.
"""

import httpx

_client: httpx.AsyncClient | None = None


async def get_http_client() -> httpx.AsyncClient:
    """Get the global HTTP client (lazy-initialized)."""
    global _client  # noqa: PLW0603
    if _client is None:
        _client = httpx.AsyncClient(
            timeout=httpx.Timeout(10.0, connect=5.0),
            limits=httpx.Limits(max_connections=20, max_keepalive_connections=5),
            follow_redirects=True,
        )
    return _client


async def close_http_client() -> None:
    """Close the client on application shutdown."""
    global _client  # noqa: PLW0603
    if _client is not None:
        await _client.aclose()
        _client = None
