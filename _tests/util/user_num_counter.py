from config import BASE_DIR

__all__ = (
    'UserNumCounter',
)


class UserNumCounter:
    _FILE_PATH = BASE_DIR.joinpath('./_tests/util/count')

    def __init__(self, start_value: int = 0) -> None:
        self._cur: int
        if self._FILE_PATH.exists():
            self._cur = int(self._FILE_PATH.read_text())
        else:
            self._cur = start_value
            self._set(self._cur)

    @property
    def cur(self) -> int:
        return self._cur

    def increase(self) -> None:
        self._set(self._cur + 1)

    def _set(self, count: int) -> None:
        self._FILE_PATH.write_text(str(count))
        self._cur = count
