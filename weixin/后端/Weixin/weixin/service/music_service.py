from typing import Any, Union

from fastapi import APIRouter

from weixin.common import CodeStatus, CommonResult
from weixin.utils import mysqlTemplate

app = APIRouter()


@app.get("/query", response_model=CommonResult)
async def query_music(key: Union[str, None] = None, limit_start: int = 0, limit_len: int = 30) -> Any:
    conn, cursor = mysqlTemplate.get_conn()

    if key is None:
        sql = f"select * from t_music limit %s,%s"
        result = mysqlTemplate.query(sql, cursor, (limit_start, limit_len))
    else:
        sql = """
        select * from t_music 
            where sname like %s or artist like %s 
            limit %s,%s
        """
        result = mysqlTemplate.query(sql, cursor, (f"%{key}%", f"%{key}%", limit_start, limit_len))

    resp = CommonResult(code=CodeStatus.SUCCESS, info="查询成功", data=result)
    mysqlTemplate.close(conn, cursor)
    return resp
