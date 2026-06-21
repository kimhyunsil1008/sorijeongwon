#!/bin/bash

# 이 파일을 더블클릭하면 서버가 시작됩니다

cd "$(dirname "$0")"

echo "🎓 소리정원 서버 시작..."
echo ""
echo "✅ 주소: http://localhost:3000"
echo "✅ 핸드폰: http://[맥북IP]:3000"
echo ""
echo "📱 핸드폰에서 Safari를 열고 위 주소를 입력하세요"
echo "🔗 홈화면에 추가하면 앱처럼 사용 가능합니다"
echo ""
echo "⚠️  이 창을 닫으면 서버가 종료됩니다"
echo "종료하려면: Ctrl+C"
echo ""

npm start
