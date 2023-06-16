import uvicorn
from fastapi import FastAPI

from service.user_service import app as app_user
from service.music_service import app as app_music

app = FastAPI()

app.include_router(app_user, prefix="/user", tags=["用户模块"])
app.include_router(app_music, prefix="/music", tags=["音乐模块"])


def main() -> None:
    uvicorn.run(app)


if __name__ == '__main__':
    main()
