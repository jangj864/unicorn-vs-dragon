import disguise from "../imports/archive/unicorn-disguise.png";
import apartment from "../imports/archive/unicorn-apartment.png";
import escapeWide from "../imports/archive/unicorn-fire-escape-wide.png";

import rooftop from "../imports/archive/unicorn-rooftop.png";
import claw from "../imports/archive/claw-evidence.png";
import empire from "../imports/archive/dragon-empire-state.png";
import bridge from "../imports/archive/dragon-brooklyn-bridge.png";
import arch from "../imports/archive/dragon-washington-arch.png";
import liberty from "../imports/archive/dragon-liberty.png";

export const archiveEvidence = [
  [{ src: disguise, ko: "01-A · 거리에서 만난 이웃", en: "01-A · A neighbor on the sidewalk" }],
  [{ src: apartment, ko: "02-A · 함께 살던 아파트", en: "02-A · Sharing a city apartment" }, { src: rooftop, ko: "02-B · 옥상으로 넓힌 생활 공간", en: "02-B · A little more room on the roof" }],
  [{ src: escapeWide, ko: "03-A · 비상계단의 유니콘", en: "03-A · A unicorn on the fire escape" }],
  [{ src: claw, ko: "D-01 · 드래곤의 발톱 흔적", en: "D-01 · Dragon claw evidence" }],
  [{ src: empire, ko: "D-02A · 엠파이어 스테이트 출현", en: "D-02A · Empire State sighting" }, { src: bridge, ko: "D-02B · 브루클린 브리지 봉쇄", en: "D-02B · Brooklyn Bridge cordon" }],
  [{ src: arch, ko: "D-03A · 워싱턴 스퀘어 집결", en: "D-03A · Washington Square watch" }, { src: liberty, ko: "D-03B · 리버티섬의 신호", en: "D-03B · Signal from Liberty Island" }],
];

export const archiveStories = {
  ko: [
    { code: "UNICORN 01", title: "거리의 오랜 친구", lead: "유니콘은 원래 인간의 친구였다. 같은 동네에서 제법 잘 지냈다.", body: "아이들과 공원에서 놀고, 단골 가게 앞에서 이웃과 인사를 나눴다. 횡단보도에서는 누구보다 신호를 잘 지켰다. 이 사진은 그 시절을 기억하는 한 주민이 건넸다. 당시 사람들에게 유니콘은 전설보다 자주 마주치는 이웃에 가까웠다.", stamp: "FRIENDLY NEIGHBOR" },
    { code: "UNICORN 02", title: "룸메이트는 유니콘", lead: "함께 사는 건 즐거웠다. 집이 점점 좁게 느껴지기 전까지는.", body: "처음엔 소파 옆 한 자리면 충분했다. 하지만 가구가 늘자 유니콘이 돌아설 때마다 냉장고 문이 막혔다. 모두 편히 지내려고 옥상까지 생활 공간을 넓혔다. 집주인은 야외 라운지라고 불렀고, 유니콘은 빨래 건조대 옆이라고 불렀다.", stamp: "SHARED HOME" },
    { code: "UNICORN 03", title: "비상계단으로 밀려난 친구", lead: "집도 옥상도 비좁아지자, 유니콘은 비상계단에 머물게 됐다.", body: "이번엔 이웃들이 창가에 보이는 뿔을 위험하다고 했다. 어제까지 친구였는데 오늘은 민원 대상이었다. 결국 유니콘은 외출할 때 교통콘으로 뿔을 가리고 숨어 다녔다. 아무도 신고하지 않았다. 대신 지나가던 사람이 공사가 언제 끝나냐고 물었다.", stamp: "CONE UNDERCOVER" },
    { code: "DRAGON 01", title: "고양이치고는 큰 흔적", lead: "갑작스러운 드래곤 목격담이 늘더니, 이번에는 벽에 증거가 남았다.", body: "건물 외벽에 거대한 발톱 자국과 그을음이 발견됐다. 처음엔 대형 고양이로 접수됐지만 조사관은 그 '대형'에 밑줄을 세 번 그었다. 비슷한 흔적이 여러 블록에서 나왔다. 드래곤 출몰은 더 이상 한 번의 해프닝이 아니었다.", stamp: "DRAGON CONFIRMED" },
    { code: "DRAGON 02", title: "오늘도 드래곤 출몰", lead: "아침엔 엠파이어 스테이트, 저녁엔 브루클린 브리지. 출몰 신고가 쌓였다.", body: "전망대 위에 날개가 펼쳐진 지 몇 시간 만에 다리에서도 드래곤이 나타났다. 경찰은 현장으로 출동했고 시민들은 휴대폰을 들었다. 교통방송은 정체 원인에 드래곤을 추가했다. 예고 없는 출몰은 날마다 잦아지고 있었다.", stamp: "REPEATED SIGHTINGS" },
    { code: "DRAGON 03", title: "관광 코스가 수상하다", lead: "워싱턴 스퀘어에서 한 번, 자유의 여신상에서 또 한 번. 우연치고는 바빴다.", body: "드래곤의 출몰 지점을 연결하자 오래된 포탈망과 겹쳤다. 비상계단의 유니콘들이 보았던 맨홀 빛도 같은 위치였다. 관광 명소를 좋아하는 줄 알았는데, 목적지는 지하였던 모양이다. 조사국은 마지막 보고서에 긴급 도장을 찍었다.", stamp: "PORTAL NETWORK FOUND" },
  ],
  en: [
    { code: "UNICORN 01", title: "AN OLD NEIGHBOR", lead: "Unicorns were friends with humans, and familiar faces around the block.", body: "They played with children in the park, greeted the regulars outside shops, and were excellent at waiting for the walk signal. A resident supplied this photo while recalling those days. A unicorn was less a legend than a neighbor you kept running into.", stamp: "FRIENDLY NEIGHBOR" },
    { code: "UNICORN 02", title: "UNICORN ROOMMATE", lead: "Sharing a home was lovely—until there stopped being room to turn around.", body: "At first, a spot beside the sofa was enough. Then more furniture arrived, and every turn blocked the fridge. The roommates expanded their living space onto the roof. The landlord called it an outdoor lounge. The unicorn called it next to the laundry.", stamp: "SHARED HOME" },
    { code: "UNICORN 03", title: "OUT ON THE FIRE ESCAPE", lead: "When the apartment and roof grew crowded, the unicorn ended up on the fire escape.", body: "Now neighbors called the horn outside their windows dangerous. Yesterday a friend; today a complaint. To go outside unnoticed, the unicorn finally hid its horn under a traffic cone. Nobody reported it. Someone did ask when the roadworks would be finished.", stamp: "CONE UNDERCOVER" },
    { code: "DRAGON 01", title: "NOT A HOUSE CAT", lead: "Sudden dragon sightings kept coming. This time, they left marks.", body: "Huge claw marks and soot covered a wall. The first report said large cat. An investigator underlined large three times. Similar damage appeared several blocks away. These dragon visits were becoming a pattern, not a one-off incident.", stamp: "DRAGON CONFIRMED" },
    { code: "DRAGON 02", title: "ANOTHER DRAGON TODAY", lead: "Empire State by morning. Brooklyn Bridge by evening. Reports piled up.", body: "Hours after wings appeared above the observation deck, another dragon landed on the bridge. Police arrived; phones came out. Traffic reports added dragon to the list of delays. The unannounced appearances were growing more frequent every day.", stamp: "REPEATED SIGHTINGS" },
    { code: "DRAGON 03", title: "A SUSPICIOUS CITY TOUR", lead: "Washington Square, then the Statue of Liberty. A very busy coincidence.", body: "The sightings lined up with an old portal network—and the glowing manholes the unicorns on the fire escapes had seen. Investigators had assumed the dragons liked landmarks. Apparently, their destination was underground. The final report received an urgent stamp.", stamp: "PORTAL NETWORK FOUND" },
  ],
};