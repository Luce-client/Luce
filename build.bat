@echo off
echo [Luce Client] Starting Docker Build...

docker build -t luce-builder .

echo [Luce Client] Running Maven Package...
docker run --rm -v "%cd%:/app" luce-builder mvn clean package

echo.
echo [Luce Client] Build Finished! Check target/luce-client-1.8.9.jar
pause
