from typing import Union

from pydantic import BaseModel, EmailStr


class UserBase(BaseModel):
    nickname: str
    phone: Union[str, None] = None
    passwd: str


class LoginUser(UserBase):
    pass


class RegisterUser(UserBase):
    pass


class Profile(BaseModel):
    uid: int
    email: Union[EmailStr, None] = ""
    gender: int = 0
    city: Union[str, None] = ""
    province: Union[str, None] = ""
    lang: Union[str, None] = ""
    commentary: Union[str, None] = ""

