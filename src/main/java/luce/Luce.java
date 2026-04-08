package luce;

import luce.module.ModuleManager;
import luce.ui.HUDManager;

public class Luce {
    
    public static final String NAME = "Luce Client";
    public static final String VERSION = "1.0 - Legacy 1.8.9";
    
    public static Luce INSTANCE;
    
    private ModuleManager moduleManager;
    private HUDManager hudManager;

    // This gets called by ASM inside Minecraft.startGame()
    public static void init() {
        INSTANCE = new Luce();
        INSTANCE.startClient();
    }

    private void startClient() {
        System.out.println("======================================");
        System.out.println("Starting " + NAME + " v" + VERSION);
        System.out.println("======================================");

        this.moduleManager = new ModuleManager();
        this.moduleManager.init();
        
        this.hudManager = new HUDManager();
    }

    // This gets called by ASM inside GuiIngame.renderGameOverlay()
    public static void onRenderHUD() {
        if (INSTANCE != null && INSTANCE.hudManager != null) {
            INSTANCE.hudManager.render();
        }
    }

    public ModuleManager getModuleManager() {
        return moduleManager;
    }

    public HUDManager getHudManager() {
        return hudManager;
    }
}
