#!/usr/bin/env python3
"""
电影海报批量下载脚本
数据源：TMDB (The Movie Database) API — 免费、高清、稳定
使用方式：
    1. 去 https://www.themoviedb.org/settings/api 注册免费账号并申请 API Key
    2. 将下方 TMDB_API_KEY 替换成你自己的 key
    3. pip install requests
    4. python fetch_movie_posters.py
"""

import os
import time
import json
import requests

# ──────────────────────────────────────────────
# 配置区（只需改这里）
# ──────────────────────────────────────────────
TMDB_API_KEY = "f597f4e95b85ef402ed2009c0cf97b74"   # ← 替换成你的 TMDB API Key
OUTPUT_DIR   = "./mbti_posters"            # 图片保存根目录
POSTER_SIZE  = "w500"                      # 可选: w92 w154 w185 w342 w500 w780 original
DELAY        = 0.3                         # 每次请求间隔（秒），避免触发限流
# ──────────────────────────────────────────────

MOVIES = {
  "ISTJ": {
    "zh": ["步履不停", "何以为家", "完美的日子"],
    "en": ["Still Walking", "Capernaum", "Perfect Days"]
  },
  "ISFJ": {
    "zh": ["海街日记", "小偷家族", "阳光姐妹淘"],
    "en": ["Our Little Sister", "Shoplifters", "Sunny"]
  },
  "INFJ": {
    "zh": ["花样年华", "情书", "请以你的名字呼唤我"],
    "en": ["In the Mood for Love", "Love Letter", "Call Me by Your Name"]
  },
  "INTJ": {
    "zh": ["盗梦空间", "社交网络", "看不见的客人"],
    "en": ["Inception", "The Social Network", "The Invisible Guest"]
  },
  "ISTP": {
    "zh": ["疯狂的麦克斯：狂暴之路", "火星救援", "极盗车神"],
    "en": ["Mad Max: Fury Road", "The Martian", "Baby Driver"]
  },
  "ISFP": {
    "zh": ["伯德小姐", "海边的曼彻斯特", "蓝色大门"],
    "en": ["Lady Bird", "Manchester by the Sea", "Blue Gate Crossing"]
  },
  "INFP": {
    "zh": ["怦然心动", "壁花少年", "心灵捕手"],
    "en": ["Flipped", "The Perks of Being a Wallflower", "Good Will Hunting"]
  },
  "INTP": {
    "zh": ["她", "瞬息全宇宙", "机械姬"],
    "en": ["Her", "Everything Everywhere All at Once", "Ex Machina"]
  },
  "ESTP": {
    "zh": ["壮志凌云：独行侠", "速度与激情7", "碟中谍6：全面瓦解"],
    "en": ["Top Gun: Maverick", "Furious 7", "Mission: Impossible - Fallout"]
  },
  "ESFP": {
    "zh": ["诺丁山", "真爱至上", "爱乐之城"],
    "en": ["Notting Hill", "Love Actually", "La La Land"]
  },
  "ENFP": {
    "zh": ["白日梦想家", "绿皮书", "少年斯派维的奇异旅行"],
    "en": ["The Secret Life of Walter Mitty", "Green Book", "The Young and Prodigious T.S. Spivet"]
  },
  "ENTP": {
    "zh": ["楚门的世界", "布达佩斯大饭店", "利刃出鞘"],
    "en": ["The Truman Show", "The Grand Budapest Hotel", "Knives Out"]
  },
  "ESTJ": {
    "zh": ["当幸福来敲门", "国王的演讲", "阿甘正传"],
    "en": ["The Pursuit of Happyness", "The King's Speech", "Forrest Gump"]
  },
  "ESFJ": {
    "zh": ["真爱至上", "奇迹男孩", "小森林"],
    "en": ["Love Actually", "Wonder", "Little Forest"]
  },
  "ENFJ": {
    "zh": ["死亡诗社", "摔跤吧！爸爸", "放牛班的春天"],
    "en": ["Dead Poets Society", "Dangal", "The Chorus"]
  },
  "ENTJ": {
    "zh": ["教父", "黑暗骑士", "华尔街之狼"],
    "en": ["The Godfather", "The Dark Knight", "The Wolf of Wall Street"]
  }
}


def search_movie(title_en: str, title_zh: str) -> dict | None:
    """用英文名搜索电影，返回第一条结果"""
    url = "https://api.themoviedb.org/3/search/movie"
    params = {
        "api_key": TMDB_API_KEY,
        "query": title_en,
        "language": "zh-CN",   # 尽量返回中文信息
        "page": 1
    }
    try:
        resp = requests.get(url, params=params, timeout=10)
        resp.raise_for_status()
        results = resp.json().get("results", [])
        if results:
            return results[0]
        # 若英文搜不到，再试中文
        params["query"] = title_zh
        resp = requests.get(url, params=params, timeout=10)
        resp.raise_for_status()
        results = resp.json().get("results", [])
        return results[0] if results else None
    except Exception as e:
        print(f"    ⚠ 搜索失败 [{title_en}]: {e}")
        return None


def download_poster(poster_path: str, save_path: str) -> bool:
    """下载海报图片到本地"""
    url = f"https://image.tmdb.org/t/p/{POSTER_SIZE}{poster_path}"
    try:
        resp = requests.get(url, timeout=15, stream=True)
        resp.raise_for_status()
        with open(save_path, "wb") as f:
            for chunk in resp.iter_content(chunk_size=8192):
                f.write(chunk)
        return True
    except Exception as e:
        print(f"    ⚠ 下载失败 [{url}]: {e}")
        return False


def main():
    if TMDB_API_KEY == "your_tmdb_api_key_here":
        print("❌ 请先在脚本顶部填写你的 TMDB_API_KEY！")
        print("   申请地址：https://www.themoviedb.org/settings/api")
        return

    os.makedirs(OUTPUT_DIR, exist_ok=True)
    log = []  # 记录结果，最后打印汇总

    for mbti, data in MOVIES.items():
        folder = os.path.join(OUTPUT_DIR, mbti.lower())
        os.makedirs(folder, exist_ok=True)
        print(f"\n📁 {mbti}")

        for idx, (title_en, title_zh) in enumerate(zip(data["en"], data["zh"]), start=1):
            num = f"{idx:02d}"   # 01 / 02 / 03
            print(f"  [{num}] {title_zh} / {title_en}")

            movie = search_movie(title_en, title_zh)
            time.sleep(DELAY)

            if not movie:
                print(f"    ✗ 未找到电影")
                log.append({"mbti": mbti, "idx": num, "title": title_zh, "status": "not_found"})
                continue

            poster_path = movie.get("poster_path")
            if not poster_path:
                print(f"    ✗ 无海报图片（TMDB 收录但缺图）")
                log.append({"mbti": mbti, "idx": num, "title": title_zh, "status": "no_poster"})
                continue

            # 确定扩展名（TMDB 基本全是 jpg）
            ext = os.path.splitext(poster_path)[-1] or ".jpg"
            save_path = os.path.join(folder, f"{num}{ext}")

            ok = download_poster(poster_path, save_path)
            time.sleep(DELAY)

            if ok:
                print(f"    ✓ 已保存 → {save_path}")
                log.append({"mbti": mbti, "idx": num, "title": title_zh, "status": "ok", "path": save_path})
            else:
                log.append({"mbti": mbti, "idx": num, "title": title_zh, "status": "download_failed"})

    # 保存日志
    log_path = os.path.join(OUTPUT_DIR, "download_log.json")
    with open(log_path, "w", encoding="utf-8") as f:
        json.dump(log, f, ensure_ascii=False, indent=2)

    # 汇总
    total   = len(log)
    success = sum(1 for r in log if r["status"] == "ok")
    failed  = total - success
    print(f"\n{'='*40}")
    print(f"✅ 完成！成功 {success}/{total}，失败 {failed}")
    print(f"📄 详细日志：{log_path}")
    print(f"📂 图片目录：{os.path.abspath(OUTPUT_DIR)}")


if __name__ == "__main__":
    main()
