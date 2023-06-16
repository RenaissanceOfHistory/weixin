import random
import string

from fastapi import APIRouter, Body
from typing import Any

from weixin.modal.user import LoginUser, RegisterUser, Profile
from weixin.common import CodeStatus, CommonResult
from weixin.utils import mysqlTemplate

app = APIRouter()
code = ""
g_token = ""


@app.post("/login", response_model=CommonResult)
async def login(co: str = Body(embed=True), user: LoginUser = Body(embed=True)) -> Any:
    print(f"用户登录：{user}")
    global code, g_token

    if co != code:
        resp = CommonResult(code=CodeStatus.FAIL, info="验证码错误", data=None)
    else:
        conn, cursor = mysqlTemplate.get_conn()
        sql = "select id from t_user where nickname=%s and passwd=%s"
        rows = mysqlTemplate.query(sql, cursor, (user.nickname, user.passwd))
        resp = CommonResult(code=CodeStatus.FAIL, info="用户不存在", data=None)

        g_token = get_token()

        if len(rows) > 0:
            resp = CommonResult(code=CodeStatus.SUCCESS, info="登录成功",
                                data={"token": g_token, "id": rows[0]["id"]})
        else:
            sql = "select id from t_user where phone=%s and passwd=%s"
            rows = mysqlTemplate.query(sql, cursor, (user.nickname, user.passwd))
            if len(rows) > 0:
                resp = CommonResult(code=CodeStatus.SUCCESS, info="登录成功",
                                    data={"token": g_token, "id": rows[0]["id"]})
        mysqlTemplate.close(conn, cursor)
    return resp


@app.post("/register", response_model=CommonResult)
async def register(co: str = Body(embed=True), user: RegisterUser = Body(embed=True)) -> Any:
    print(f"用户注册：{user}")
    global code

    if co != code:
        resp = CommonResult(code=CodeStatus.FAIL, info="验证码错误", data=False)
    else:
        conn, cursor = mysqlTemplate.get_conn()
        sql = "select count(*) from t_user where nickname=%s"
        rows = mysqlTemplate.query(sql, cursor, (user.nickname,))[0]["count(*)"]
        if rows > 0:
            return CommonResult(code=CodeStatus.FAIL, info="用户已存在", data=None)

        sql = "insert into t_user(nickname, phone, passwd) values (%s, %s, %s)"
        rows = mysqlTemplate.execute(sql, cursor, (user.nickname, user.phone, user.passwd))
        mysqlTemplate.commit(conn)

        if rows > 0:
            resp = CommonResult(code=CodeStatus.SUCCESS, info="注册成功", data=True)
            sql = "select id from t_user where nickname=%s and passwd=%s"
            rows = mysqlTemplate.query(sql, cursor, (user.nickname, user.passwd))[0]["id"]
            add_profile(uid=rows)
        else:
            resp = CommonResult(code=CodeStatus.FAIL, info="注册失败", data=False)
        mysqlTemplate.close(conn, cursor)
    return resp


@app.get("/code")
async def get_code() -> str:
    global code
    code = "".join(random.choice(string.digits) for _ in range(6))
    return code


@app.post("/profile", response_model=CommonResult)
async def get_profile(uid: int = Body(embed=True), token: str = Body(embed=True)) -> Any:
    global g_token
    if token != g_token:
        return CommonResult(code=CodeStatus.FAIL, info="非法访问", data=None)

    conn, cursor = mysqlTemplate.get_conn()
    sql = "select * from t_user_detail where uid=%s"
    result = mysqlTemplate.query(sql, cursor, (uid,))
    return CommonResult(code=CodeStatus.SUCCESS, info="查询成功", data=result)


@app.post("/profile/update", response_model=CommonResult)
async def update_profile(profile: Profile = Body(embed=True), token: str = Body(embed=True)) -> Any:
    global g_token
    if token != g_token:
        return CommonResult(code=CodeStatus.FAIL, info="非法访问", data=None)

    print(profile)
    conn, cursor = mysqlTemplate.get_conn()
    sql = f"update t_user_detail set email=%s, gender=%s, city=%s, province=%s, commentary=%s where uid=%s"
    data = (profile.email, profile.gender, profile.city, profile.province, profile.commentary, profile.uid)
    count = mysqlTemplate.execute(sql, cursor, data)
    mysqlTemplate.commit(conn)
    mysqlTemplate.close(conn, cursor)

    if count >= 0:
        resp = CommonResult(code=CodeStatus.SUCCESS, info="保存成功", data=None)
    else:
        resp = CommonResult(code=CodeStatus.FAIL, info="保存失败", data=None)
    return resp


def add_profile(uid: int) -> None:
    conn, cursor = mysqlTemplate.get_conn()
    sql = f"insert into t_user_detail(uid) values (%s)"
    mysqlTemplate.execute(sql, cursor, (uid,))
    mysqlTemplate.commit(conn)
    mysqlTemplate.close(conn, cursor)


def get_token(count=32) -> str:
    token = string.ascii_letters + string.digits
    return "".join(random.choice(token) for _ in range(count))
