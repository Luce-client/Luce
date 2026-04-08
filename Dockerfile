FROM maven:3.8.6-eclipse-temurin-8

# 작업 디렉토리 설정
WORKDIR /app

# 기본 유틸리티 설치 (선택 사항)
RUN apt-get update && apt-get install -y git zip unzip && rm -rf /var/lib/apt/lists/*

# 초기에는 소스를 복사하지 않고 껍데기만 만듭니다 
# (볼륨 마운트로 호스트의 파일시스템을 사용어 빌드 속도와 동기화를 챙김)
CMD ["mvn", "clean", "package"]
