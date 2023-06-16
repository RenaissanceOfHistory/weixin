from pydantic import BaseModel, AnyUrl
from typing import Union


class MusicInfo(BaseModel):
    artist: str
    pic: Union[AnyUrl, None] = None
    url: AnyUrl
    duration: str
    release_date: Union[str, None] = None
    album: Union[str, None] = None
    song_time_minutes: str
    sname: str
