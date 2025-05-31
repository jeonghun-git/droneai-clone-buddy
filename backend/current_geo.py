import geocoder
import requests

# 현재 위치의 위경도 조회
g = geocoder.ip('me')
latitude, longitude = g.latlng
print(f"현재 위치: {latitude}, {longitude}")


# API 키와 현재 위치 설정
API_KEY = "1fe5b7f4350252cf9fe61fb5641bf724"  # 카카오 개발자 사이트에서 발급

radius = 1000         # 1km (미터 단위)

# 카테고리로 검색 (예: 음식점)
url = f"https://dapi.kakao.com/v2/local/search/category.json?category_group_code=FD6&x={longitude}&y={latitude}&radius={radius}"
headers = {"Authorization": f"KakaoAK {API_KEY}"}

response = requests.get(url, headers=headers)
data = response.json()

# 결과 처리
if data.get("documents"):
    for place in data["documents"]:
        print(f"장소명: {place['place_name']}")
        print(f"주소: {place['address_name']}")
        print(f"거리: {place['distance']}m")  # 현재 위치에서의 거리
        print("-" * 50)
else:
    print("검색 결과가 없습니다.")