from pydantic import BaseModel
from typing import Any
from enum import IntEnum


class CodeStatus(IntEnum):
    SUCCESS = 1
    FAIL = 0


class CommonResult(BaseModel):
    code: CodeStatus
    info: str
    data: Any
