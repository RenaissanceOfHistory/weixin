from enum import IntEnum
from typing import Tuple, Optional

import pymysql
from dbutils.pooled_db import PooledDB
from loguru import logger

from weixin.config.db_config import mysql_config


class ExecuteType(IntEnum):
    ONE = 1
    MANY = 2


class MysqlTemplate:
    __pool: PooledDB = None

    def __init__(self):
        if self.__pool is None:
            self.db_config = mysql_config
            self.__class__.__pool = PooledDB(creator=pymysql, **self.db_config)

    def get_conn(self) -> Tuple[pymysql.Connection, pymysql.cursors.DictCursor]:
        conn = self.__pool.connection()
        cursor = conn.cursor(pymysql.cursors.DictCursor)
        return conn, cursor

    @staticmethod
    def query(sql: str, cursor, data: Optional[tuple] = None) -> Optional[tuple]:
        try:
            cursor.execute(sql, data)
            result = cursor.fetchall()
            return result
        except Exception as ex:
            logger.exception(ex)

    def execute(self, sql: str, cursor, data: Optional[tuple] = None) -> Optional[tuple]:
        return self._execute(sql, cursor, data, ExecuteType.ONE)

    def executemany(self, sql: str, cursor, data: Optional[tuple] = None) -> Optional[tuple]:
        return self._execute(sql, cursor, data, ExecuteType.MANY)

    @staticmethod
    def _execute(sql: str, cursor, data: Optional[tuple], execute_type=ExecuteType.ONE) -> Optional[tuple]:
        func_name: Optional[str] = None
        try:
            func_name = execute_type.name
            if ExecuteType.ONE == execute_type:
                rows = cursor.execute(sql, data)
            elif ExecuteType.MANY == execute_type:
                rows = cursor.executemany(sql, data)
            else:
                raise ValueError(f"错误类型：{execute_type}")
            return rows
        except Exception as ex:
            logger.exception(f"{func_name}语句异常：{ex}")

    @staticmethod
    def commit(conn: pymysql.Connection) -> None:
        conn.commit()

    @staticmethod
    def close(conn: pymysql.Connection, cursor) -> None:
        cursor.close()
        conn.close()

    @staticmethod
    def rollback(conn: pymysql.Connection) -> None:
        conn.rollback()


mysqlTemplate = MysqlTemplate()
