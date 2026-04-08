package luce.asm;

import net.minecraft.launchwrapper.ITweaker;
import net.minecraft.launchwrapper.LaunchClassLoader;

import java.io.File;
import java.util.List;

public class LuceTweaker implements ITweaker {
    
    // 이 트위커는 바닐라/포지 실행 옵션을 가로채고 바이트코드 조작기를 등록합니다.
    @Override
    public void acceptOptions(List<String> args, File gameDir, File assetsDir, String profile) {
        System.out.println("[Luce Engine] Bootstrapping Luce Client Tweaker...");
        // 실행 옵션 전달을 여기서 추가 가공할 수 있습니다.
    }

    @Override
    public void injectIntoClassLoader(LaunchClassLoader classLoader) {
        System.out.println("[Luce Engine] Injecting LuceClassTransformer...");
        // 우리의 변형기를 클래스 로더에 주입하여 마인크래프트 핵심 클래스를 수정합니다.
        classLoader.registerTransformer("luce.asm.LuceClassTransformer");
    }

    @Override
    public String getLaunchTarget() {
        return "net.minecraft.client.main.Main";
    }

    @Override
    public String[] getLaunchArguments() {
        return new String[0];
    }
}
