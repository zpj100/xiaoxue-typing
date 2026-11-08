#!/usr/bin/env python3
"""Generate english.json and chinese-bank.json from public PEP / 识字表."""

from __future__ import annotations

import json
from pathlib import Path

from pypinyin import Style, lazy_pinyin

ROOT = Path("/workspace/xiaoxue-typing")
PEP = Path("/workspace/word-trainer/data/pep_items.json")
EN_OUT = ROOT / "src/data/english.json"
ZH_OUT = ROOT / "src/data/chinese-bank.json"

GRADE_CHARS = {
    1: (
        "一二三四五六七八九十百千万亿人口手足目耳口舌牙日日月水火山石田土天地上下中大小多少"
        "父母儿女学生老师同学学校中国北京上海春夏秋冬风雨花草树木鸟鱼虫马牛羊猫狗鸡鸭"
        "红黄蓝绿白黑长短远近前后左右东西南北出入开关来去走跑跳坐立吃喝看见听说读写"
        "字文课作业你我他她它好的了是在有和这那不也吗呢子头里边面个只把从对会能要就"
        "还很太再才让给到用想做玩爱家门窗房床衣裤鞋帽饭菜米肉蛋奶茶水果苹果书笔纸包"
        "车船飞机电灯电话星云雪江河海桥路村城金工厂广场公园儿歌画色声音歌舞笑哭早晚"
        "午年时分今明昨星期天空地人刀尺刀力心火禾苗竹牙羊鸟虫贝壳瓜豆米面油盐"
        "爸妈哥姐弟妹爷爷奶奶叔叔阿姨朋友同学老师同学班组校门国旗少先队员"
    ),
    2: (
        "春风夏雨秋叶冬雪江河湖海山川田野森林草地花朵叶子果实种子根茎枝叶阳光雨露"
        "霜雪冰雹彩虹朝晚星辰月亮太阳地球世界国家城市乡村街道房屋学校医院商店市场"
        "公园动物园植物园博物馆图书馆电影院体育馆游泳馆博物馆课堂黑板粉笔桌椅书包"
        "铅笔橡皮尺子圆规刀剪纸张本子日记作文诗歌故事童话寓言神话传说历史地理科学"
        "音乐美术体育劳动卫生健康安全交通规则礼貌诚信友善互助合作分享关心帮助照顾"
        "保护环境节约用水用电爱护公物尊敬师长孝敬父母团结同学热爱祖国热爱人民"
        "走访参观游览旅行活动比赛游戏运动跑步跳绳踢毽游泳爬山滑冰滑雪打球拍球"
        "唱歌跳舞弹琴画画写字读书看报听广播看电视用电脑打电话发短信写信寄信"
        "春天夏天秋天冬天早晨中午傍晚夜里今天明天后天昨天前年去年明年后年"
        "东南西北上下左右前后里外中间旁边附近远处近处这里那里哪里处处"
    ),
    3: (
        "江河湖海山川平原高原盆地岛屿沙漠森林草原湿地公园园林花园果园菜园"
        "城市乡村街道巷弄桥梁隧道铁路公路地铁公交出租自行车摩托车轮船飞机"
        "学校课堂操场礼堂图书馆实验室电脑室音乐室美术室体育馆游泳池食堂宿舍"
        "老师同学校长家长警察医生护士工人农民军人商人司机飞行员宇航员科学家"
        "作家诗人画家音乐家舞蹈家运动员教练裁判观众演员导演记者编辑主持人"
        "观察思考提问讨论交流表达倾听阅读朗读背诵复述概括总结摘录笔记日记"
        "作文造句修改润色标点符号段落篇章中心思想重点难点疑问探索研究实验"
        "证明证据理由观点意见建议批评表扬鼓励支持反对同意反对比较对比分类"
        "排列顺序因果条件假设转折递进并列选择时间地点人物事情原因结果方法"
        "工具材料步骤注意安全卫生健康锻炼休息睡眠饮食营养蔬菜水果粮食肉蛋"
        "棉麻丝绸毛料皮革塑料金属玻璃陶瓷木材石头水泥砖瓦钢筋混凝土"
        "东南西北春夏秋冬风霜雨雪阴晴冷暖干湿早晚晨昏昼夜年月星期日期"
    ),
    4: (
        "思想情感意志勇气勤奋诚实信用礼貌仪表诗歌词篇章句段落观察探索研究"
        "实验证明证据理论辩论议论批评评价摘录编辑浏览群书经典故事传说游记"
        "散文议论文说明抒情描写叙述议论抒情写景状物记人叙事抒情议论说明"
        "中心思想段落大意重点词语修辞比喻拟人排比夸张设问反问对偶反复"
        "借景抒情托物言志情景交融详写略写过渡照应开头结尾点题扣题线索"
        "顺叙倒叙插叙人称第一第二第三正面侧面直接间接环境社会自然景物"
        "心理活动语言动作神态外貌性格品质精神品质习惯爱好理想志向兴趣"
        "祖国山河历史文化传统节日民俗风情名胜古迹革命先烈英雄模范科学家"
        "发明创造技术工程农业工业商业交通通信能源环保生态平衡可持续发展"
        "民主法制权利义务责任集体荣誉国家利益国际和平友谊合作交流"
        "自然现象物理化学生物地理天文气象地震火山冰川沙漠绿洲平原丘陵"
        "赤道两极经纬线时区季节气候温度湿度气压风向风力降水蒸发凝结"
    ),
    5: (
        "观察探索研究实验证明证据理论辩论议论批评评价摘录编辑浏览群书"
        "经典著作文献资料档案记录调查访问采访报道新闻通讯特写评论社论"
        "议论文论点论据论证立论驳论举例对比比喻因果假设条件让步转折"
        "说明文时间顺序空间顺序逻辑顺序下定义分类别列数字作比较打比方"
        "举例子作诠释摹状貌引用图表说明特征本质功能用途结构原理过程"
        "散文形散神聚情景抒情托物言志哲理感悟联想想象象征暗示含蓄"
        "小说人物情节环境开端发展高潮结局线索伏笔照应详略得当"
        "诗歌韵律节奏意象意境情感主题抒情叙事哲理山水田园边塞咏物"
        "文言文实词虚词通假古今异义一词多义词类活用特殊句式翻译理解"
        "科学探究提出问题作出假设制订计划收集证据处理信息得出结论表达交流"
        "物质运动能量力机械电磁声光热化学变化物理变化溶解蒸发凝固熔化"
        "生物细胞组织器官系统遗传变异进化生态食物链环境保护生物多样性"
        "地球宇宙太阳系行星恒星星系银河宇宙探索航天航空卫星火箭飞船"
    ),
    6: (
        "浏览群书经典故事传说游记散文议论文说明抒情描写叙述议论"
        "毕业小学中学理想志向未来前途职业选择兴趣爱好特长发展"
        "祖国建设改革开放科技创新文化交流国际视野全球意识责任担当"
        "历史朝代文明遗产文物古迹博物馆纪念馆展览馆科技馆美术馆"
        "丝绸之路大运河长城故宫颐和园天坛兵马俑敦煌莫高窟布达拉宫"
        "长江黄河珠江淮河海河松花江辽河塔里木雅鲁藏布江珠江三角洲"
        "青藏高原黄土高原云贵高原内蒙古高原东北平原华北平原长江中下游平原"
        "民主选举协商监督法治宪法法律权利义务平等公正诚信友善和谐"
        "社会主义核心价值观文明礼仪社会公德职业道德家庭美德个人品德"
        "阅读策略略读精读浏览检索质疑推想比较辨别评价反思交流分享"
        "写作立意选材谋篇布局起草修改加工誊写标点书写格式应用文"
        "书信通知启事日记读后感演讲稿倡议书建议书说明文记叙文议论文"
        "口语交际倾听表达应对讨论辩论演讲朗诵讲故事复述转述即兴发言"
        "综合性学习策划组织实施展示评价合作分工调查采访搜集整理"
    ),
}


def uniq_chars(text: str, seen: set[str]) -> list[str]:
    out: list[str] = []
    for ch in text:
        if not ("\u4e00" <= ch <= "\u9fff"):
            continue
        if ch in seen:
            continue
        seen.add(ch)
        out.append(ch)
    return out


def pinyin_plain(ch: str) -> str:
    raw = lazy_pinyin(ch, style=Style.NORMAL)[0]
    return raw.replace("ü", "v")


def pinyin_tone(ch: str) -> str:
    return lazy_pinyin(ch, style=Style.TONE)[0]


def build_chinese() -> dict:
    seen: set[str] = set()
    hanzi = []
    write = []
    pinyin_extra = []
    idx = 0
    for grade in range(1, 7):
        chars = uniq_chars(GRADE_CHARS[grade], seen)
        mid = max(len(chars) // 2, 1)
        for i, ch in enumerate(chars):
            idx += 1
            term = 1 if i < mid else 2
            py = pinyin_plain(ch)
            tone = pinyin_tone(ch)
            item = {
                "id": f"hz-{grade}-{term}-{i + 1}",
                "subject": "chinese",
                "grade": grade,
                "term": term,
                "unit": "识字",
                "kind": "hanzi",
                "title": ch,
                "prompt": ch,
                "answer": py,
                "phonetic": tone,
                "hint": f"读 {tone}",
                "strokes": tone,
            }
            hanzi.append(item)
            write.append(
                {
                    **item,
                    "id": f"wr-{grade}-{term}-{i + 1}",
                    "kind": "write",
                    "unit": "写字",
                    "prompt": f"写出「{ch}」",
                    "answer": ch,
                    "hint": tone,
                }
            )
            if grade <= 2:
                pinyin_extra.append(
                    {
                        "id": f"py-s-{grade}-{i + 1}",
                        "subject": "chinese",
                        "grade": 1 if grade == 1 else 2,
                        "term": term,
                        "unit": "拼读",
                        "kind": "pinyin",
                        "title": ch,
                        "prompt": ch,
                        "answer": py,
                        "phonetic": tone,
                        "hint": tone,
                    }
                )
    return {"hanzi": hanzi, "write": write, "pinyinExtra": pinyin_extra}


def build_english() -> dict:
    pep = json.loads(PEP.read_text())
    words = []
    phrases = []
    phonetics = []
    seen_word: set[tuple] = set()
    seen_phrase: set[tuple] = set()
    w_i = p_i = ph_i = 0

    def add_word(row: dict, unit: str) -> None:
        nonlocal w_i, ph_i
        grade = int(row.get("grade") or 3)
        book = int(row.get("book") or 1)
        en = (row.get("en") or "").strip()
        zh = (row.get("zh") or "").strip()
        phonetic = (row.get("phonetic") or "").strip()
        if not en:
            return
        key = (grade, book, en.lower())
        if key in seen_word:
            return
        seen_word.add(key)
        w_i += 1
        item = {
            "id": f"en-w-{grade}-{book}-{w_i:04d}",
            "subject": "english",
            "grade": grade,
            "term": book,
            "unit": unit,
            "kind": "word",
            "title": en,
            "prompt": zh or en,
            "answer": en,
            "phonetic": phonetic,
            "hint": zh or en,
        }
        words.append(item)
        if phonetic:
            ph_i += 1
            phonetics.append(
                {
                    **item,
                    "id": f"en-ph-{grade}-{book}-{ph_i:04d}",
                    "kind": "phonetic",
                    "unit": "音标",
                    "prompt": phonetic,
                    "title": en,
                }
            )

    for row in pep:
        if row.get("kind") != "word":
            continue
        unit_no = int(row.get("unit") or 0)
        unit_title = (row.get("unit_title") or "").strip() or f"Unit {unit_no}"
        add_word(row, unit_title)
    for row in pep:
        if row.get("kind") != "vocab":
            continue
        add_word(row, "词汇表")
    for row in pep:
        if row.get("kind") != "expression":
            continue
        grade = int(row.get("grade") or 3)
        book = int(row.get("book") or 1)
        unit_no = int(row.get("unit") or 0)
        unit_title = (row.get("unit_title") or "").strip() or f"Unit {unit_no}"
        en = (row.get("en") or "").strip()
        zh = (row.get("zh") or "").strip()
        phonetic = (row.get("phonetic") or "").strip()
        if not en:
            continue
        key = (grade, book, unit_no, en.lower())
        if key in seen_phrase:
            continue
        seen_phrase.add(key)
        p_i += 1
        phrases.append(
            {
                "id": f"en-phs-{grade}-{book}-{p_i:04d}",
                "subject": "english",
                "grade": grade,
                "term": book,
                "unit": unit_title,
                "kind": "phrase",
                "title": en,
                "prompt": zh or en,
                "answer": en,
                "phonetic": phonetic,
                "hint": zh or en,
            }
        )
    return {"words": words, "phrases": phrases, "phonetics": phonetics}


def main() -> None:
    en = build_english()
    zh = build_chinese()
    EN_OUT.write_text(json.dumps(en, ensure_ascii=False, indent=2) + "\n")
    ZH_OUT.write_text(json.dumps(zh, ensure_ascii=False, indent=2) + "\n")
    print(
        "english",
        len(en["words"]),
        "phrases",
        len(en["phrases"]),
        "phonetics",
        len(en["phonetics"]),
        "hanzi",
        len(zh["hanzi"]),
        "write",
        len(zh["write"]),
        "pinyinExtra",
        len(zh["pinyinExtra"]),
    )


if __name__ == "__main__":
    main()
