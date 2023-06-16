import random
import time

import requests
from loguru import logger
from typing import List

from weixin.utils import mysqlTemplate


class KuWoMusicSpider:
    def __init__(self, key: str, page_num: int):
        """
        :param key: 关键字
        :param page_num: 第几页
        """
        self.key = key
        self.page_num = page_num

    def get_resp(self) -> requests.Response:
        url = f"http://www.kuwo.cn/api/www/search/searchMusicBykeyWord"
        headers = {
            "Cookie": "_ga=GA1.2.1232323883.1682945037; Hm_lvt_cdb524f42f0ce19b16"
                      "9a8071123a4797=1684836894,1684893448,1685619368,1685784088;"
                      " _gid=GA1.2.1058888802.1685784088; Hm_lpvt_cdb524f42f0ce19b"
                      "169a8071123a4797=1685794177; kw_token=70UOL7ORN0S",
            "csrf": "70UOL7ORN0S",
            "Host": "www.kuwo.cn",
            "Referer": "https://www.kuwo.cn/search/list",
            "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 "
                          "(KHTML, like Gecko) Chrome/92.0.4515.131 Safari/537.36 SLBrowser/8.0.1.5162 SLBChan/10"
        }
        params = {
            "key": self.key,
            "pn": self.page_num,
            "rn": 30,
            "httpsStatus": 1,
            "reqId": "189d5b41-238d-11ed-acf4-4f6bf15618b2"
        }
        return requests.get(url, params=params, headers=headers)

    def get_music_info(self) -> List[dict]:
        info_list = []
        try:
            music_list: list = self.get_resp().json()["data"]["list"]
            for music in music_list:
                try:
                    music_info = {
                        "artist": music["artist"],
                        "pic": music["pic"],
                        "url": f"https://link.hhtjim.com/kw/{music['rid']}.mp3",
                        "duration": music["duration"],
                        "release_date": music["releaseDate"],
                        "album": music["album"],
                        "song_time_minutes": music["songTimeMinutes"],
                        "sname": music["name"]
                    }
                    info_list.append(music_info)
                except Exception as ex:
                    logger.exception(ex)
        except Exception as ex:
            logger.exception(ex)
        finally:
            return info_list


def spider_music(key: str, page_num=1) -> None:
    conn, cursor = mysqlTemplate.get_conn()
    params = ("artist", "pic", "url", "duration", "release_date", "album", "song_time_minutes", "sname")
    locator = str(('%s',) * len(params)).replace("'", "")
    params = str(params).replace("'", "")
    sql = f"insert into t_music{params} values {locator}"

    try:
        for page in range(1, page_num + 1):
            spider = KuWoMusicSpider(key, page_num)
            info_list = spider.get_music_info()
            for music in info_list:
                print(music)
                mysqlTemplate.execute(sql, cursor, tuple(music.values()))
            mysqlTemplate.commit(conn)
            time.sleep(random.randint(3, 5))
    except Exception as ex:
        mysqlTemplate.rollback(conn)
        logger.exception(ex)
    finally:
        mysqlTemplate.close(conn, cursor)


def main() -> None:
    key = "中森名菜"
    print(f"开始获取歌曲信息，key: {key}")
    start = time.perf_counter()
    spider_music(key, 2)
    end = time.perf_counter() - start
    print(f"获取信息结束，总运行时间：{end}sec")


if __name__ == '__main__':
    main()

